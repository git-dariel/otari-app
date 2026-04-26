import { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

type AppCardProps = {
  children: ReactNode;
  className?: string;
  onPress?: () => void;
};

export function AppCard({ children, className = '', onPress }: AppCardProps) {
  const sharedClassName = `rounded-[28px] bg-white p-5 shadow-sm shadow-black/5 ${className}`;

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        className={sharedClassName}
        onPress={onPress}>
        {children}
      </Pressable>
    );
  }

  return <View className={sharedClassName}>{children}</View>;
}
