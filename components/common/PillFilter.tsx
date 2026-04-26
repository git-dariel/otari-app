import { Pressable, Text, View } from 'react-native';

type PillFilterProps = {
  items: readonly string[];
  activeItem: string;
  onChange: (item: string) => void;
};

export function PillFilter({ items, activeItem, onChange }: PillFilterProps) {
  return (
    <View className="flex-row gap-2 pb-4" style={{ flexWrap: 'wrap' }}>
      {items.map((item) => {
        const isActive = item === activeItem;

        return (
          <Pressable
            accessibilityRole="button"
            key={item}
            className={`rounded-full px-4 py-3 ${isActive ? 'bg-forest-700' : 'bg-white'}`}
            onPress={() => onChange(item)}>
            <Text className={`text-sm font-bold ${isActive ? 'text-white' : 'text-slate-500'}`}>
              {item}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
