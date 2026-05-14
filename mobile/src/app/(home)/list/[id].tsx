import { View, FlatList, ActivityIndicator } from 'react-native';
import { Text } from "@react-native-ama/react-native";
import { Image } from 'expo-image';
import { useLayout } from '@/hooks/useLayout';
import ReturnButton from '@/components/ui/ReturnButton';
import { router, useLocalSearchParams } from 'expo-router';
import { getListById, baseUrl } from '@/services/list.service';
import { useSession } from '@/hooks/ctx';
import { useState, useEffect } from 'react';
import ImageButton from '@/components/ui/imageButton';

type ListItem = {
  id: number;
  nombre_lista: string;
  nombre_usuario: string;
  enlace_imagen: string;
  contenido_id: number;
  tipo: string; 
};

export default function ListDetailScreen() {
  const { headerHeight, screenWidth,  paddingHorizontal, paddingVertical } = useLayout();
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
        // deduplicate by contenido_id
        const unique = data.filter((item: ListItem, index: number, self: ListItem[]) =>
          index === self.findIndex(t => t.contenido_id === item.contenido_id)
        );
        setItems(unique);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const listName = items[0]?.nombre_lista ?? '';
  const listOwner = items[0]?.nombre_usuario ?? '';

  return (
    <View
      className='flex-1 bg-dark'
      accessible={false}
    >
      {/* Header */}
      <View
        className="items-start justify-end"
        style={{ padding: gap, gap, width: screenWidth, height: headerHeight }}
        accessible={false}
      >
        <ReturnButton
          label="Volver"
          onPress={() => router.back()}
        />
      </View>

      <View
        className="flex-1"
        style={{ paddingHorizontal, paddingVertical, gap }}
        accessible={false}
      >
        {/* List info — grouped as one readable unit */}
        {items.length > 0 && (
          <View
            accessible={true}
            accessibilityLabel={`Lista: ${listName}, hecha por ${listOwner}`}
          >
            <Text className="text-white text-intermediate" accessible={false}>{listName}</Text>
            <Text className="text-white text-petite" accessible={false}>Hecho por: {listOwner}</Text>
          </View>
        )}

        {/* Images grid */}
        {loading ? (
          <ActivityIndicator
            color="white"
            accessibilityLabel="Cargando contenido de la lista"
            accessibilityLiveRegion="polite"
          />
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => item.contenido_id.toString()}
            numColumns={3}
            columnWrapperStyle={{ gap }}
            contentContainerStyle={{ gap }}
            accessibilityLabel={`Cuadrícula de imágenes de la lista ${listName}, ${items.length} elementos`}
            renderItem={({ item, index }) => (
            <ImageButton
              source={{ uri: `${baseUrl}${item.enlace_imagen}` }}
              width={imgWidth}
              height={imgHeight}
              rounded="md"
              accessibilityLabel={`Imagen ${index + 1} de ${items.length} en la lista ${listName}`}
              accessibilityHint="Toca para ver más información"
              onPress={() => router.push(
                item.tipo === 'pelicula' 
                  ? `/movie/${item.contenido_id}` 
                  : `/show/${item.contenido_id}`
              )} // or /serie/ depending on tipo
            />
            )}
          />
        )}
      </View>
    </View>
  );
}