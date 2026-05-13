import { View, FlatList, ActivityIndicator } from 'react-native';
import { Text } from "@react-native-ama/react-native";
import { Image } from 'expo-image';
import { useLayout } from '@/hooks/useLayout';
import ReturnButton from '@/components/ui/ReturnButton';
import { router, useLocalSearchParams } from 'expo-router';
import { getListById, baseUrl } from '@/services/list.service';
import { useSession } from '@/hooks/ctx';
import { useState, useEffect } from 'react';

type ListItem = {
  id: number;
  nombre_lista: string;
  nombre_usuario: string;
  enlace_imagen: string;
  contenido_id: number;
};

export default function ListDetailScreen() {
  const { headerHeight, screenWidth, headerPaddingBottom, paddingHorizontal, paddingVertical } = useLayout();
  const gap = screenWidth * 0.03;
  const { id } = useLocalSearchParams();
  const { session } = useSession();
  const imgWidth = screenWidth * 0.28;
  const imgHeight = imgWidth * 1.5;

  const [items, setItems] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const data = await getListById(Number(id), session!);
        setItems(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  return (
    <View className='flex-1 bg-dark'>
      {/* Header */}
      <View className="items-start justify-end" style={{ padding:gap,gap, width: screenWidth, height: headerHeight}}>
        <ReturnButton label="Volver" onPress={() => router.back()} />
      </View>

      <View className="flex-1" style={{ paddingHorizontal, paddingVertical, gap }}>
        {/* List info */}
        {items.length > 0 && (
          <>
            <Text className="text-white text-intermediate">{items[0].nombre_lista}</Text>
            <Text className="text-white text-petite">Hecho por: {items[0].nombre_usuario}</Text>
          </>
        )}

        {/* Images grid */}
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item, index) => `${item.contenido_id}-${index}`}
            numColumns={3} // ✅ 3 column grid
            columnWrapperStyle={{ gap }}
            contentContainerStyle={{ gap }}
            renderItem={({ item }) => (
              <Image
                source={{ uri: `${baseUrl}${item.enlace_imagen}` }}
                style={{ width: imgWidth, height: imgHeight, borderRadius: 8 }}
                contentFit="cover"
                cachePolicy="disk"
                placeholder={{ blurhash: 'L36tt6%M00Rj00of~qxuayj[ofof' }}
                transition={200}
                accessible={false}
              />
            )}
          />
        )}
      </View>
    </View>
  );
}