import { Image } from 'expo-image';
import { View, StyleSheet, ImageSourcePropType } from 'react-native';
import { Pressable } from "@react-native-ama/react-native";

type Props = {
  source: ImageSourcePropType; 
  onPress: () => void;
  size?: number;
  width?: number;
  height?: number;
  rounded?: 'full' | 'md';
  icon?: React.ReactNode;
  accessibilityLabel: string;
  accessibilityHint?: string;
  borderColor?: string;
  borderWidth?: number;
};

export default function ImageButton({
  source, onPress, size = 100,
  width, height,
  rounded = 'full', icon, accessibilityLabel, accessibilityHint,
  borderColor, borderWidth = 3
}: Props) {
  const w = width ?? size;
  const h = height ?? size;
  const radius = rounded === 'full' ? Math.min(w, h) / 2 : 12;

  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole="button"
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
    >
      <Image
        source={source}
        style={{
          width: w,
          height: h,
          borderRadius: radius,
          borderWidth: borderColor ? borderWidth : 0,
          borderColor: borderColor ?? 'transparent',
        }}
        contentFit="cover"
        cachePolicy="memory-disk"
        placeholder={{ blurhash: 'L36tt6%M00Rj00of~qxuayj[ofof' }}
        transition={200}
        accessible={false}
      />
      {icon && (
        <View style={[styles.icon, { borderRadius: 999 }]}>
          {icon}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  icon: {
    position: 'absolute', bottom: 0, right: 0,
    width: 28, height: 28,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: '#e0e0e0',
  },
});