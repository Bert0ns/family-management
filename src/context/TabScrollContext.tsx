import {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { Animated, Easing, type NativeSyntheticEvent, type NativeScrollEvent } from 'react-native';

export const SCROLL_THRESHOLD = 24;
export const TAB_BAR_EXPANDED_HEIGHT = 64;
export const TAB_BAR_COLLAPSED_HEIGHT = 48;
export const TAB_BAR_ANIMATION_DURATION = 200;

export function shouldShowTabLabels(
  scrollY: number,
  threshold: number = SCROLL_THRESHOLD,
): boolean {
  return scrollY <= threshold;
}

export function computeFloatingTabBarMetrics(windowWidth: number) {
  const isWideScreen = windowWidth >= 768;
  const horizontalMargin = isWideScreen ? 32 : 24;
  const maxBarWidth = isWideScreen ? 460 : 352;
  const barWidth = Math.max(280, Math.min(windowWidth - horizontalMargin * 2, maxBarWidth));
  const barHorizontalOffset = Math.max(horizontalMargin, (windowWidth - barWidth) / 2);
  const tabSlotWidth = (barWidth - 8) / 5;

  return {
    isWideScreen,
    barWidth,
    barHorizontalOffset,
    tabSlotWidth,
    expandedHeight: TAB_BAR_EXPANDED_HEIGHT,
    collapsedHeight: TAB_BAR_COLLAPSED_HEIGHT,
  };
}

export type TabScrollEvent =
  NativeSyntheticEvent<NativeScrollEvent> | { nativeEvent: { contentOffset: { y: number } } };

export interface TabScrollContextValue {
  labelsVisibility: Animated.Value;
  tabBarHeight: Animated.AnimatedInterpolation<number>;
  isAtTop: boolean;
  handleTabScroll: (event: TabScrollEvent) => void;
  resetTabScroll: () => void;
}

const defaultLabelsVisibility = new Animated.Value(1);
const defaultTabBarHeight = defaultLabelsVisibility.interpolate({
  inputRange: [0, 1],
  outputRange: [TAB_BAR_COLLAPSED_HEIGHT, TAB_BAR_EXPANDED_HEIGHT],
});

const defaultContextValue: TabScrollContextValue = {
  labelsVisibility: defaultLabelsVisibility,
  tabBarHeight: defaultTabBarHeight,
  isAtTop: true,
  handleTabScroll: () => {},
  resetTabScroll: () => {},
};

export const TabScrollContext = createContext<TabScrollContextValue>(defaultContextValue);

export function TabScrollProvider({ children }: { children: ReactNode }) {
  const [labelsVisibility] = useState(() => new Animated.Value(1));
  const [isAtTop, setIsAtTop] = useState(true);
  const isAtTopRef = useRef(true);

  const tabBarHeight = useMemo(
    () =>
      labelsVisibility.interpolate({
        inputRange: [0, 1],
        outputRange: [TAB_BAR_COLLAPSED_HEIGHT, TAB_BAR_EXPANDED_HEIGHT],
      }),
    [labelsVisibility],
  );

  const handleTabScroll = useCallback(
    (event: TabScrollEvent) => {
      const rawY = event?.nativeEvent?.contentOffset?.y ?? 0;
      // Clamp negative y (iOS bounce) as <= SCROLL_THRESHOLD
      const y = Math.max(0, rawY);
      const atTop = shouldShowTabLabels(y, SCROLL_THRESHOLD);

      if (atTop && !isAtTopRef.current) {
        isAtTopRef.current = true;
        setIsAtTop(true);
        Animated.timing(labelsVisibility, {
          toValue: 1,
          duration: TAB_BAR_ANIMATION_DURATION,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }).start();
      } else if (!atTop && isAtTopRef.current) {
        isAtTopRef.current = false;
        setIsAtTop(false);
        Animated.timing(labelsVisibility, {
          toValue: 0,
          duration: TAB_BAR_ANIMATION_DURATION,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }).start();
      }
    },
    [labelsVisibility],
  );

  const resetTabScroll = useCallback(() => {
    isAtTopRef.current = true;
    setIsAtTop(true);
    Animated.timing(labelsVisibility, {
      toValue: 1,
      duration: TAB_BAR_ANIMATION_DURATION,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [labelsVisibility]);

  const value = useMemo<TabScrollContextValue>(
    () => ({
      labelsVisibility,
      tabBarHeight,
      isAtTop,
      handleTabScroll,
      resetTabScroll,
    }),
    [labelsVisibility, tabBarHeight, isAtTop, handleTabScroll, resetTabScroll],
  );

  return <TabScrollContext.Provider value={value}>{children}</TabScrollContext.Provider>;
}

export function useTabScroll(): TabScrollContextValue {
  try {
    const context = useContext(TabScrollContext);
    return context ?? defaultContextValue;
  } catch {
    return defaultContextValue;
  }
}
