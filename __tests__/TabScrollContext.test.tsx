import {
  shouldShowTabLabels,
  computeFloatingTabBarMetrics,
  createAnimatedTabBarMetrics,
  SCROLL_THRESHOLD,
  TAB_BAR_EXPANDED_HEIGHT,
  TAB_BAR_COLLAPSED_HEIGHT,
  TAB_BAR_EXPANDED_WIDTH,
  TAB_BAR_COLLAPSED_WIDTH,
  TAB_BAR_EXPANDED_WIDTH_WIDE,
  TAB_BAR_COLLAPSED_WIDTH_WIDE,
  TAB_BAR_ANIMATION_DURATION,
  useTabScroll,
  TabScrollContext,
} from '@/context/TabScrollContext';
import { Animated } from 'react-native';

describe('TabScrollContext', () => {
  describe('Constants', () => {
    it('defines SCROLL_THRESHOLD equal to 24', () => {
      expect(SCROLL_THRESHOLD).toBe(24);
    });

    it('defines TAB_BAR_EXPANDED_HEIGHT equal to 64', () => {
      expect(TAB_BAR_EXPANDED_HEIGHT).toBe(64);
    });

    it('defines TAB_BAR_COLLAPSED_HEIGHT equal to 48', () => {
      expect(TAB_BAR_COLLAPSED_HEIGHT).toBe(48);
    });

    it('defines TAB_BAR_EXPANDED_WIDTH equal to 352', () => {
      expect(TAB_BAR_EXPANDED_WIDTH).toBe(352);
    });

    it('defines TAB_BAR_COLLAPSED_WIDTH equal to 270', () => {
      expect(TAB_BAR_COLLAPSED_WIDTH).toBe(270);
    });

    it('defines TAB_BAR_EXPANDED_WIDTH_WIDE equal to 460', () => {
      expect(TAB_BAR_EXPANDED_WIDTH_WIDE).toBe(460);
    });

    it('defines TAB_BAR_COLLAPSED_WIDTH_WIDE equal to 350', () => {
      expect(TAB_BAR_COLLAPSED_WIDTH_WIDE).toBe(350);
    });

    it('defines TAB_BAR_ANIMATION_DURATION equal to 200', () => {
      expect(TAB_BAR_ANIMATION_DURATION).toBe(200);
    });
  });

  describe('shouldShowTabLabels', () => {
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
    it('computes compact centered bar width, heights, and symmetrical horizontal offset on Android phones', () => {
      const metrics412 = computeFloatingTabBarMetrics(412);
      expect(metrics412.isWideScreen).toBe(false);
      expect(metrics412.barWidth).toBe(352);
      expect(metrics412.expandedWidth).toBe(352);
      expect(metrics412.collapsedWidth).toBe(270);
      expect(metrics412.barHorizontalOffset).toBe(30);
      expect(metrics412.expandedHorizontalOffset).toBe(30);
      expect(metrics412.collapsedHorizontalOffset).toBe(71);
      expect(metrics412.expandedHeight).toBe(64);
      expect(metrics412.collapsedHeight).toBe(48);

      const metrics360 = computeFloatingTabBarMetrics(360);
      expect(metrics360.barWidth).toBe(312);
      expect(metrics360.expandedWidth).toBe(312);
      expect(metrics360.collapsedWidth).toBe(270);
      expect(metrics360.barHorizontalOffset).toBe(24);
      expect(metrics360.expandedHorizontalOffset).toBe(24);
      expect(metrics360.collapsedHorizontalOffset).toBe(45);
      expect(metrics360.expandedHeight).toBe(64);
      expect(metrics360.collapsedHeight).toBe(48);
    });

    it('caps width and centers bar on wide tablet/desktop screens with expected heights and widths', () => {
      const metrics1024 = computeFloatingTabBarMetrics(1024);
      expect(metrics1024.isWideScreen).toBe(true);
      expect(metrics1024.barWidth).toBe(460);
      expect(metrics1024.expandedWidth).toBe(460);
      expect(metrics1024.collapsedWidth).toBe(350);
      expect(metrics1024.barHorizontalOffset).toBe(282);
      expect(metrics1024.expandedHorizontalOffset).toBe(282);
      expect(metrics1024.collapsedHorizontalOffset).toBe(337);
      expect(metrics1024.expandedHeight).toBe(64);
      expect(metrics1024.collapsedHeight).toBe(48);
    });
  });

  describe('TabBar Animated Height Interpolation', () => {
    it('interpolates smoothly from collapsed (48px) to expanded (64px) based on labelsVisibility', () => {
      const visibility = new Animated.Value(1);
      const height = visibility.interpolate({
        inputRange: [0, 1],
        outputRange: [TAB_BAR_COLLAPSED_HEIGHT, TAB_BAR_EXPANDED_HEIGHT],
      });

      // At top (visibility = 1): full 64px height with labels
      expect((height as any).__getValue()).toBe(64);

      // Scrolled down (visibility = 0): compact 48px height without labels
      visibility.setValue(0);
      expect((height as any).__getValue()).toBe(48);

      // Mid-transition (visibility = 0.5): exactly 56px
      visibility.setValue(0.5);
      expect((height as any).__getValue()).toBe(56);
    });
  });

  describe('createAnimatedTabBarMetrics', () => {
    it('smoothly scales both horizontally and vertically while preserving centering', () => {
      const visibility = new Animated.Value(1);
      const metrics = createAnimatedTabBarMetrics(visibility, 412);

      // Expanded state (at top)
      expect((metrics.tabBarWidth as any).__getValue()).toBe(352);
      expect((metrics.tabBarHorizontalOffset as any).__getValue()).toBe(30);
      expect((metrics.tabBarHeight as any).__getValue()).toBe(64);
      // Invariant: 2 * offset + width === screenWidth
      expect(
        2 * (metrics.tabBarHorizontalOffset as any).__getValue() +
          (metrics.tabBarWidth as any).__getValue(),
      ).toBe(412);

      // Collapsed state (scrolled down)
      visibility.setValue(0);
      expect((metrics.tabBarWidth as any).__getValue()).toBe(270);
      expect((metrics.tabBarHorizontalOffset as any).__getValue()).toBe(71);
      expect((metrics.tabBarHeight as any).__getValue()).toBe(48);
      expect(
        2 * (metrics.tabBarHorizontalOffset as any).__getValue() +
          (metrics.tabBarWidth as any).__getValue(),
      ).toBe(412);

      // Mid-transition (halfway scrolled)
      visibility.setValue(0.5);
      expect((metrics.tabBarWidth as any).__getValue()).toBe(311);
      expect((metrics.tabBarHorizontalOffset as any).__getValue()).toBe(50.5);
      expect((metrics.tabBarHeight as any).__getValue()).toBe(56);
      expect(
        2 * (metrics.tabBarHorizontalOffset as any).__getValue() +
          (metrics.tabBarWidth as any).__getValue(),
      ).toBe(412);
    });
  });

  describe('useTabScroll safe defaults', () => {
    it('returns safe fallback values when used outside TabScrollProvider', () => {
      const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const fallback = useTabScroll();
      spy.mockRestore();

      expect(fallback.isAtTop).toBe(true);
      expect(fallback.labelsVisibility).toBeInstanceOf(Animated.Value);
      expect(fallback.tabBarHeight).toBeDefined();
      expect((fallback.tabBarHeight as any).__getValue()).toBe(64);

      // Mutating visibility updates interpolated tabBarHeight
      fallback.labelsVisibility.setValue(0);
      expect((fallback.tabBarHeight as any).__getValue()).toBe(48);

      // Reset back to 1
      fallback.labelsVisibility.setValue(1);
      expect((fallback.tabBarHeight as any).__getValue()).toBe(64);

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
