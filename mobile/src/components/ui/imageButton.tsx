import { Image, View, StyleSheet, ImageSourcePropType } from 'react-native';
import { Pressable } from "@react-native-ama/react-native";

type Props = {
  // Use ImageSourcePropType to support both {uri: ''} and require()
  source: ImageSourcePropType; 
  onPress: () => void;
  size?: number;
  rounded?: 'full' | 'md';
  icon?: React.ReactNode;
  accessibilityLabel: string;
  accessibilityHint?: string;
};

export default function ImageButton({
  source, onPress, size = 100,
  rounded = 'full', icon, accessibilityLabel, accessibilityHint
}: Props) {
  const radius = rounded === 'full' ? size / 2 : 12;

  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole="button"
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
    >
      <Image
        source={source} // Pass the source directly
        style={{ width: size, height: size, borderRadius: radius }}
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