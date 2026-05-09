import { ActivityIndicator, useWindowDimensions } from "react-native";
import { Pressable, Text } from "@react-native-ama/react-native";

type ButtonProps = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  bgColor?: string;
  textColor?: string;
  width?: number;
  height?: number;
};

export default function Button({ label, onPress, loading, disabled, bgColor = '#AA500F', textColor = 'white', width, height }: ButtonProps) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  return (
    <Pressable
      accessibilityLanguage="es"
      onPress={onPress}
      disabled={loading || disabled}
      accessibilityRole="button"
      accessibilityLiveRegion="polite"
      accessibilityLabel={label}
      accessibilityState={{ busy: loading, disabled: loading || disabled }}
      className="rounded-xl items-center justify-center"
      style={{
        backgroundColor: disabled ? '#431407' : bgColor,
        width,
        height,
        // only apply padding if no fixed width/height is given
        paddingHorizontal: width ? undefined : screenWidth * 0.04,
        paddingVertical: height ? undefined : screenHeight * 0.020,
      }}
    >
      {loading
        ? <ActivityIndicator color="white" />
        : <Text accessibilityLanguage="es" className="font-semibold text-normal" style={{ color: textColor }}>
            {label}
          </Text>
      }
    </Pressable>
  );
}