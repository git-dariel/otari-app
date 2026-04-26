import { MaterialIcons } from '@expo/vector-icons';
import { TextInput, View } from 'react-native';

type SearchBoxProps = {
  value: string;
  placeholder: string;
  onChangeText: (value: string) => void;
};

export function SearchBox({ value, placeholder, onChangeText }: SearchBoxProps) {
  return (
    <View className="mb-4 min-h-14 flex-row items-center gap-3 rounded-full bg-white px-5">
      <MaterialIcons name="search" size={22} color="#64748b" />
      <TextInput
        className="flex-1 text-base font-semibold text-ink"
        placeholder={placeholder}
        placeholderTextColor="#64748b"
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
}
