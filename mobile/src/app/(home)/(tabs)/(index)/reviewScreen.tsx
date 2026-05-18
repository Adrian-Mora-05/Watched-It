import { useLayout } from '@/hooks/useLayout';
import { View, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text } from '@react-native-ama/react-native';
import { getReviews, addLike, removeLike, baseUrl } from '@/services/review.service';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useSession } from '@/hooks/ctx';
import { useState, useRef, useCallback, memo } from 'react';
import { router, useFocusEffect } from 'expo-router';
import ImageButton from '@/components/ui/imageButton';

type Review = {
  id: number;
  contenido: string;
  cant_me_gusta: number;
  id_contenido: number;
  calificacion: number;
  nombre: string;
  titulo: string;
  año: number;
  enlace_imagen: string;
  tipo: string;
  liked: boolean;
};

const ReviewItem = memo(({ item, onLike, screenWidth, gap, starSize, paddingHorizontal }: {
  item: Review;
  onLike: (item: Review) => void;
  screenWidth: number;
  gap: number;
  starSize: number;
  paddingHorizontal: number;
}) => (
  <View style={{ paddingHorizontal, gap }} accessible={false}>
    <View
      accessible={true}
      accessibilityLabel={`${item.titulo}, ${item.año}. Reseña de ${item.nombre}`}
      className='flex-row flex-wrap justify-between items-center'
      style={{ gap }}
    >
      <View className="flex-row items-center flex-wrap" style={{ gap }}>
        <Text className="text-white text-medium font-bold" accessible={false}>{item.titulo}</Text>
        <Text className="text-white text-normal" accessible={false}>{item.año}</Text>
      </View>
      <Text className="text-bone text-normal" accessible={false}>{item.nombre}</Text>
    </View>

    <View className='flex-row items-center' style={{ gap }}>
      <ImageButton
        source={{ uri: `${baseUrl}${item.enlace_imagen}` }}
        width={screenWidth * 0.26}
        height={screenWidth * 0.4}
        rounded="md"
        accessibilityLabel={`Ver detalles de ${item.tipo === 'pelicula' ? 'la película' : 'la serie'} ${item.titulo}`}
        accessibilityHint={`Toca para ver más información sobre ${item.titulo}`}
        onPress={() => {
          if (item.tipo === 'pelicula') {
            router.push(`/movie/${item.id_contenido}`);
          } else {
            router.push(`/show/${item.id_contenido}`);
          }
        }}
      />
      <View className="flex-1">
        <Text className="text-white text-normal" accessibilityLabel={`Comentario: ${item.contenido}`}>
          {item.contenido}
        </Text>
      </View>
    </View>

    <View className='flex-row items-center justify-between' style={{ gap }}>
      <View
        className='flex-row items-center'
        style={{ gap }}
        accessible={true}
        accessibilityLabel={`Calificación: ${item.calificacion} de 5 estrellas`}
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <FontAwesome
            key={i}
            name="star"
            size={starSize}
            color={i < item.calificacion ? '#AA500F' : 'gray'}
            accessible={false}
          />
        ))}
      </View>

      <TouchableOpacity
        className='flex-row items-center'
        style={{ gap }}
        onPress={() => onLike(item)}
        accessibilityRole="button"
        accessibilityLabel={
          item.liked
            ? `Quitar me gusta. ${item.cant_me_gusta} me gusta`
            : `Dar me gusta. ${item.cant_me_gusta} me gusta`
        }
        accessibilityState={{ checked: item.liked }}
        accessibilityHint={item.liked ? 'Toca para quitar el me gusta' : 'Toca para dar me gusta'}
      >
        <Text className="text-white text-normal" accessible={false}>{item.cant_me_gusta}</Text>
        <AntDesign
          name="heart"
          size={starSize}
          color={item.liked ? 'red' : 'white'}
          accessible={false}
        />
      </TouchableOpacity>
    </View>

    <View
        style={{ height: 1, marginBottom:gap, backgroundColor: '#5D3E14' }}
        accessible={false}
        importantForAccessibility="no"
    />
  </View>
));

export default function ReviewScreen() {
  const { screenWidth } = useLayout();
  const paddingHorizontal = screenWidth * 0.02;
  const { session } = useSession();
  const gap = screenWidth * 0.02;
  const starSize = Math.floor((screenWidth * 0.45) / 6);
  const loadingRef = useRef(false);
  const skipRef = useRef(0);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const limit = 15;

  const fetchReviews = async (reset = false) => {
    if (loadingRef.current) return;
    if (!reset && !hasMore) return;

    loadingRef.current = true;
    setLoading(true);

    try {
      const currentSkip = reset ? 0 : skipRef.current;
      const data = await getReviews(currentSkip, limit, session!);

      if (reset) {
        setReviews(data);
        skipRef.current = limit;
      } else {
        setReviews(prev => {
          const existingIds = new Set(prev.map(r => r.id));
          const newItems = data.filter((r: Review) => !existingIds.has(r.id));
          return [...prev, ...newItems];
        });
        skipRef.current = currentSkip + limit;
      }

      if (data.length < limit) setHasMore(false);
      else if (reset) setHasMore(true);

    } catch (e) {
      console.error(e);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setReviews([]);
      setHasMore(true);
      skipRef.current = 0;
      fetchReviews(true);
    }, [])
  )

  const handleLike = useCallback(async (item: Review) => {
    const isLiked = item.liked;

    setReviews(prev => prev.map(r =>
      r.id === item.id && r.tipo === item.tipo
        ? { ...r, liked: !isLiked, cant_me_gusta: r.cant_me_gusta + (isLiked ? -1 : 1) }
        : r
    ));

    try {
      if (isLiked) {
        await removeLike(item.id, item.tipo, session!);
      } else {
        await addLike(item.id, item.tipo, session!);
      }
    } catch (e) {
      setReviews(prev => prev.map(r =>
        r.id === item.id && r.tipo === item.tipo
          ? { ...r, liked: isLiked, cant_me_gusta: r.cant_me_gusta + (isLiked ? 1 : -1) }
          : r
      ));
    }
  }, [session]);

const renderReview = useCallback(({ item }: { item: Review }) => (
  <ReviewItem
    item={item}
    onLike={handleLike}
    screenWidth={screenWidth}
    gap={gap}
    starSize={starSize}
    paddingHorizontal={paddingHorizontal}
  />
), [handleLike, screenWidth, gap, starSize, paddingHorizontal]); 

  return (
    <View className="flex-1" accessible={false}>
      <FlatList
        data={reviews}
        keyExtractor={(item, index) => `${item.tipo}-${item.id}-${index}`}
        renderItem={renderReview}
        onEndReached={() => fetchReviews()}
        onEndReachedThreshold={0.5}
        initialNumToRender={15}
        maxToRenderPerBatch={15}
        windowSize={5}
        removeClippedSubviews={true}  
        updateCellsBatchingPeriod={50} 

        ListFooterComponent={
          loading
            ? <ActivityIndicator
                color="white"
                accessibilityLabel="Cargando más reseñas"
                accessibilityLiveRegion="polite"
              />
            : null
        }
        contentContainerStyle={{ gap }}
        accessibilityLabel="Lista de reseñas populares"
      />
    </View>
  );
}