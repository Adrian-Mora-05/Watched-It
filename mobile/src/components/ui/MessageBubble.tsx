// components/ui/MessageBubble.tsx
import { View, Text, useWindowDimensions } from 'react-native';

type Props = {
  message: string;
  timestamp?: string;
  isOwn?: boolean;
  senderName?: string;
  accessibilityLabel?: string;
};

export default function MessageBubble({
  message,
  timestamp,
  isOwn = false,
  senderName,
  accessibilityLabel,
}: Props) {
  const { width } = useWindowDimensions();
  const scale = (size: number) => (width / 390) * size;

  return (
    <View
      className={`w-full flex-row ${isOwn ? 'justify-end' : 'justify-start'}`}
      style={{ paddingHorizontal: scale(12), paddingVertical: scale(4) }}
      accessible={false}
    >
      <View
        className={`max-w-[75%] rounded-2xl shadow-sm ${
          isOwn ? 'bg-bone rounded-tr-sm' : 'bg-bone rounded-tl-sm'
        }`}
        style={{ paddingHorizontal: scale(16), paddingVertical: scale(8) }}
        accessible={true}
        accessibilityRole="text"
        accessibilityLabel={
          accessibilityLabel ??
          `${isOwn ? 'You' : senderName ?? 'Other'}: ${message}${timestamp ? `, sent at ${timestamp}` : ''}`
        }
      >
        <Text
          className={`leading-snug ${isOwn ? 'text-dark' : 'text-dark'}`}
          style={{ fontSize: scale(15) }}
        >
          {message}
        </Text>

        {timestamp && (
          <Text
            className={`opacity-60 ${isOwn ? 'text-right text-dark' : 'text-left text-chocolate'}`}
            style={{ fontSize: scale(10), marginTop: scale(4) }}
            accessibilityElementsHidden
            importantForAccessibility="no"
          >
            {timestamp}
          </Text>
        )}
      </View>
    </View>
  );
}