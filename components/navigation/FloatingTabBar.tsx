import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Image } from 'expo-image';
import { BookOpen, FileText, Home } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Animated, Keyboard, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const tabMeta = {
  index: { label: 'Home', Icon: Home },
  learn: { label: 'Learn', Icon: BookOpen },
  documents: { label: 'Blogs', Icon: FileText },
};

const OTARI_HINTS = [
  'Need help understanding investing basics?',
  'Ask Otari for beginner-friendly guidance.',
  'Have a quick question about stocks or ETFs?',
  'Learn safer investing habits with Otari.',
];

export function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const aiRouteName = 'chatbot';
  const regularRoutes = state.routes.filter((route) => route.name !== aiRouteName);
  const aiRoute = state.routes.find((route) => route.name === aiRouteName);
  const aiRouteIndex = aiRoute
    ? state.routes.findIndex((route) => route.key === aiRoute.key)
    : -1;
  const isAiFocused = aiRouteIndex >= 0 && state.index === aiRouteIndex;
  const hintOpacity = useRef(new Animated.Value(0)).current;
  const hintTranslateY = useRef(new Animated.Value(6)).current;
  const [activeHint, setActiveHint] = useState(OTARI_HINTS[0]);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const hintIndexRef = useRef(0);
  const hintCycleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setIsKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  useEffect(() => {
    if (hintCycleTimeoutRef.current) {
      clearTimeout(hintCycleTimeoutRef.current);
      hintCycleTimeoutRef.current = null;
    }

    if (isAiFocused) {
      hintOpacity.stopAnimation();
      hintTranslateY.stopAnimation();
      hintOpacity.setValue(0);
      hintTranslateY.setValue(6);
      return;
    }

    const runCycle = () => {
      Animated.sequence([
        Animated.delay(2400),
        Animated.parallel([
          Animated.timing(hintOpacity, {
            toValue: 1,
            duration: 360,
            useNativeDriver: true,
          }),
          Animated.timing(hintTranslateY, {
            toValue: 0,
            duration: 360,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(4200),
        Animated.parallel([
          Animated.timing(hintOpacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(hintTranslateY, {
            toValue: 6,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ]).start(({ finished }) => {
        if (!finished || isAiFocused) {
          return;
        }

        hintIndexRef.current = (hintIndexRef.current + 1) % OTARI_HINTS.length;
        setActiveHint(OTARI_HINTS[hintIndexRef.current]);
        hintCycleTimeoutRef.current = setTimeout(runCycle, 0);
      });
    };

    hintOpacity.setValue(0);
    hintTranslateY.setValue(6);
    runCycle();

    return () => {
      if (hintCycleTimeoutRef.current) {
        clearTimeout(hintCycleTimeoutRef.current);
        hintCycleTimeoutRef.current = null;
      }
      hintOpacity.stopAnimation();
      hintTranslateY.stopAnimation();
      hintOpacity.setValue(0);
      hintTranslateY.setValue(6);
    };
  }, [hintOpacity, hintTranslateY, isAiFocused]);

  if (isKeyboardVisible) {
    return null;
  }

  return (
    <View
      pointerEvents="box-none"
      className="absolute left-0 right-0 items-center"
      style={{ bottom: Math.max(insets.bottom, 12) + 8 }}>
      <View className="mx-5 w-[92%] max-w-[440px] flex-row items-center gap-3">
        <View className="h-[76px] flex-1 flex-row items-center justify-between rounded-[32px] bg-white px-3 shadow-xl shadow-black/25">
          {regularRoutes.map((route) => {
            const routeIndex = state.routes.findIndex((stateRoute) => stateRoute.key === route.key);
            const isFocused = state.index === routeIndex;
            const options = descriptors[route.key]?.options;
            const meta = tabMeta[route.name as keyof typeof tabMeta];

            if (!meta) {
              return null;
            }

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            const Icon = meta.Icon;
            const color = isFocused ? '#1d4ed8' : '#94a3b8';

            return (
              <Pressable
                accessibilityLabel={options.tabBarAccessibilityLabel}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                className={`h-[62px] flex-1 items-center justify-center rounded-[26px] ${
                  isFocused ? 'bg-forest-50' : 'bg-transparent'
                }`}
                key={route.key}
                onPress={onPress}>
                <View className="h-8 w-10 items-center justify-center">
                  <Icon color={color} size={22} strokeWidth={isFocused ? 2.8 : 2.4} />
                </View>
                <Text
                  className={`mt-1 text-[11px] font-black ${
                    isFocused ? 'text-forest-700' : 'text-slate-400'
                  }`}>
                  {meta.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {aiRoute ? (
          <View className="relative h-[76px] w-[76px] items-center justify-center">
            {!isAiFocused ? (
              <Animated.View
                pointerEvents="none"
                className="absolute bottom-[84px] right-0 min-w-[190px] rounded-full bg-white px-2 py-1.5 shadow-sm shadow-black/10"
                style={{
                  opacity: hintOpacity,
                  transform: [{ translateY: hintTranslateY }],
                }}>
                <Text className="text-center text-[11px] font-bold text-forest-700">
                  {activeHint}
                </Text>
              </Animated.View>
            ) : null}

            <Pressable
              accessibilityLabel={descriptors[aiRoute.key]?.options.tabBarAccessibilityLabel ?? 'Ask Otari'}
              accessibilityRole="button"
              accessibilityState={isAiFocused ? { selected: true } : {}}
              className="h-[76px] w-[76px] items-center justify-center rounded-[28px] bg-white shadow-xl shadow-black/25"
              onPress={() => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: aiRoute.key,
                  canPreventDefault: true,
                });

                if (!isAiFocused && !event.defaultPrevented) {
                  navigation.navigate(aiRoute.name, aiRoute.params);
                }
              }}>
              <View
                className={`h-[60px] w-[60px] items-center justify-center rounded-[22px] ${
                  isAiFocused ? 'bg-forest-50' : 'bg-white'
                }`}>
                <Image
                  accessibilityLabel="Ask Otari tab"
                  contentFit="contain"
                  source={require('@/assets/character/character2.png')}
                  style={{ width: 52, height: 52 }}
                />
              </View>
            </Pressable>
          </View>
        ) : null}
      </View>
    </View>
  );
}
