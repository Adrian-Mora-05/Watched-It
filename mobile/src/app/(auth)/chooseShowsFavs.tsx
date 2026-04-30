import { signup } from "@/services/auth.service";
import { router, useLocalSearchParams } from "expo-router";
import Button from "@/components/ui/Button";
import { useSession } from '@/hooks/ctx'
import ReturnButton from "@/components/ui/ReturnButton";
import SearchFilter from "@/components/ui/SearchFilter";
import { View, ActivityIndicator, FlatList } from "react-native";
import { useEffect, useRef, useState } from "react";
import { Text } from "@react-native-ama/react-native";
import ErrorToast from '@/components/ui/ErrorMessage';
import ImageButton from "@/components/ui/imageButton"; 
import { getShows, baseUrl } from "@/services/show.service";
import { ReadEachShow } from "@shared/show.schema";
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function ChooseShowsFavsScreen() {
  const { favs, email, password, name, photoUri } = useLocalSearchParams<{
    email: string;
    password: string;
    name: string;
    photoUri?: string;
    favs?: string;
  }>();
  const favsMovies = favs ? JSON.parse(favs) : [];
  const { signIn } = useSession();
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | undefined>();
  const [shows, setShows] = useState<ReadEachShow[]>([]);
  const isLoadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const skipRef = useRef(0);
  const LIMIT = 12;
  const [selected, setSelected] = useState<number[]>([]);
  const resolvedPhotoUri = Array.isArray(photoUri) ? photoUri[0] : photoUri;

  const toggleShow = (id: number) => {
    setSelected(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const fetchShows = async () => {
    if (isLoadingRef.current || !hasMoreRef.current) return;
    isLoadingRef.current = true;
    setLoading(true);
    try {
      const response = await getShows({ skip: skipRef.current, limit: LIMIT });
      if (response.data.length < LIMIT) hasMoreRef.current = false;
      setShows(prev => {
        const existingIds = new Set(prev.map((s: ReadEachShow) => s.id));
        return [...prev, ...response.data.filter((s: ReadEachShow) => !existingIds.has(s.id))];
      });
      skipRef.current += LIMIT;
    } catch (e: any) {
      setToastMessage("Error al cargar las series");
    } finally {
      isLoadingRef.current = false;
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShows();
  }, []);

  return (
    <View className="flex-1 bg-dark" accessible={false}>
      <ErrorToast
        message={toastMessage}
        visible={!!toastMessage}
        onDismiss={() => setToastMessage(undefined)}
      />

      <ReturnButton label="Volver" onPress={() => router.back()} />

      {/* Título */}
      <View className="items-center m-5 mt-0" accessible={true} accessibilityRole="header">
        <Text className="text-white text-large font-bold">Ya casi terminas</Text>
      </View>

      {/* Contador de seleccionadas */}
      <Text
        className="text-white text-medium p-4"
        accessibilityLabel={`Elige tus 3 series favoritas. ${selected.length} de 3 seleccionadas`}
        accessibilityLiveRegion="polite"
      >
        Elige tus 3 series favoritas {selected.length > 0 ? `(${selected.length}/3)` : ''}
      </Text>

      <SearchFilter
        label="¿No aparece la que quieres? Búscala por título"
        placeholder="Escribe un título..."
        onSearch={async (text) => {
          try {
            skipRef.current = 0;
            hasMoreRef.current = true;
            isLoadingRef.current = false;
            setLoading(true);
            const res = await getShows({ skip: 0, limit: LIMIT, title: text });
            setShows(res.data);
            if (res.data.length < LIMIT) hasMoreRef.current = false;
            skipRef.current = LIMIT;
          } catch (e: any) {
            setToastMessage(e.message);
          } finally {
            setLoading(false);
          }
        }}
      />

      <View className="flex-1 px-2">
        <FlatList
          key="3-columns"
          numColumns={3}
          data={shows}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          onEndReached={fetchShows}
          onEndReachedThreshold={0.5}
          accessibilityLabel="Lista de series"
          ListFooterComponent={
            loading
              ? <ActivityIndicator color="white" accessibilityLabel="Cargando más series" />
              : null
          }
          renderItem={({ item }) => {
            const isSelected = selected.includes(item.id);
            return (
              <View className="flex-1 p-2 items-center">
                <ImageButton
                  width={125}
                  height={185}
                  onPress={() => toggleShow(item.id)}
                  rounded="md"
                  source={{ uri: baseUrl + item.image_link }}
                  accessibilityLabel={
                    isSelected
                      ? `${item.title}, seleccionada`
                      : `${item.title}, no seleccionada`
                  }
                  accessibilityHint={
                    isSelected
                      ? "Toca para deseleccionar"
                      : selected.length >= 3
                      ? "Ya seleccionaste 3 series, deselecciona una para elegir esta"
                      : "Toca para seleccionar"
                  }
                  accessibilityState={{ selected: isSelected }}
                  borderColor={isSelected ? '#AA500F' : undefined}
                  borderWidth={2}
                  icon={
                    isSelected
                      ? <FontAwesome name="check-circle" size={25} color="green" />
                      : undefined
                  }
                />
              </View>
            );
          }}
        />

        <View className="m-5 mb-12">
          <Button
            label={
              selected.length < 3
                ? `Selecciona ${3 - selected.length} serie${3 - selected.length > 1 ? 's' : ''} más`
                : "Registrarse"
            }
            loading={loading}
            disabled={selected.length < 3}
            onPress={async () => {
              setLoading(true);
              try {
                await signup({ email, password, name }, resolvedPhotoUri, favsMovies, selected);
                await signIn({ email, password });
                router.replace('/(home)');
              } catch (e) {
                setToastMessage("Hubo un error al crear tu cuenta");
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