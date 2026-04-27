import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, Text } from "react-native";

type AppButtonVariant = "primary" | "soft" | "ghost";
type AppButtonSize = "md" | "sm";

type AppButtonProps = {
  label: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  variant?: AppButtonVariant;
  size?: AppButtonSize;
  onPress?: () => void;
};

const VARIANT_CLASSNAME: Record<AppButtonVariant, string> = {
  primary: "bg-forest-600",
  soft: "bg-forest-50",
  ghost: "bg-transparent",
};

const SIZE_CLASSNAME: Record<AppButtonSize, string> = {
  md: "min-h-12 gap-2 px-5",
  sm: "min-h-9 gap-1.5 px-4",
};

const TEXT_SIZE_CLASSNAME: Record<AppButtonSize, string> = {
  md: "text-base",
  sm: "text-sm",
};

const ICON_SIZE: Record<AppButtonSize, number> = {
  md: 20,
  sm: 16,
};

export function AppButton({
  label,
  icon,
  variant = "primary",
  size = "md",
  onPress,
}: AppButtonProps) {
  const textColorClassName = variant === "primary" ? "text-white" : "text-forest-700";
  const iconColor = variant === "primary" ? "#ffffff" : "#1d4ed8";

  return (
    <Pressable
      accessibilityRole="button"
      className={`shrink-0 flex-row items-center justify-center rounded-full ${SIZE_CLASSNAME[size]} ${VARIANT_CLASSNAME[variant]}`}
      onPress={onPress}
    >
      {icon ? <MaterialIcons name={icon} size={ICON_SIZE[size]} color={iconColor} /> : null}
      <Text
        className={`font-bold ${TEXT_SIZE_CLASSNAME[size]} ${textColorClassName}`}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}
