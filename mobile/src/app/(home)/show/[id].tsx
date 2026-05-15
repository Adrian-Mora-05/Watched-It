import { View, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Text } from '@react-native-ama/react-native';
import { useLayout } from '@/hooks/useLayout';
import RatingBarChart from '@/components/ui/RatingBarChart';
import ReturnButton from '@/components/ui/ReturnButton';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AntDesign from '@expo/vector-icons/AntDesign';
import Button from '@/components/ui/Button';
import { useSession } from '@/hooks/ctx';
import { getShowById, baseUrl } from '@/services/show.service';
import { addToList, removeFromList } from '@/services/list.service';
import { addLike, removeLike } from '@/services/review.service';
import { useCallback, useState } from 'react';

export default function ShowScreen() {
  const { headerHeight, screenWidth, paddingHorizontal, paddingVertical } = useLayout();
  const gap = screenWidth * 0.03;
  const imgWidth = screenWidth * 0.28;
  const imgHeight = imgWidth * 1.5;

  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const { session, user } = useSession();
  const token = session;
  const id_user = user?.id;

  const [show, setshow] = useState<any>(null);
  const [calificaciones, setCalificaciones] = useState<any>(null);
  const [resenas, setResenas] = useState<any[]>([]);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [loading, setLoading] = useState(true);
  const [watchlistLoading, setWatchlistLoading] = useState(false);

  const fetchshow = async () => {
    try {
      const data = await getShowById(Number(id), id_user!, name)
      setshow(data[0])
      setCalificaciones(data.calificaciones[0])
      setResenas(data.resenas)
      setIsInWatchlist(data.isInWatchlist)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useFocusEffect(
    useCallback(() => {
      setshow(null)
      setCalificaciones(null)
      setResenas([])
      setIsInWatchlist(false)
      setLoading(true)
      fetchshow()
    }, [id])
  )

  const handleWatchlist = async () => {
    setWatchlistLoading(true)
    try {

      if (isInWatchlist) {
        await removeFromList(token!, Number(id), { tipo: 'serie', nombre_lista: 'por_ver' })
        setIsInWatchlist(false)
      } else {
        await addToList(token!, Number(id), { tipo: 'serie', nombre_lista: 'por_ver' })
        setIsInWatchlist(true)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setWatchlistLoading(false)
    }
  }

  const handleLike = async (resena: any) => {
    const isLiked = resena.liked

    setResenas(prev => prev.map(r =>
      r.id === resena.id
        ? { ...r, liked: !isLiked, cant_me_gusta: r.cant_me_gusta + (isLiked ? -1 : 1) }
        : r
    ))

    try {
      if (isLiked) {
        await removeLike(resena.id, 'serie', token!)
      } else {
        await addLike(resena.id, 'serie', token!)
      }
    } catch (e) {
      setResenas(prev => prev.map(r =>
        r.id === resena.id
          ? { ...r, liked: isLiked, cant_me_gusta: r.cant_me_gusta + (isLiked ? 1 : -1) }
          : r
      ))
    }
  }

  if (loading) return <ActivityIndicator className="flex-1 bg-dark" color="white" />

  return (
    <View className="flex-1 bg-dark">
      {/* Header */}
      <View
        className="items-end justify-between flex-row"
        style={{ padding: gap, gap, width: screenWidth, height: headerHeight }}
        accessible={false}
      >
        <ReturnButton label="Volver" onPress={() => router.back()} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal, paddingVertical: paddingVertical / 2, gap: gap * 2 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Basic Info */}
        <View>
          <View className="flex-row">
            {/* Text Info */}
            <View style={{ gap }} className="w-3/4 justify-start">
              <Text className="text-white text-intermediate font-bold flex-wrap">{show?.titulo}</Text>
              <Text className="text-white text-medium font-bold" style={{ marginBottom: gap }}>{show?.anio_inicio} - {show?.anio_fin ? show?.anio_fin : 'Presente'}</Text>
              <View className="justify-start" style={{ gap }}>
                <View className="flex-row">
                  <Text className="text-white text-normal font-bold">Cantidad de temporadas: </Text>
                  <Text className="text-white text-normal">{show?.cant_temporadas}</Text>
                </View>
                <View className="flex-row">
                  <Text className="text-white text-normal font-bold">Origen: </Text>
                  <Text className="text-white text-normal">{show?.pais}</Text>
                </View>
                <View className="flex-row">
                  <Text className="text-white text-normal font-bold">Género: </Text>
                  <Text className="text-white text-normal">{show?.genero}</Text>
                </View>
                <View className="flex-row">
                  <Text className="text-white text-normal font-bold">Calificación: </Text>
                  <Text className="text-white text-normal">{show?.restriccion_edad ? '+18' : 'Apta para todo público'}</Text>
                </View>
              </View>
            </View>

            {/* Poster and watchlist button */}
            <View style={{ gap }} className="w-1/4 items-end">
              <TouchableOpacity
                onPress={handleWatchlist}
                disabled={watchlistLoading}
                className="flex-row items-center"
                style={{ gap }}
              >
                {watchlistLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Text className="text-white text-normal">
                      {isInWatchlist ? 'Guardado' : 'Guardar'}
                    </Text>
                    <AntDesign
                      name={isInWatchlist ? 'close-circle' : 'check-circle'}
                      size={24}
                      color="white"
                      accessible={false}
                    />
                  </>
                )}
              </TouchableOpacity>
              <Image
                source={{ uri: `${baseUrl}${show?.enlace_imagen}` }}
                style={{ width: imgWidth, height: imgHeight, borderRadius: 8 }}
              />
            </View>
          </View>

          {/* Sinopsis */}
          <Text className="text-white text-normal" style={{ marginTop: gap }}>
            {show?.sinopsis}
          </Text>
        </View>

        <View className="bg-chocolate w-full" style={{ height: 1, borderRadius: 8 }} />

        {/* Ratings */}
        <Text className="text-white text-intermediate font-bold">Puntuaciones</Text>
        {calificaciones && calificaciones.total_calificaciones > 0 ? (
          <RatingBarChart
            cant_1={calificaciones.cant_1}
            cant_2={calificaciones.cant_2}
            cant_3={calificaciones.cant_3}
            cant_4={calificaciones.cant_4}
            cant_5={calificaciones.cant_5}
            total_calificaciones={calificaciones.total_calificaciones}
          />
        ) : (
          <Text className="text-bone text-medium">Nadie ha calificado esta serie aún.</Text>
        )}

        <View className="bg-chocolate w-full" style={{ height: 1, borderRadius: 8 }} />

        {/* Reviews */}
        <Text className="text-white text-intermediate font-bold">Reseñas</Text>
        {resenas.length === 0 ? (
          <Text className="text-bone text-medium">Nadie ha escrito una reseña de esta serie aún.</Text>
        ) : (
          <>
            {resenas.map((resena, index) => (
              <View key={index} style={{ gap }}>
                <Text className="text-white text-normal">{resena.contenido}</Text>
                <View className="flex-row items-center justify-between" style={{ gap }}>
                  <View>
                    <View className="flex-row items-center" style={{ gap:gap/3 }}>
                      <Text className="text-bone text-normal">Puntuación: </Text>
                      {[...Array(resena.calificacion)].map((_, i) => (
                        <FontAwesome key={i} name="star" size={15} color="#AA500F" accessible={false} />
                      ))}
                    </View>
                    <Text className="text-bone text-normal">Por: {resena.nombre}</Text>
                  </View>
                  <TouchableOpacity
                    className="flex-row items-center"
                    style={{ gap }}
                    onPress={() => handleLike(resena)}
                    accessibilityRole="button"
                    accessibilityLabel={resena.liked ? `Quitar me gusta. ${resena.cant_me_gusta} me gusta` : `Dar me gusta. ${resena.cant_me_gusta} me gusta`}
                  >
                    <Text className="text-white text-normal">{resena.cant_me_gusta}</Text>
                    <AntDesign
                      name="heart"
                      size={25}
                      color={resena.liked ? 'red' : 'white'}
                      accessible={false}
                    />
                  </TouchableOpacity>
                </View>

              </View>
            ))}

            <View className="flex-row items-center justify-start" style={{ gap }}>
              <Button
                label="Ver más reseñas"
                onPress={() => router.push(`/(home)/review/${id}`)}
                loading={false}
                disabled={false}
              />
            </View>
          </>
        )}


      </ScrollView>
    </View>
  );
}