import { useLayout } from '@/hooks/useLayout';
import { View, Text,  FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { getReviews, addLike, removeLike, baseUrl } from '@/services/review.service';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useSession } from '@/hooks/ctx';
import { useState, useEffect } from 'react';
import { Image } from 'expo-image';

type Review = {
  id: number;
  contenido: string;
  cant_me_gusta: number;
  calificacion: number;
  nombre: string;
  titulo: string;
  año: number;
  enlace_imagen: string;
  tipo: string;
  liked: boolean;
};

export default function ReviewScreen() {
  const { screenWidth } = useLayout();
  const paddingHorizontal = screenWidth * 0.02;
  const { session } = useSession();
  const gap = screenWidth * 0.02;
  const starSize = Math.floor((screenWidth * 0.45) / 6);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const limit = 15;

  const fetchReviews = async (reset = false) => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const currentSkip = reset ? 0 : skip;
      const data = await getReviews(currentSkip, limit, session!);
      setReviews(prev => reset ? data : [...prev, ...data]);
      setSkip(currentSkip + limit);
      if (data.length < limit) setHasMore(false);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(true);
  }, []);

    const handleLike = async (item: Review) => {
    const isLiked = item.liked;

    // optimistic update
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
        // revert on failure
        setReviews(prev => prev.map(r =>
        r.id === item.id && r.tipo === item.tipo
            ? { ...r, liked: isLiked, cant_me_gusta: r.cant_me_gusta + (isLiked ? 1 : -1) }
            : r
        ));
    }
    };

  const renderReview = ({ item }: { item: Review }) => (
    <View style={{ paddingHorizontal, gap,  }}>

        {/* Title row */}
        <View className='flex-row flex-wrap justify-between items-center' style={{ gap }}>
        <View className="flex-row items-center flex-wrap" style={{ gap }}>
            <Text className="text-white text-normal">{item.titulo}</Text>
            <Text className="text-white text-normal">{item.año}</Text>
        </View>
        <Text className="text-bone text-normal">{item.nombre}</Text>
        </View>

      {/* Image + comment */}
      <View className='flex-row items-center' style={{ gap }}>
        <Image
        source={{ uri: `${baseUrl}${item.enlace_imagen}` }}
        style={{ width: screenWidth * 0.26, height: screenWidth * 0.4, borderRadius: 10 }}
        contentFit="cover"
        cachePolicy="disk"
        placeholder={{ blurhash: 'L36tt6%M00Rj00of~qxuayj[ayj[' }}
        transition={200}
        accessible={false}
        />
        <View className="flex-1 ">
          <Text className="text-white text-normal">{item.contenido}</Text>
        </View>
      </View>

      {/* Stars + likes */}
      <View className='flex-row items-center justify-between' style={{ gap }}>
        <View className='flex-row items-center' style={{ gap }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <FontAwesome
              key={i}
              name="star"
              size={starSize}
              color={i < item.calificacion ? 'orange' : 'gray'}
            />
          ))}
        </View>
    <TouchableOpacity
    className='flex-row items-center'
    style={{ gap }}
    onPress={() => handleLike(item)}  
    >
    <Text className="text-white text-normal">{item.cant_me_gusta}</Text>
    <AntDesign
    name="heart"
    size={starSize}
    color={item.liked ? 'red' : 'white'}
    />
    </TouchableOpacity>
        </View>

      <View className="flex-row items-center h-0.5 bg-chocolate" />
    </View>
  );

  return (
    <View className="flex-1">
      <FlatList
        data={reviews}
        keyExtractor={(item, index) => `${item.tipo}-${item.id}-${index}`}
        renderItem={renderReview}
        onEndReached={() => fetchReviews()}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={
          <Text className="text-white text-intermediate" style={{ paddingHorizontal }}>
            Populares de la semana
          </Text>
        }
        ListFooterComponent={
          loading ? <ActivityIndicator color="white" /> : null
        }
        contentContainerStyle={{ gap }}
      />
    </View>
  );
}