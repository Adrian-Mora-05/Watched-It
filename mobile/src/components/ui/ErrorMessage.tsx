import { useEffect, useRef } from "react";
import { Animated, View, Modal } from "react-native";
import { Text, Pressable } from "@react-native-ama/react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ErrorToastProps = {
  message?: string;
  visible: boolean;
  onDismiss: () => void;
};

export default function ErrorToast({ message, visible, onDismiss }: ErrorToastProps) {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

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
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
      onRequestClose={onDismiss}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Cerrar notificación"
        onPress={onDismiss}
        style={{ flex: 1 }}
      >
        <Animated.View
          style={{
            transform: [{ translateY: slideAnim }],
            opacity: opacityAnim,
            position: "absolute",
            top: insets.top + 12, // ← sits just below notch/camera bar
            left: 16,
            right: 16,
            zIndex: 999,
          }}
        >
          <View
            accessibilityRole="alert"
            accessibilityLiveRegion="assertive"
            className="flex-row items-center justify-between bg-red border border-red rounded-xl px-4 py-3 shadow-md"
          >
            <View className="flex-row items-center gap-2 flex-1 pr-2">
              <Text
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
                className="text-white text-base"
              >
                ⚠️
              </Text>
              <Text
                accessibilityLanguage="es"
                className="text-white text-lg flex-1"
              >
                {message}
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cerrar notificación de error"
              accessibilityHint="Cierra este mensaje de error"
              onPress={onDismiss}
              hitSlop={{ top: 18, bottom: 18, left: 15, right: 15 }}
              className="p-5"
            >
              <Text
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
                className="text-white text-lg font-bold"
              >
                ✕
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}