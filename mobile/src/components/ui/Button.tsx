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
  accessibilityLabel?: string;  
  accessibilityHint?: string;  
  accessibilityLanguage?: string; 
};

export default function Button({
  label,
  onPress,
  loading,
  disabled,
  bgColor = '#AA500F',
  textColor = 'white',
  width,
  height,
  accessibilityLabel,
  accessibilityHint,
  accessibilityLanguage = 'es',
}: ButtonProps) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  return (
    <Pressable
      accessibilityLanguage={accessibilityLanguage}
      onPress={onPress}
      disabled={loading || disabled}
      accessibilityRole="button"
      accessibilityLiveRegion="polite"
      accessibilityLabel={accessibilityLabel ?? label} // ✅ falls back to label if not provided
      accessibilityHint={accessibilityHint}            // ✅ passed through
      accessibilityState={{ busy: loading, disabled: loading || disabled }}
      className="rounded-xl items-center justify-center"
      style={{
        backgroundColor: disabled ? '#431407' : bgColor,
        width,
        height,
        minHeight: 44, 
        minWidth: 44,  
        paddingHorizontal: width ? undefined : screenWidth * 0.04,
        paddingVertical: height ? undefined : screenHeight * 0.020,
      }}
    >
      {loading
        ? <ActivityIndicator
            color="white"
            accessibilityLabel="Cargando"  
          />
        : <Text
            accessibilityElementsHidden    
            importantForAccessibility="no"
            className="font-semibold text-normal"
            style={{ color: textColor }}
          >
            {label}
          </Text>
      }
    </Pressable>
  );
}