import AsyncStorage from '@react-native-async-storage/async-storage';
import { syncEngine } from '@/services/syncEngine';
import { supabase, isSupabaseConfigured } from '@/services/supabase';
import { authService } from '@/services/authService';
import { realtimeSync } from '@/services/realtimeSync';

jest.mock('@/services/supabase', () => {
  const fromMock = jest.fn();
  const authMock = {
    signOut: jest.fn().mockResolvedValue({ error: null }),
    getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
  };
  return {
    isSupabaseConfigured: jest.fn(),
    supabase: {
      from: fromMock,
      auth: authMock,
    },
  };
});

jest.mock('@/services/realtimeSync', () => ({
  realtimeSync: {
    startRealtimeSync: jest.fn(),
    stopRealtimeSync: jest.fn(),
  },
}));

describe('Sync & Auth Remediation Tests (Partition 3)', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
  });

  it('preserves mutations enqueued concurrently while flushOutbox is running', async () => {
    (isSupabaseConfigured as jest.Mock).mockReturnValue(true);

    // Mock executeMutation to simulate slow network operation
    let resolveFirstMutation: (() => void) | undefined;
    const slowPromise = new Promise<boolean>((resolve) => {
      resolveFirstMutation = () => resolve(true);
    });

    jest.spyOn(syncEngine, 'executeMutation').mockImplementationOnce(() => slowPromise);

    // Temporarily disable auto-flush so we control the flush execution
    (isSupabaseConfigured as jest.Mock).mockReturnValue(false);

    // Enqueue first item
    await syncEngine.enqueueMutation({
      entity: 'expense',
      operation: 'INSERT',
      entity_id: 'exp-in-flight',
      payload: { id: 'exp-in-flight', amount: 30 },
    });

    (isSupabaseConfigured as jest.Mock).mockReturnValue(true);

    // Start flush (in-flight)
    const flushPromise = syncEngine.flushOutbox();

    // While flush is in flight, enqueue second item
    await syncEngine.enqueueMutation({
      entity: 'expense',
      operation: 'INSERT',
      entity_id: 'exp-concurrent',
      payload: { id: 'exp-concurrent', amount: 50 },
    });

    // Complete the first mutation
    resolveFirstMutation!();
    await flushPromise;

    // The concurrent mutation MUST be preserved in the outbox
    const remainingOutbox = await syncEngine.getOutbox();
    expect(remainingOutbox.some((m) => m.entity_id === 'exp-concurrent')).toBe(true);
    expect(remainingOutbox.some((m) => m.entity_id === 'exp-in-flight')).toBe(false);
  });

  it('stops realtime listeners when user signs out', async () => {
    (isSupabaseConfigured as jest.Mock).mockReturnValue(true);

    await authService.signOut();

    expect(realtimeSync.stopRealtimeSync).toHaveBeenCalledTimes(1);
  });

  it('updates invite_code on supabase when family mutation is executed', async () => {
    (isSupabaseConfigured as jest.Mock).mockReturnValue(true);

    const eqMock = jest.fn().mockResolvedValue({ error: null });
    const updateMock = jest.fn().mockReturnValue({ eq: eqMock });
    (supabase.from as jest.Mock).mockReturnValue({
      update: updateMock,
    });

    const success = await syncEngine.executeMutation({
      id: 'mut-1',
      entity: 'family',
      operation: 'UPDATE',
      entity_id: 'fam-123',
      payload: { name: 'My Family', invite_code: 'NEW123' },
      retry_count: 0,
      created_at: new Date().toISOString(),
    });

    expect(success).toBe(true);
    expect(supabase.from).toHaveBeenCalledWith('families');
    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'My Family',
        invite_code: 'NEW123',
      }),
    );
    expect(eqMock).toHaveBeenCalledWith('id', 'fam-123');
  });

  it('sanitizes expense payload by stripping version and splits before upserting', async () => {
    (isSupabaseConfigured as jest.Mock).mockReturnValue(true);

    let capturedPayload: any;
    const upsertMock = jest.fn().mockImplementation((payload) => {
      capturedPayload = payload;
      return Promise.resolve({ error: null });
    });
    (supabase.from as jest.Mock).mockReturnValue({ upsert: upsertMock });

    const success = await syncEngine.executeMutation({
      id: 'mut-exp-sanitized',
      entity: 'expense',
      operation: 'INSERT',
      entity_id: 'exp-123',
      payload: {
        id: 'exp-123',
        amount: 45.5,
        version: 3,
        splits: [{ member_id: 'mem-1', amount: 45.5 }],
        description: 'Groceries',
      },
      retry_count: 0,
      created_at: new Date().toISOString(),
    });

    expect(success).toBe(true);
    expect(capturedPayload).toBeDefined();
    expect(capturedPayload.version).toBeUndefined();
    expect(capturedPayload.splits).toBeUndefined();
    expect(capturedPayload.amount).toBe(45.5);
    expect(capturedPayload.description).toBe('Groceries');
  });

  it('sanitizes member payload by stripping is_current_user and version before upserting', async () => {
    (isSupabaseConfigured as jest.Mock).mockReturnValue(true);

    let capturedPayload: any;
    const upsertMock = jest.fn().mockImplementation((payload) => {
      capturedPayload = payload;
      return Promise.resolve({ error: null });
    });
    (supabase.from as jest.Mock).mockReturnValue({ upsert: upsertMock });

    const success = await syncEngine.executeMutation({
      id: 'mut-mem-sanitized',
      entity: 'member',
      operation: 'INSERT',
      entity_id: 'mem-123',
      payload: {
        id: 'mem-123',
        display_name: 'Alice',
        is_current_user: true,
        version: 2,
      },
      retry_count: 0,
      created_at: new Date().toISOString(),
    });

    expect(success).toBe(true);
    expect(capturedPayload).toBeDefined();
    expect(capturedPayload.is_current_user).toBeUndefined();
    expect(capturedPayload.version).toBeUndefined();
    expect(capturedPayload.display_name).toBe('Alice');
  });
  it('re-attempts failed DLQ mutations when retryDeadLetterQueue is called', async () => {
    (isSupabaseConfigured as jest.Mock).mockReturnValue(false);

    await AsyncStorage.setItem(
      '@bert0ns_sync_dead_letter_queue',
      JSON.stringify([
        {
          id: 'dlq-rem-1',
          entity: 'expense',
          operation: 'INSERT',
          entity_id: 'exp-rem-1',
          payload: { id: 'exp-rem-1', amount: 99 },
          retry_count: 5,
          created_at: new Date().toISOString(),
        },
      ]),
    );

    expect(await syncEngine.getDeadLetterQueueCount()).toBe(1);

    const retryResult = await syncEngine.retryDeadLetterQueue();
    expect(retryResult.reattempted).toBe(1);
    expect(await syncEngine.getDeadLetterQueueCount()).toBe(0);

    const outbox = await syncEngine.getOutbox();
    expect(outbox.some((m) => m.id === 'dlq-rem-1' && m.retry_count === 0)).toBe(true);
  });
});
