import { ShieldAlert } from 'lucide-react-native';
import { Text, View } from 'react-native';

type RiskNoteProps = {
  notes: string[];
};

export function RiskNote({ notes }: RiskNoteProps) {
  return (
    <View className="rounded-app border border-forest-100 bg-white p-5">
      <View className="flex-row items-center gap-2">
        <ShieldAlert color="#1d4ed8" size={20} strokeWidth={2.6} />
        <Text className="text-base font-black text-ink">Risk context</Text>
      </View>
      {notes.map((note) => (
        <Text key={note} className="mt-3 text-base leading-6 text-slate-700">
          {note}
        </Text>
      ))}
    </View>
  );
}
