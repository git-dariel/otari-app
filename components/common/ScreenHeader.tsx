import { Text, View } from 'react-native';

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
};

export function ScreenHeader({ title, subtitle, eyebrow }: ScreenHeaderProps) {
  return (
    <View className="pb-5 pt-3">
      {eyebrow ? (
        <Text className="mb-2 text-xs font-black uppercase tracking-widest text-forest-600">
          {eyebrow}
        </Text>
      ) : null}
      <Text className="text-4xl font-black leading-tight text-ink">{title}</Text>
      {subtitle ? <Text className="mt-2 text-lg leading-7 text-slate-600">{subtitle}</Text> : null}
    </View>
  );
}
