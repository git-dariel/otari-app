import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable } from 'react-native';

export function BackButton() {
  return (
    <Pressable
      accessibilityLabel="Go back"
      accessibilityRole="button"
      className="mb-4 h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm shadow-black/10"
      onPress={() => router.back()}>
      <MaterialIcons name="arrow-back" size={24} color="#111827" />
    </Pressable>
  );
}
