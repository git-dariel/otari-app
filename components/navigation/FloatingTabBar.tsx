import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Image } from 'expo-image';
import { BookOpen, FileText, Home, PlaySquare } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const tabMeta = {
  index: { label: 'Home', Icon: Home },
  learn: { label: 'Learn', Icon: BookOpen },
  videos: { label: 'Videos', Icon: PlaySquare },
  documents: { label: 'Docs', Icon: FileText },
};

export function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const aiRouteName = 'chatbot';
  const regularRoutes = state.routes.filter((route) => route.name !== aiRouteName);
  const aiRoute = state.routes.find((route) => route.name === aiRouteName);

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
          <Pressable
            accessibilityLabel={descriptors[aiRoute.key]?.options.tabBarAccessibilityLabel ?? 'Ask Otari'}
            accessibilityRole="button"
            accessibilityState={state.index === state.routes.findIndex((route) => route.key === aiRoute.key) ? { selected: true } : {}}
            className="h-[76px] w-[76px] items-center justify-center rounded-[28px] bg-white shadow-xl shadow-black/25"
            onPress={() => {
              const event = navigation.emit({
                type: 'tabPress',
                target: aiRoute.key,
                canPreventDefault: true,
              });

              const isFocused =
                state.index === state.routes.findIndex((route) => route.key === aiRoute.key);

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(aiRoute.name, aiRoute.params);
              }
            }}>
            <View
              className={`h-[60px] w-[60px] items-center justify-center rounded-[22px] ${
                state.index === state.routes.findIndex((route) => route.key === aiRoute.key)
                  ? 'bg-forest-50'
                  : 'bg-white'
              }`}>
              <Image
                accessibilityLabel="Ask Otari tab"
                contentFit="contain"
                source={require('@/assets/character/character2.png')}
                style={{ width: 52, height: 52 }}
              />
            </View>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
