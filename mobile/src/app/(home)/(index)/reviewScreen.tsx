import { useLayout } from '@/hooks/useLayout';
import { View, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text } from '@react-native-ama/react-native';
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
  };

  const renderReview = ({ item }: { item: Review }) => (

    <View
      style={{ paddingHorizontal, gap }}
      accessible={false}
    >
      {/* Title row */}

      <View
        accessible={true}
        accessibilityLabel={`${item.titulo}, ${item.año}. Reseña de ${item.nombre}`}
        className='flex-row flex-wrap justify-between items-center'
        style={{ gap }}
      >
        <View className="flex-row items-center flex-wrap" style={{ gap }}>
          <Text className="text-white text-normal" accessible={false}>{item.titulo}</Text>
          <Text className="text-white text-normal" accessible={false}>{item.año}</Text>
        </View>
        <Text className="text-bone text-normal" accessible={false}>{item.nombre}</Text>
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
          accessible={true}
          accessibilityLabel={`Imagen de ${item.titulo}`} 
        />
        <View className="flex-1">
          <Text
            className="text-white text-normal"
            accessibilityLabel={`Comentario: ${item.contenido}`} 
          >
            {item.contenido}
          </Text>
        </View>
      </View>

      {/* Stars + likes */}
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
              color={i < item.calificacion ? 'orange' : 'gray'}
              accessible={false} 
            />
          ))}
        </View>

        <TouchableOpacity
          className='flex-row items-center'
          style={{ gap }}
          onPress={() => handleLike(item)}
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
        className="flex-row items-center h-0.5 bg-chocolate"
        accessible={false} 
        importantForAccessibility="no"
      />
    </View>
  );

  return (
    <View className="flex-1" accessible={false}>
      <FlatList
        data={reviews}
        keyExtractor={(item, index) => `${item.tipo}-${item.id}-${index}`}
        renderItem={renderReview}
        onEndReached={() => fetchReviews()}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={
          <Text
            className="text-white text-intermediate"
            style={{ paddingHorizontal }}
            accessibilityRole="header"
          >
            Populares de la semana
          </Text>
        }
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