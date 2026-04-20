import { View, ActivityIndicator, FlatList } from "react-native";
import { useEffect, useRef, useState } from "react";
import { Text } from "@react-native-ama/react-native";
import { router, useLocalSearchParams } from "expo-router";
import ReturnButton from "@/components/ui/ReturnButton";
import Button from "@/components/ui/Button";
import { signup } from "@/services/auth.service";
import ErrorToast from '@/components/ui/ErrorMessage';
import ImageButton from "@/components/ui/imageButton"; 
import { useSession } from '@/hooks/ctx';
import { getMovies, baseUrl } from "@/services/movie.service";
import { ReadEachMovie } from "@shared/movie.schema";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import SearchFilter from "@/components/ui/SearchFilter";

export default function ChooseFavsScreen() {
  const { email, password, name, photoUri } = useLocalSearchParams<{
    email: string;
    password: string;
    name: string;
    photoUri?: string;
  }>();
  const { signIn } = useSession();
  const resolvedPhotoUri = Array.isArray(photoUri) ? photoUri[0] : photoUri;
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | undefined>();
  const [movies, setMovies] = useState<ReadEachMovie[]>([]);
  const isLoadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const skipRef = useRef(0);
  const LIMIT = 12;
  const [selected, setSelected] = useState<number[]>([]);

  const toggleMovie = (id: number) => {
    setSelected(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 3) return prev; // max 3
      return [...prev, id];
    });
  };

  const fetchMovies = async () => { 
    if (isLoadingRef.current || !hasMoreRef.current) return;
    isLoadingRef.current = true;
    setLoading(true);
    try {
      const response = await getMovies({ skip: skipRef.current, limit: LIMIT });

      if (response.data.length < LIMIT) hasMoreRef.current = false;
      setMovies(prev => {
        const existingIds = new Set(prev.map((m: ReadEachMovie) => m.id));
        return [...prev, ...response.data.filter((m: ReadEachMovie) => !existingIds.has(m.id))];
      });
      skipRef.current += LIMIT;
    } catch (e: any) {
      setToastMessage("Error al cargar las películas");
    } finally {
      isLoadingRef.current = false;
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  return (
    <View className="flex-1 bg-dark">
      <ErrorToast
        message={toastMessage}
        visible={!!toastMessage}
        onDismiss={() => setToastMessage(undefined)} />
      <ReturnButton label="Volver" onPress={() => router.back()} />
      <View className="items-center m-5 mt-0">
        <Text className="text-white text-large font-bold">Comencemos</Text>
      </View>
        <Text className="text-white text-medium p-4">
          Elige tus 3 películas favoritas {selected.length > 0 ? `(${selected.length}/3)` : ''}
        </Text>
        <SearchFilter
          label="Buscar película"
          placeholder="Escribe un título..."
          onSearch={async (text) => {
            try {
              skipRef.current = 0;
              hasMoreRef.current = true;
              isLoadingRef.current = false;
              setLoading(true);
              const res = await getMovies({ skip: 0, limit: LIMIT , title: text });
              setMovies(res.data);
              if (res.data.length < LIMIT) hasMoreRef.current = false;
              skipRef.current = LIMIT;
            } catch (e:any) {
              setToastMessage(e.message);
            } finally {
              setLoading(false);
            }
          }}
        />
      <View className="flex-1 ">
        <FlatList
          key="3-columns"
          numColumns={3}
          data={movies}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          onEndReached={fetchMovies}
          onEndReachedThreshold={0.5}
          ListFooterComponent={loading ? <ActivityIndicator color="white" /> : null}
          renderItem={({ item }) => {
            const isSelected = selected.includes(item.id);
            return (
              <View className="flex-1 p-1 items-center">
                <ImageButton
                  width={125}
                  height={185}
                  onPress={() => toggleMovie(item.id)}
                  rounded="md"
                  source={{ uri: baseUrl + item.image_link }}
                  accessibilityLabel={item.title}
                  accessibilityHint={`Ver detalles de ${item.title}`}
                  borderColor={isSelected ? '#AA500F' : undefined}
                  borderWidth={2}
                  icon={isSelected
                    ? <FontAwesome name="check-circle" size={25} color="green" />
                    : undefined
                  }
                />
              </View>
            );
          }}
        />
        <View className=" m-5 mb-12">
      <Button
        label="Registrarse"
        loading={loading}
        disabled={selected.length < 3}
          onPress={async () => {
            setLoading(true);
            try {
              await signup({ email, password, name }, resolvedPhotoUri);
              await signIn({ email, password });
              router.replace('/(home)');
            } catch (e) {
              setToastMessage("Usuario o correo ya registrado");
            } finally {
              setLoading(false);
            }
          }}
        />
        </View>
      </View>
    </View>
  );
}