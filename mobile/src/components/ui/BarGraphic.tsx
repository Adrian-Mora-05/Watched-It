import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';

type BarGraphicProps = {
  ratings: {
    estrellas: number;
    cantidad: number;
  }[];
};

export default function BarGraphic({
  ratings,
}: BarGraphicProps) {
  const normalizedRatings = useMemo(() => {
    return [1, 2, 3, 4, 5].map((star) => ({
      estrellas: star,
      cantidad:
        ratings.find((r) => r.estrellas === star)?.cantidad || 0,
    }));
  }, [ratings]);

  const totalRatings = normalizedRatings.reduce(
    (acc, curr) => acc + curr.cantidad,
    0
  );

  const maxValue = Math.max(
    ...normalizedRatings.map((r) => r.cantidad),
    1
  );

  const [displayValue, setDisplayValue] =
    useState(totalRatings);

  return (
    <View style={styles.container}>
      {/* Bars */}
      <View style={styles.chartArea}>
        {normalizedRatings.map((item) => {
          const height =
            (item.cantidad / maxValue) * 140 + 20;

          return (
            <View
              key={item.estrellas}
              style={styles.barColumn}
            >
              <Pressable
                onPressIn={() =>
                  setDisplayValue(item.cantidad)
                }
                onPressOut={() =>
                  setDisplayValue(totalRatings)
                }
                style={[
                  styles.bar,
                  {
                    height,
                  },
                ]}
              />
            </View>
          );
        })}
      </View>

      {/* Right info */}
      <View style={styles.infoContainer}>
        <Text style={styles.totalLabel}>
          úmero Total de Calificaciones
        </Text>

        <Text style={styles.totalLabel}>
          Puntuacion
        </Text>

        <Text style={styles.totalNumber}>
          {displayValue}
        </Text>

        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Text
              key={star}
              style={styles.star}
            >
              ★
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1B0D02',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 4,
    width: '100%',
    height: 180,
  },

  chartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    flex: 1,
    height: '100%',
  },

  barColumn: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },

  bar: {
    width: 58,
    backgroundColor: '#D9D9D9',
  },

  infoContainer: {
    marginLeft: 16,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    paddingBottom: 4,
  },

  totalLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
  },

  totalNumber: {
    color: '#F59E0B',
    fontSize: 28,
    fontWeight: '800',
    marginTop: 4,
    marginBottom: 6,
  },

  starsRow: {
    flexDirection: 'row',
  },

  star: {
    color: '#F59E0B',
    fontSize: 18,
    marginRight: 2,
  },
});