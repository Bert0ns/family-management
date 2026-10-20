import {
  DashboardHeader,
  MonthlyStatementCard,
  MemberLedgerCard,
  RecentExpensesSection,
} from '@/components/dashboard';
jest.mock(
  'lucide-react-native',
  () =>
    new Proxy(
      {},
      {
        get: () => () => null,
      },
    ),
);

// Mock dependencies
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Platform: { OS: 'ios', select: (obj: any) => obj.ios || obj.default },
  };
});

jest.mock('@/theme', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        background: '#FFFFFF',
        surface: '#F8FAFC',
        surfaceSubtle: '#F1F5F9',
        surfaceElevated: '#FFFFFF',
        textPrimary: '#0F172A',
        textSecondary: '#475569',
        textMuted: '#94A3B8',
        brand: '#2563EB',
        brandLight: '#DBEAFE',
        border: '#E2E8F0',
        borderSubtle: '#F1F5F9',
        borderTactile: '#CBD5E1',
        cardBorder: '#E2E8F0',
        warning: '#F59E0B',
        warningBg: '#FEF3C7',
        success: '#10B981',
        successBg: '#D1FAE5',
      },
      isDark: false,
    },
    spacing: { xxs: 2, xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 40 },
    radius: { xs: 4, sm: 4, md: 4, lg: 4, xl: 4, pill: 9999, full: 9999 },
    typography: {
      fontSizes: { xs: 12, sm: 14, md: 16, lg: 18, xl: 20, xxl: 24, hero: 36 },
      fontWeights: {
        regular: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        heavy: '800',
      },
    },
  }),
  TABULAR_NUMS: { fontVariant: ['tabular-nums'] },
}));

jest.mock('@/i18n', () => ({
  useI18n: () => ({
    t: {
      common: { you: 'Tu', import: 'Importa', close: 'Chiudi' },
      dashboard: {
        householdOverview: 'Panoramica',
        thisMonthSpending: 'Spese del mese',
        totalTransactions: 'transazioni',
        quickAddButton: 'Nuova Spesa',
        bulkImportButton: 'Importa',
        dailyAverage: 'Media giornaliera',
        burnRatePerDay: 'al giorno',
        whereMoneyWent: 'Dove sono finiti i soldi',
        tapToFilter: 'Tocca per filtrare',
        txs: 'spese',
        whoPaidWhat: 'Chi ha speso cosa',
        familyMembers: 'Membri',
        ofTotal: 'del totale',
        recentExpenses: 'Spese recenti',
        viewAll: 'Vedi tutte',
        noExpensesMonth: 'Nessuna spesa questo mese',
        addFirstExpense: 'Aggiungi spesa',
        vsLastMonth: 'rispetto al mese scorso',
      },
      expenseDetail: { category: 'Categoria' },
      tabs: { family: 'Famiglia' },
    },
    locale: 'it',
  }),
  getLocalizedCategoryName: (cat: any) => cat?.name || '',
}));

jest.mock('@/components/common/SyncBadge', () => ({
  SyncBadge: () => null,
}));

jest.mock('@/components/common/PeriodSelector', () => ({
  PeriodSelector: () => null,
}));

describe('Dashboard Modular Components', () => {
  describe('DashboardHeader', () => {
    it('is exported and instantiable', () => {
      expect(DashboardHeader).toBeDefined();
      const element = (
        <DashboardHeader
          familyName="Famiglia Rossi"
          selectedPeriod="2026-10"
          onPeriodChange={jest.fn()}
        />
      );
      expect(element).toBeTruthy();
    });
  });

  describe('MonthlyStatementCard', () => {
    it('is exported and instantiable with metrics and category breakdown', () => {
      expect(MonthlyStatementCard).toBeDefined();
      const element = (
        <MonthlyStatementCard
          currency="€"
          transactionCount={12}
          decimalPart="50"
          formattedWhole="1.250"
          hasPreviousMonthComparison={true}
          isPacingHigher={false}
          isPacingLower={true}
          pacingPct={-5}
          dailyAverageBurn={41.68}
          categoryBreakdown={[]}
          topCategories={[]}
          onQuickAdd={jest.fn()}
          onImport={jest.fn()}
          onFilterByCategory={jest.fn()}
        />
      );
      expect(element).toBeTruthy();
    });
  });

  describe('MemberLedgerCard', () => {
    it('is exported and returns null when memberContributions is empty', () => {
      expect(MemberLedgerCard).toBeDefined();
      const rendered = MemberLedgerCard({
        memberContributions: [],
        currency: '€',
        onNavigateToFamily: jest.fn(),
        onFilterByMember: jest.fn(),
      });
      expect(rendered).toBeNull();
    });

    it('renders card when member contributions are present', () => {
      const rendered = MemberLedgerCard({
        memberContributions: [
          {
            member: {
              id: 'm1',
              family_id: 'f1',
              display_name: 'Mario',
              role: 'ADMIN',
              color_code: '#2563EB',
              created_at: '',
            },
            total: 350,
            percentage: 70,
          },
        ],
        currency: '€',
        onNavigateToFamily: jest.fn(),
        onFilterByMember: jest.fn(),
      });
      expect(rendered).not.toBeNull();
    });
  });

  describe('RecentExpensesSection', () => {
    it('is exported and instantiable with empty recent expenses', () => {
      expect(RecentExpensesSection).toBeDefined();
      const element = (
        <RecentExpensesSection
          groupedRecentExpenses={[]}
          totalExpensesCount={0}
          categoryMap={new Map()}
          memberMap={new Map()}
          currency="€"
          hasMoreTransactions={false}
          onOpenFullLedger={jest.fn()}
          onSelectExpense={jest.fn()}
          onAddFirstExpense={jest.fn()}
        />
      );
      expect(element).toBeTruthy();
    });
  });
});
