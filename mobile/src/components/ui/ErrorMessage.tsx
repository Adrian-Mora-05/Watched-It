// components/ui/ErrorToast.tsx
import { useEffect, useRef } from "react";
import { Animated, View } from "react-native";
import { Text, Pressable, } from "@react-native-ama/react-native";

type ErrorToastProps = {
  message?: string;
  visible: boolean;
  onDismiss: () => void;
};

export default function ErrorToast({ message, visible, onDismiss }: ErrorToastProps) {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 10,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!message) return null;

  return (
    <Animated.View
      style={{
        transform: [{ translateY: slideAnim }],
        opacity: opacityAnim,
        position: "absolute",
        top: 16,
        left: 16,
        right: 16,
        zIndex: 999,
      }}
    >
      <View
        accessibilityRole="alert"
        accessibilityLiveRegion="assertive"
        className="flex-row items-center justify-between bg-red-50 border border-red rounded-xl px-4 py-3 shadow-md"
      >
        {/* Icon + Message */}
        <View className="flex-row items-center gap-2 flex-1 pr-2">
          <Text
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            className="text-red text-base"
          >
            ⚠️
          </Text>
          <Text
            accessibilityLanguage="es"
            className="text-red text-base flex-1"
          >
            {message}
          </Text>
        </View>

        {/* Dismiss Button */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cerrar notificación de error"
          accessibilityHint="Cierra este mensaje de error"
          onPress={onDismiss}
          hitSlop={{ top: 15, bottom:  15, left:  15, right: 15}}
          className="p-5"
        >
          <Text
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            className="text-red text-lg font-bold"
          >
            ✕
          </Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}