import {
  shouldShowTabLabels,
  computeFloatingTabBarMetrics,
  SCROLL_THRESHOLD,
  useTabScroll,
  TabScrollContext,
} from '@/context/TabScrollContext';
import { Animated } from 'react-native';

describe('TabScrollContext', () => {
  describe('shouldShowTabLabels', () => {
    it('has SCROLL_THRESHOLD equal to 24', () => {
      expect(SCROLL_THRESHOLD).toBe(24);
    });

    it('returns true for negative scrollY (iOS bounce, e.g. -10)', () => {
      expect(shouldShowTabLabels(-10)).toBe(true);
    });

    it('returns true for scrollY = 0', () => {
      expect(shouldShowTabLabels(0)).toBe(true);
    });

    it('returns true for scrollY = 24 (at threshold)', () => {
      expect(shouldShowTabLabels(24)).toBe(true);
    });

    it('returns false for scrollY = 25 (above threshold)', () => {
      expect(shouldShowTabLabels(25)).toBe(false);
    });

    it('returns false for scrollY = 120 (scrolled down)', () => {
      expect(shouldShowTabLabels(120)).toBe(false);
    });

    it('supports custom threshold parameter', () => {
      expect(shouldShowTabLabels(30, 30)).toBe(true);
      expect(shouldShowTabLabels(31, 30)).toBe(false);
      expect(shouldShowTabLabels(-5, 10)).toBe(true);
      expect(shouldShowTabLabels(10, 10)).toBe(true);
      expect(shouldShowTabLabels(11, 10)).toBe(false);
    });
  });

  describe('computeFloatingTabBarMetrics', () => {
    it('computes compact centered bar width and symmetrical horizontal offset on Android phones', () => {
      const metrics412 = computeFloatingTabBarMetrics(412);
      expect(metrics412.isWideScreen).toBe(false);
      expect(metrics412.barWidth).toBe(352);
      expect(metrics412.barHorizontalOffset).toBe(30);

      const metrics360 = computeFloatingTabBarMetrics(360);
      expect(metrics360.barWidth).toBe(312);
      expect(metrics360.barHorizontalOffset).toBe(24);
    });

    it('caps width and centers bar on wide tablet/desktop screens', () => {
      const metrics1024 = computeFloatingTabBarMetrics(1024);
      expect(metrics1024.isWideScreen).toBe(true);
      expect(metrics1024.barWidth).toBe(460);
      expect(metrics1024.barHorizontalOffset).toBe(282);
    });
  });

  describe('useTabScroll safe defaults', () => {
    it('returns safe fallback values when used outside TabScrollProvider', () => {
      const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const fallback = useTabScroll();
      spy.mockRestore();

      expect(fallback.isAtTop).toBe(true);
      expect(fallback.labelsVisibility).toBeInstanceOf(Animated.Value);
      expect(typeof fallback.handleTabScroll).toBe('function');
      expect(typeof fallback.resetTabScroll).toBe('function');

      // Calling fallbacks should not throw
      expect(() => {
        fallback.handleTabScroll({ nativeEvent: { contentOffset: { y: 100 } } });
        fallback.resetTabScroll();
      }).not.toThrow();
    });

    it('provides context object and defaults', () => {
      expect(TabScrollContext).toBeDefined();
    });
  });
});
