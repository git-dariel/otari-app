import { Inbox } from 'lucide-react-native';
import { Text, View } from 'react-native';

type StateProps = {
  title?: string;
  message: string;
};

export function EmptyState({ title = 'Nothing here yet', message }: StateProps) {
  return (
    <View className="items-center rounded-app bg-white p-8">
      <Inbox color="#1d4ed8" size={34} strokeWidth={2.4} />
      <Text className="mt-3 text-center text-lg font-black text-ink">{title}</Text>
      <Text className="mt-2 text-center text-base leading-6 text-slate-700">{message}</Text>
    </View>
  );
}

export function LoadingState({ message }: StateProps) {
  return <Text className="text-base text-slate-700">{message}</Text>;
}

export function ErrorState({ message }: StateProps) {
  return (
    <View className="rounded-app bg-red-50 p-5">
      <Text className="text-base font-bold text-danger">{message}</Text>
    </View>
  );
}
