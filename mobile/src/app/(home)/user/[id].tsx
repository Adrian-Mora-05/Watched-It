import {
  ScrollView,
  View,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Image,
  Modal,
  Pressable
} from 'react-native';

import { Text } from '@react-native-ama/react-native';
import ReturnButton from '@/components/ui/ReturnButton';

import {
  useLocalSearchParams,
  router
} from 'expo-router';

import { useEffect, useState } from 'react';

import Feather from '@expo/vector-icons/Feather';

import TitleGrid from '@/components/ui/TitleGrid';

import RatingBarChart
  from '@/components/ui/RatingBarChart';

import {
  getPublicUserProfile,
  getPublicUserRatingStats,
  PublicUserProfile,
  UserRatingStats,
  sendFriendRequest
} from '@/services/user.service';

import { useSession } from '@/hooks/ctx';

import Toast from 'react-native-toast-message';
import { getAvatarUrl } from '@/services/friend.service';

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const headerHeight = screenHeight * 0.16;
const headerPaddingBottom = screenHeight * 0.02;

export default function UserScreen() {

  const { id } = useLocalSearchParams();

  const { session } = useSession();

  const [imageOpen, setImageOpen] = useState(false);
  const [user, setUser] =
    useState<PublicUserProfile | null>(null);

  const [stats, setStats] =
    useState<UserRatingStats | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [sendingRequest, setSendingRequest] =
    useState(false);

  useEffect(() => {

    const load = async () => {

      try {

        const profile =
        await getPublicUserProfile(
          String(id),
          session!
        );

        const ratingStats =
        await getPublicUserRatingStats(
          String(id),
          session!
        );

        setUser(profile);
        setStats(ratingStats);

      } catch (e) {

        console.log(e);

      } finally {

        setLoading(false);

      }
    };

    load();

  }, [id]);

  if (loading || !user) {

    return (
      <View className="flex-1 bg-dark justify-center items-center">
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  const movies = user.favoriteMovies
    .slice(0, 3)
    .map((movie: any) => {

      const data = Array.isArray(movie)
        ? movie[0]
        : movie;

      return {
        ...data,
        title: data.titulo,
        image_link: data.enlace_imagen,
      };
    });

  const shows = user.favoriteShows
    .slice(0, 3)
    .map((show: any) => {

      const data = Array.isArray(show)
        ? show[0]
        : show;

      return {
        ...data,
        title: data.titulo,
        image_link: data.enlace_imagen,
      };
    });

  return (

    <ScrollView
      className="flex-1 bg-dark"
      contentContainerStyle={{
        paddingBottom: 120,
      }}
    >

      {/* HEADER */}
      <View
        className="items-center justify-end bg-chocolate"
        style={{
          height: headerHeight,
          width: screenWidth
        }}
      >

        <Text
          className="text-white text-large font-bold"
          style={{
            paddingBottom: headerPaddingBottom
          }}
        >
          Watched-It
        </Text>

      </View>

      {/* BOTÓN VOLVER */}
      <View className="mt-6 px-4 items-start">

        <ReturnButton
          label="Volver"
          onPress={() => router.back()}
        />

      </View>

      {/* NOMBRE + SOLICITUD */}
      <View
        className="
          mt-8
          px-4
          flex-row
          items-center
          justify-between
        "
      >

      <View className="flex-row items-center flex-1">

        {/* FOTO PERFIL CLICKABLE */}
        <TouchableOpacity onPress={() => setImageOpen(true)}>
          <Image
            source={
              user.profilePicture
                ? { uri: user.profilePicture }
                : require('../../../../assets/images/default-profile-pic.png')
            }
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              marginRight: 12,
            }}
          />
        </TouchableOpacity>

        {/* NOMBRE */}
        <Text
          className="text-white text-3xl font-bold"
          numberOfLines={2}
        >
          {user.name}
        </Text>

      </View>

        {/* BOTÓN AMISTAD */}
        {!user.isFriend &&
          !user.friendRequestPending && (

          <TouchableOpacity
            disabled={sendingRequest}
            className="items-center justify-center"
            style={{
              width: 95,
              opacity: sendingRequest ? 0.5 : 1,
            }}
            onPress={async () => {

              try {

                setSendingRequest(true);

                await sendFriendRequest(
                  String(id),
                  session!
                );

                Toast.show({
                  type: 'success',
                  text1: 'Solicitud enviada',
                  position: 'top',
                });

                setUser({
                  ...user,
                  friendRequestPending: true,
                });

              } catch (e) {

                console.log(e);

                Toast.show({
                  type: 'error',
                  text1: 'Error al enviar solicitud',
                  position: 'top',
                });

              } finally {
                setSendingRequest(false);
              }
            }}
          >

            <Feather
              name="send"
              size={24}
              color="white"
            />

            <Text className="text-white mt-2 text-center text-xs">
              Enviar solicitud{'\n'}de amistad
            </Text>

          </TouchableOpacity>

        )}

      </View>

      {/* DIVISOR */}
      <View className="border-b border-gray-500 my-6 mx-4" />

      {/* PELÍCULAS FAVORITAS */}
      <View className="px-4">

        <Text
          className="
            text-white
            text-medium
            font-semibold
          "
        >
          Películas favoritas de {user.name}
        </Text>

        {movies.length === 0 ? (

          <Text className="text-gray-400 mt-4">
            Sin películas favoritas por el momento
          </Text>

        ) : (

          <View
            className="
              py-6
              flex-row
              justify-around
            "
          >

            {movies.map((movie, index) => (

              <TitleGrid
                key={movie.id || index}
                item={movie}
                onPress={() => {

                  router.push({
                    pathname: '/movie/[id]',
                    params: {
                      id: movie.id
                    }
                  });
                }}
              />

            ))}

          </View>

        )}

      </View>

      {/* DIVISOR */}
      <View className="border-b border-gray-500 my-6 mx-4" />

      {/* SERIES FAVORITAS */}
      <View className="px-4">

        <Text
          className="
            text-white
            text-medium
            font-semibold
          "
        >
          Series favoritas de {user.name}
        </Text>

        {shows.length === 0 ? (

          <Text className="text-gray-400 mt-4">
            Sin series favoritas por el momento
          </Text>

        ) : (

          <View
            className="
              py-6
              flex-row
              justify-around
            "
          >

            {shows.map((show, index) => (

              <TitleGrid
                key={show.id || index}
                item={show}
                onPress={() => {

                  router.push({
                    pathname: '/show/[id]',
                    params: {
                      id: show.id
                    }
                  });
                }}
              />

            ))}

          </View>

        )}

      </View>

      {/* DIVISOR */}
      <View className="border-b border-gray-500 my-6 mx-4" />

      {/* GRÁFICO */}
      <View className="py-6 px-4">

        <Text
          className="
            text-white
            text-medium
            font-semibold
            mb-4
          "
        >
          Gráfico de puntuaciones
        </Text>

        {stats ? (

          <RatingBarChart {...stats} />

        ) : (

          <ActivityIndicator color="#fff" />

        )}

      </View>


      <Modal visible={imageOpen} transparent animationType="fade">
      <Pressable
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.9)',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onPress={() => setImageOpen(false)}
      >
        <Image
          source={
            user.profilePicture
              ? { uri: user.profilePicture }
              : require('../../../../assets/images/default-profile-pic.png')
          }
          style={{
            width: '90%',
            height: '70%',
            resizeMode: 'contain',
          }}
        />
      </Pressable>
    </Modal>

    </ScrollView>
  );
}