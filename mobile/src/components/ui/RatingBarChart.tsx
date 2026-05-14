import { View, TouchableOpacity, Animated } from 'react-native';
import { Text } from '@react-native-ama/react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useState, useRef, useEffect } from 'react';
import { useLayout } from '@/hooks/useLayout';

type Props = {
  cant_1: number;
  cant_2: number;
  cant_3: number;
  cant_4: number;
  cant_5: number;
  total_calificaciones: number;
};

export default function RatingBarChart({
  cant_1, cant_2, cant_3, cant_4, cant_5, total_calificaciones
}: Props) {
  const counts = [cant_1, cant_2, cant_3, cant_4, cant_5];
  const max = Math.max(...counts, 1);
  const maxHeight = 80;
  const [displayCount, setDisplayCount] = useState<number | null>(null);
  const [activeBar, setActiveBar] = useState<number | null>(null);
  const animatedHeights = counts.map(() => useRef(new Animated.Value(0)).current);
  const {  screenWidth } = useLayout();
  const gap = screenWidth * 0.03;
  useEffect(() => {
    Animated.stagger(80, counts.map((count, i) =>
      Animated.spring(animatedHeights[i], {
        toValue: (count / max) * maxHeight,
        useNativeDriver: false,
        damping: 12,
      })
    )).start();
  }, [cant_1, cant_2, cant_3, cant_4, cant_5]);

  return (
    <View
    className=""
      accessible={true}
      accessibilityLabel={`Gráfico de calificaciones. Total: ${total_calificaciones}. ${counts.map((c, i) => `${i + 1} estrellas: ${c}`).join(', ')}`}
    >


      <View className="flex-row items-end justify-between" style={{ height: maxHeight, gap: 6 }}>
        {/* 1 star */}
        <FontAwesome name="star" size={10} color="#AA500F" accessible={false} />
        {/* Bars only */}
        {counts.map((count, i) => (
          <TouchableOpacity
            key={i}
            onPressIn={() => {
              setActiveBar(i);
              setDisplayCount(counts[i]);
            }}
            onPressOut={() => {
              setActiveBar(null);
              setDisplayCount(null);
            }}
            className="items-center flex-1"
            accessibilityRole="button"
            accessibilityLabel={`${i + 1} ${i === 0 ? 'estrella' : 'estrellas'}: ${count} calificaciones`}
            accessibilityHint="Mantén presionado para ver el total de este nivel"
            style={{ justifyContent: 'flex-end', height: maxHeight }}
          >
            <Animated.View
              style={{
                width: '100%',
                height: animatedHeights[i],
                backgroundColor: activeBar === i ? '#f59e0b' : '#D9D9D9',
                borderRadius: 4,
                minHeight: 4,
              }}
            />
          </TouchableOpacity>
        ))}
        {/*  number*/}
        <View className="items-center " style={{ gap }}>
          <Text
            className="text-white text-medium"
            accessibilityLiveRegion="polite"
            accessibilityLabel={
              displayCount !== null
                ? `${activeBar! + 1} estrellas: ${displayCount} calificaciones`
                : `Total: ${total_calificaciones} calificaciones`
            }
          >
            {displayCount !== null ? displayCount : total_calificaciones}
          </Text>
          {/* 5 stars */}
          <View className="flex-row" style={{ gap: 1 }}>
            {Array.from({ length: 5 }).map((_, s) => (
              <FontAwesome key={s} name="star" size={10} color="#AA500F" accessible={false} />
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}