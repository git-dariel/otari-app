import { CheckCircle2 } from 'lucide-react-native';
import { Text, View } from 'react-native';

type TakeawayListProps = {
  items: string[];
};

export function TakeawayList({ items }: TakeawayListProps) {
  return (
    <View className="gap-3">
      {items.map((item) => (
        <View key={item} className="flex-row gap-3">
          <CheckCircle2 color="#1d4ed8" size={22} strokeWidth={2.6} />
          <Text className="flex-1 text-base leading-6 text-slate-700">{item}</Text>
        </View>
      ))}
    </View>
  );
}
