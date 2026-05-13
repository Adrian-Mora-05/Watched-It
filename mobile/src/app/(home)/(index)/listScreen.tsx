import { View, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text } from "@react-native-ama/react-native";
import { Image } from 'expo-image';
import { getLists, baseUrl } from '@/services/list.service';
import { useSession } from '@/hooks/ctx';
import { useLayout } from '@/hooks/useLayout';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';

type ListItem = {
  id: number;
  nombre_lista: string;
  nombre_usuario: string;
  enlace_imagen: string;
};

type GroupedList = {
  id: number;
  nombre_lista: string;
  nombre_usuario: string;
  images: string[];
};

const groupLists = (data: ListItem[]): GroupedList[] => {
  const map: Record<number, GroupedList> = {};
  data.forEach(item => {
    if (!map[item.id]) {
      map[item.id] = {
        id: item.id,
        nombre_lista: item.nombre_lista,
        nombre_usuario: item.nombre_usuario,
        images: [],
      };
    }
    map[item.id].images.push(item.enlace_imagen);
  });
  return Object.values(map);
};

export default function ListScreen() {
  const { screenWidth } = useLayout();
  const paddingHorizontal = screenWidth * 0.02;
  const { session } = useSession();
  const gap = screenWidth * 0.02;
  const imgWidth = screenWidth * 0.25;
  const imgHeight = imgWidth * 1.5;

  const [lists, setLists] = useState<GroupedList[]>([]);
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const limit = 30;

  const fetchLists = async (reset = false) => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const currentSkip = reset ? 0 : skip;
      const data = await getLists(currentSkip, limit, session!);
      const grouped = groupLists(data);
      setLists(prev => reset ? grouped : [...prev, ...grouped]);
      setSkip(currentSkip + limit);
      if (data.length < limit) setHasMore(false);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLists(true);
  }, []);

  const renderList = ({ item }: { item: GroupedList }) => (
    <TouchableOpacity
      style={{ paddingHorizontal, gap }}
      className="flex-row items-center justify-between py-2"
      onPress={() => router.push(`/list/${item.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`Lista ${item.nombre_lista}, hecha por ${item.nombre_usuario}, ${item.images.length} ${item.images.length === 1 ? 'imagen' : 'imágenes'}`}
      accessibilityHint="Toca para ver el contenido de esta lista"
    >
      {/* Left: info - hidden from screen reader, parent handles it */}
      <View className="flex-1" accessible={false}>
        <Text className="text-white text-intermediate" accessible={false}>{item.nombre_lista}</Text>
        <Text className="text-white text-petite" accessible={false}>Hecho por: {item.nombre_usuario}</Text>
      </View>

      {/* Middle: stacked images - decorative, parent describes them */}
      <View
        style={{ width: imgWidth + (Math.min(item.images.length, 3) - 1) * (imgWidth * 0.4), height: imgHeight }}
        accessible={false}
      >
        {item.images.slice(0, 3).map((img, i) => (
          <Image
            key={i}
            source={{ uri: `${baseUrl}${img}` }}
            style={{
              width: imgWidth,
              height: imgHeight,
              borderRadius: 8,
              position: 'absolute',
              left: i * (imgWidth * 0.4),
              borderWidth: 2,
              borderColor: '#111',
            }}
            contentFit="cover"
            cachePolicy="disk"
            placeholder={{ blurhash: 'L36tt6%M00Rj00of~qxuayj[ofof' }}
            transition={200}
            accessible={false} 
          />
        ))}
        {item.images.length > 3 && (
          <View
            style={{
              position: 'absolute',
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.7)',
              borderRadius: 12,
              paddingHorizontal: 6,
              paddingVertical: 2,
            }}
            accessible={false} 
          >
            <Text className="text-white text-petite" accessible={false}>+{item.images.length - 3}</Text>
          </View>
        )}
      </View>

      {/* Right: arrow - decorative */}
      <MaterialIcons
        name="navigate-next"
        size={24}
        color="white"
        accessible={false} 
      />
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-dark" accessible={false}>
      <FlatList
        data={lists}
        keyExtractor={item => item.id.toString()}
        renderItem={renderList}
        onEndReached={() => fetchLists()}
        onEndReachedThreshold={0.5}
        accessibilityLabel="Lista de listas de películas y series" 
        ItemSeparatorComponent={() => (
          <View
            className="h-0.5 bg-chocolate"
            style={{ marginHorizontal: paddingHorizontal }}
            accessible={false} 
            importantForAccessibility="no"
          />
        )}
        ListFooterComponent={
          loading
            ? <ActivityIndicator
                color="white"
                accessibilityLabel="Cargando más listas"
                accessibilityLiveRegion="polite"
              />
            : null
        }
        contentContainerStyle={{ gap }}
      />
    </View>
  );
}