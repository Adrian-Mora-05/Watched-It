import ReturnButton from '@/components/ui/ReturnButton';
import { View, ScrollView, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import { Text } from '@react-native-ama/react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useLayout } from '@/hooks/useLayout';
import { useSession } from '@/hooks/ctx';
import { getshowReviews } from '@/services/show.service';
import { addLike, removeLike } from '@/services/review.service';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useCallback, useRef, useState } from 'react';

type Review = {
  id: number;
  id_serie: number;
  contenido: string;
  cant_me_gusta: number;
  calificacion: number;
  nombre: string;
  total_likes: number;
  usuarios_que_dieron_like: string[] | null;
  liked: boolean;
};

export default function showReviewScreen() {
  const { headerHeight, screenWidth, paddingHorizontal, paddingVertical } = useLayout();
  const gap = screenWidth * 0.03;
  const starSize = Math.floor((screenWidth * 0.45) / 6);

  const { id, show_id, name } = useLocalSearchParams<{ id: string; show_id: string; name: string }>()
  const { session, user } = useSession();
  const token = session;
  const id_usuario = user?.id;

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loadingRef = useRef(false);
  const skipRef = useRef(0);
  const limit = 15;

  const fetchReviews = async (reset = false) => {
    if (loadingRef.current) return;
    if (!reset && !hasMore) return;

    loadingRef.current = true;
    setLoading(true);

    try {
      const currentSkip = reset ? 0 : skipRef.current;
      const data = await getshowReviews(Number(show_id), id_usuario!, currentSkip, limit)

      if (reset) {
        setReviews(data)
        skipRef.current = limit
      } else {
        setReviews(prev => {
          const existingIds = new Set(prev.map(r => r.id))
          const newItems = data.filter((r: Review) => !existingIds.has(r.id))
          return [...prev, ...newItems]
        })
        skipRef.current = currentSkip + limit
      }

      if (data.length < limit) setHasMore(false)
      else if (reset) setHasMore(true)

    } catch (e) {
      console.error(e)
    } finally {
      loadingRef.current = false
      setLoading(false)
    }
  }

  useFocusEffect(
    useCallback(() => {
      setReviews([])
      setHasMore(true)
      skipRef.current = 0
      fetchReviews(true)
    }, [show_id])
  )

  const handleLike = async (review: Review) => {
    const isLiked = review.liked

    setReviews(prev => prev.map(r =>
      r.id === review.id
        ? { ...r, liked: !isLiked, cant_me_gusta: r.cant_me_gusta + (isLiked ? -1 : 1) }
        : r
    ))

    try {
      if (isLiked) {
        await removeLike(review.id, 'serie', token!)
      } else {
        await addLike(review.id, 'serie', token!)
      }
    } catch (e) {
      setReviews(prev => prev.map(r =>
        r.id === review.id
          ? { ...r, liked: isLiked, cant_me_gusta: r.cant_me_gusta + (isLiked ? 1 : -1) }
          : r
      ))
    }
  }

  const renderReview = ({ item }: { item: Review }) => (
    <View style={{ gap, paddingHorizontal }}>
      <View className="flex-row items-center justify-between">
        <Text className="text-white text-normal font-bold">{item.nombre}</Text>
        <View className="flex-row items-center" style={{ gap }}>
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
      </View>

      <Text className="text-white text-normal">{item.contenido}</Text>

      <View className="flex-row items-center justify-end" style={{ gap }}>
        <TouchableOpacity
          className="flex-row items-center"
          style={{ gap }}
          onPress={() => handleLike(item)}
          accessibilityRole="button"
          accessibilityLabel={item.liked ? `Quitar me gusta. ${item.cant_me_gusta} me gusta` : `Dar me gusta. ${item.cant_me_gusta} me gusta`}
        >
          <Text className="text-white text-normal">{item.cant_me_gusta}</Text>
          <AntDesign
            name="heart"
            size={starSize}
            color={item.liked ? 'red' : 'white'}
            accessible={false}
          />
        </TouchableOpacity>
      </View>

      <View className="bg-chocolate w-full" style={{ height: 1, borderRadius: 8 }} />
    </View>
  )

  return (
    <View className="flex-1 bg-dark">
      {/* Header */}
      <View
        className="items-end justify-between flex-row"
        style={{ padding: gap, gap, width: screenWidth, height: headerHeight, marginHorizontal:gap }}
        accessible={false}
      >
        <ReturnButton label="Volver" onPress={() => router.back()} />
      </View>

      <Text
        className="text-white text-intermediate font-bold"
        style={{ paddingHorizontal, paddingVertical: paddingVertical / 2 }}
      >
        Reseñas de {name}
      </Text>

      <FlatList
        data={reviews}
        keyExtractor={(item) => `${item.id}`}
        renderItem={renderReview}
        onEndReached={() => fetchReviews()}
        onEndReachedThreshold={0.5}
        initialNumToRender={15}
        maxToRenderPerBatch={15}
        windowSize={5}
        contentContainerStyle={{ gap, paddingVertical }}
        ListFooterComponent={
          loading
            ? <ActivityIndicator color="white" />
            : null
        }
        ListEmptyComponent={
          !loading
            ? <Text className="text-bone text-normal" style={{ paddingHorizontal }}>Nadie ha escrito una reseña de esta película aún.</Text>
            : null
        }
      />
    </View>
  );
}