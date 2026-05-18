import { View, FlatList, TouchableOpacity, ActivityIndicator,} from 'react-native';
import { Text } from "@react-native-ama/react-native";
import { Image } from 'expo-image';
import { getMyLists, baseUrl,} from '@/services/list.service';
import { useSession } from '@/hooks/ctx';
import { useLayout } from '@/hooks/useLayout';
import { useState, useEffect, useCallback } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { FontAwesome, Ionicons } from '@expo/vector-icons';

type ListItem = {
  id: number;
  id_usuario: string;
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

const groupLists = (
  data: ListItem[]
): GroupedList[] => {
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

    map[item.id].images.push(
      item.enlace_imagen
    );
  });

  return Object.values(map);
};

export default function UserListsScreen() {
  const { screenWidth } = useLayout();
  const { session } = useSession();
  const paddingHorizontal = screenWidth * 0.02;
  const gap = screenWidth * 0.02;
  const imgWidth = screenWidth * 0.25;
  const imgHeight = imgWidth * 1.5;
  const [lists, setLists] = useState<GroupedList[]>([]);
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const limit = 30;

  const fetchLists = async (
    reset = false
  ) => {
    if (loading || !hasMore) return;

    setLoading(true);

    try {
      const currentSkip = reset ? 0 : skip;

      const data = await getMyLists(
        currentSkip,
        limit,
        session!
      );

      const grouped = groupLists(data);
      setLists(prev => {
        const merged = reset
          ? grouped
          : [...prev, ...grouped];

        const uniqueMap: Record<number, GroupedList> = {};

        merged.forEach(list => {
          uniqueMap[list.id] = list;
        });

        return Object.values(uniqueMap);
      });

      setSkip(currentSkip + limit);

      if (data.length < limit) {
        setHasMore(false);
      }

    } catch (e) {
      console.error(e);

    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setSkip(0);
      setHasMore(true);
      fetchLists(true);
    }, [session])
  );

  const renderList = ({
    item,
  }: {
    item: GroupedList;
  }) => (
    <TouchableOpacity
      style={{
        paddingHorizontal,
        gap,
      }}
      className="flex-row items-center justify-between py-2"
      onPress={() =>
        router.push(`./edit/${item.id}`)
      }
      accessibilityRole="button"
      accessibilityLabel={`Lista ${item.nombre_lista}, ${item.images.length} elementos`}
      accessibilityHint="Toca para ver esta lista"
    >
      {/* info */}
      <View
        className="flex-1"
        accessible={false}
      >
        <Text
          className="text-white text-intermediate"
          accessible={false}
        >
          {item.nombre_lista}
        </Text>

        <Text
          className="text-white text-petite"
          accessible={false}
        >
          Tu lista
        </Text>
      </View>

      {/* imágenes */}
      <View
        style={{
          width:
            imgWidth +
            (Math.min(
              item.images.length,
              3
            ) -
              1) *
              (imgWidth * 0.4),

          height: imgHeight,
        }}
        accessible={false}
      >
        {item.images
          .slice(0, 3)
          .map((img, i) => (
            <Image
              key={i}
              source={{
                uri: `${baseUrl}${img}`,
              }}
              style={{
                width: imgWidth,
                height: imgHeight,
                borderRadius: 8,
                position: 'absolute',
                left:
                  i * (imgWidth * 0.4),
                borderWidth: 2,
                borderColor: '#111',
              }}
              contentFit="cover"
              cachePolicy="disk"
              placeholder={{
                blurhash:
                  'L36tt6%M00Rj00of~qxuayj[ofof',
              }}
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
              backgroundColor:
                'rgba(0,0,0,0.7)',
              borderRadius: 12,
              paddingHorizontal: 6,
              paddingVertical: 2,
            }}
            accessible={false}
          >
            <Text
              className="text-white text-petite"
              accessible={false}
            >
              +{item.images.length - 3}
            </Text>
          </View>
        )}
      </View>

      <View
      style={{
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 50,
      }}
    >
      {/* EDIT BUTTON */}
      <TouchableOpacity
        onPress={() =>
          router.push(`./edit/${item.id}`)
        }
        style={{
          padding: 6,
          backgroundColor: '#5D3E14',
          borderRadius: 8,
        }}
        accessibilityRole="button"
        accessibilityLabel="Editar lista"
      >
      <Ionicons name="pencil" size={20} color="white" />
      </TouchableOpacity>
    </View>
        </TouchableOpacity>
      );

  return (
    <View
      className="flex-1 bg-dark"
      accessible={false}
    >
      <FlatList
        data={lists}
        keyExtractor={item =>
          item.id.toString()
        }
        renderItem={renderList}
        onEndReached={() =>
          fetchLists()
        }
        onEndReachedThreshold={0.5}
        accessibilityLabel="Tus listas personalizadas"
        ItemSeparatorComponent={() => (
          <View
            className="h-0.5 bg-chocolate"
            style={{
              marginHorizontal:
                paddingHorizontal,
            }}
            accessible={false}
            importantForAccessibility="no"
          />
        )}
        ListFooterComponent={
          loading ? (
          <View className="flex-1 bg-dark items-center" style={{marginTop:250}}>
            <ActivityIndicator
              size="large" 
              color="#fff"
              accessibilityLabel="Cargando listas"
              accessibilityLiveRegion="polite"
            />
            </View>
          ) : null
        }
        ListEmptyComponent={
          !loading ? (
            <View className="flex-1 items-center justify-center mt-20">
              <Text className="text-white text-2xl font-bold text-center">
                No tienes listas todavía
              </Text>
            </View>
          ) : null
        }
        contentContainerStyle={{
          gap,
          paddingBottom: 30,
        }}
      />

      <TouchableOpacity
      onPress={() => router.push("/createlist")}
      activeOpacity={0.85}
      className="absolute bottom-0.5 left-1 bg-orange w-16 h-16 rounded-full items-center justify-center"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 8,
      }}
    >
      <FontAwesome name="plus" size={22} color="#fff" />
    </TouchableOpacity>
        </View>  
  );
}