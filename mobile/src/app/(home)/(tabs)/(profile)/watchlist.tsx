import { useEffect, useState, useMemo } from "react";
import { View, FlatList, ActivityIndicator, ScrollView } from "react-native";
import { Text } from "@react-native-ama/react-native";
import { useSession } from "@/hooks/ctx";
import { useLayout } from "@/hooks/useLayout";
import { getPorVer, baseUrl } from "@/services/list.service";
import ImageButton from "@/components/ui/imageButton";
import { router } from "expo-router";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";


type WatchItem = {
  lista_id: number;
  id_usuario: string;
  nombre: string;
  tipo: "pelicula" | "serie";
  contenido_id: number;
  contenido_titulo: string;
  contenido_imagen: string;
  fecha_creacion: string;
};

type GroupedList = {
  id: number;
  nombre_lista: string;
  peliculas: {
    contenido_id: number;
    imagen: string;
  }[];
  series: {
    contenido_id: number;
    imagen: string;
  }[];
};

export default function WatchlistScreen() {
  const { movieCardWidth, movieCardHeight, headerHeight } = useLayout();

  const [data, setData] = useState<WatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { session } = useSession();

  useFocusEffect(
    useCallback(() => {
      if (!session) return;
      setData([]);
      setLoading(true);
      load(session);
    }, [session])
  );
  const load = async (token: string) => {
    try {
      setLoading(true);
      const res = await getPorVer(0, 50, token);
      setData(res);
    } catch (err) {
      console.log("ERROR WATCHLIST:", err);
    } finally {
      setLoading(false);
    }
  };

  const groupedData = useMemo<GroupedList[]>(() => {
    const map: Record<number, GroupedList> = {};

    data.forEach((item) => {
      if (!map[item.lista_id]) {
        map[item.lista_id] = {
          id: item.lista_id,
          nombre_lista: item.nombre,
          peliculas: [],
          series: [],
        };
      }

      if (item.tipo === "pelicula") {
        map[item.lista_id].peliculas.push({
          contenido_id: item.contenido_id,
          imagen: item.contenido_imagen,
        });
      }

      if (item.tipo === "serie") {
        map[item.lista_id].series.push({
          contenido_id: item.contenido_id,
          imagen: item.contenido_imagen,
        });
      }
    });

    return Object.values(map);
  }, [data]);

  const Section = ({ item }: { item: GroupedList }) => (
    <View className="mb-10">

      {/* PELÍCULAS */}
      {item.peliculas.length > 0 && (
        <>
          <Text className="text-white mb-2 font-bold text-medium">Películas</Text>
          <FlatList
            data={item.peliculas}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(i, index) => `${item.id}-pelicula-${i.contenido_id}-${index}`}
            contentContainerStyle={{ gap: 12 }}
            renderItem={({ item: pelicula, index }) => (
              <ImageButton
                source={{ uri: `${baseUrl}${pelicula.imagen}` }}
                width={movieCardWidth}
                height={movieCardHeight}
                rounded="md"
                accessibilityLabel={`Película ${index + 1} de ${item.peliculas.length}`}
                accessibilityHint="Toca para ver más información"
                onPress={() => router.push(`/movie/${pelicula.contenido_id}`)}
              />
            )}
          />
        </>
      )}

      {/* SERIES */}
      {item.series.length > 0 && (
        <>
          <Text className="text-white font-bold text-medium mt-4 mb-2">Series</Text>
          <FlatList
            data={item.series}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(i, index) => `${item.id}-serie-${i.contenido_id}-${index}`}
            contentContainerStyle={{ gap: 12 }}
            renderItem={({ item: serie, index }) => (
              <ImageButton
                source={{ uri: `${baseUrl}${serie.imagen}` }}
                width={movieCardWidth}
                height={movieCardHeight}
                rounded="md"
                accessibilityLabel={`Serie ${index + 1} de ${item.series.length}`}
                accessibilityHint="Toca para ver más información"
                onPress={() => router.push(`/show/${serie.contenido_id}`)}
              />
            )}
          />
        </>
      )}
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 bg-dark items-center justify-center">
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (groupedData.length === 0) {
    return (
      <View className="flex-1 bg-dark items-center justify-center px-6">
        <Text className="text-white text-2xl font-bold text-center">
          Tu watchlist está vacía
        </Text>
        <Text className="text-gray-400 text-center mt-3">
          Agrega películas o series a "por ver" para verlas aquí
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-dark">
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="px-5"
        contentContainerStyle={{ paddingBottom: headerHeight * 0.5 }}
      >
        {groupedData.map((item) => (
          <Section key={item.id} item={item} />
        ))}
      </ScrollView>
    </View>
  );
}