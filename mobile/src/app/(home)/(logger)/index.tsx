import { View, Keyboard, TouchableWithoutFeedback, Text,KeyboardAvoidingView, Platform, ActivityIndicator, FlatList } from 'react-native';

import Input from '@/components/ui/Input';
import { useEffect, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ReadEachCatalogContent } from "@shared/catalog.schema";
import { baseUrl, getCatalog } from '@/services/catalog.service';
import ErrorToast from '@/components/ui/ErrorMessage';
import ImageButton from '@/components/ui/imageButton';
import { useRouter } from 'expo-router';

export default function index() {
  const router = useRouter();
  const [filter, setFilter] = useState('');
  const [catalog, setCatalog] = useState<ReadEachCatalogContent[]>([]);
  const [loading, setLoading] = useState(false);
  const isLoadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const skipRef = useRef(0);
  const LIMIT = 12;
  const [toastMessage, setToastMessage] = useState<string | undefined>();

    const fetchMovies = async () => {
    if (isLoadingRef.current || !hasMoreRef.current) return;
    isLoadingRef.current = true;
    setLoading(true);
    try {
        const data = await getCatalog({ skip: skipRef.current, limit: LIMIT }) as ReadEachCatalogContent[];

        if (data.length < LIMIT) hasMoreRef.current = false;

        setCatalog(prev => [...prev, ...data]);

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

  const filteredCatalog = catalog.filter(item =>
    item.title.toLowerCase().includes(filter.toLowerCase())
  );

  const handleSelect = (item: ReadEachCatalogContent) => {
    router.push({ 
      pathname: '/logContent', 
      params: { 
        id_content: String(item.id), 
        title: item.title, 
        type: item.type_catalog,
        link: encodeURIComponent(item.image_link) 
      } 
    });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 bg-dark"
      >
            <View className="flex-1">
                <ErrorToast
                    message={toastMessage}
                    visible={!!toastMessage}
                    onDismiss={() => setToastMessage(undefined)}
                />
                <View className='bg-chocolate h-36 items-center justify-end'>
                    <Text className="text-white text-large font-bold pb-7">Nueva entrada</Text>
                </View>
                <View className='justify-start flex-row items-center mt-6 mx-5'>
                    <Ionicons name="search" size={18} color="white" />
                    <Text className="text-white text-xl font-bold ml-2">Buscar: </Text>
                    <Input
                    label="Nombre de la película o serie que acabas de ver"  
                    placeholder="Nombre de película o serie..."
                    hideLabel
                    width="290"
                    value={filter}
                    onChangeText={setFilter}
                    />
                </View>

          <View className="flex-1 mt-3 mb-2">
            <FlatList
              key="3-columns"
              numColumns={3}
              data={filteredCatalog}
              keyExtractor={(item, index) => `${item.id}-${index}`}
              onEndReached={fetchMovies}
              onEndReachedThreshold={0.5}
              accessibilityLabel="Lista de películas y series"
              ListFooterComponent={
                loading
                  ? <ActivityIndicator color="white" accessibilityLabel="Cargando más películas y series" />
                  : null
              }
              renderItem={({ item }) => (
                <View className="flex-1 p-1 items-center">
                  <ImageButton
                    width={125}
                    height={185}
                    onPress={() => handleSelect(item)}
                    rounded="md"
                    source={{ uri: baseUrl + item.image_link }}
                    accessibilityLabel={item.title}
                    accessibilityHint="Toca para registrar esta película o serie"
                  />
                </View>
              )}
            />
          </View>

        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}