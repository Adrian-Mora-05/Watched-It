import { View, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Platform, ActivityIndicator, FlatList } from 'react-native';
import { Text } from '@react-native-ama/react-native';
import Input from '@/components/ui/Input';
import { useCallback, useEffect, useMemo, useRef, useState, memo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ReadEachCatalogContent } from "@shared/catalog.schema";
import { baseUrl, getCatalog } from '@/services/catalog.service';
import ErrorToast from '@/components/ui/ErrorMessage';
import ImageButton from '@/components/ui/imageButton';
import { useRouter } from 'expo-router';
import { AccessibilityInfo } from 'react-native';
import { useLayout } from '@/hooks/useLayout';

const MovieCard = memo(({
  item,
  width,
  height,
  baseUrl,
  onPress,
}: {
  item: ReadEachCatalogContent;
  width: number;
  height: number;
  baseUrl: string;
  onPress: (item: ReadEachCatalogContent) => void;
}) => {
  const handlePress = useCallback(() => onPress(item), [item, onPress]);

  return (
    <View className="flex-1 p-1 items-center">
      <ImageButton
        width={width}
        height={height}
        onPress={handlePress}
        rounded="md"
        source={{ uri: baseUrl + item.image_link }}
        accessibilityLabel={`${item.title}, ${item.type_catalog === 'Movie' ? 'película' : 'serie'}`}
        accessibilityHint="Toca para registrar esta película o serie"
      />
    </View>
  );
});

const EmptyList = memo(() => (
  <View className="flex-1 items-center justify-center mt-10">
    <Text
      accessibilityLanguage="es"
      accessibilityLiveRegion="polite"
      className="text-bone text-normal"
    >
      No se encontraron resultados
    </Text>
  </View>
));

export default function index() {
  const router = useRouter();
  const {
    headerHeight,
    screenWidth,
    screenHeight,
    headerPaddingBottom,
    paddingHorizontal,
    paddingVertical,
    movieCardWidth,
    movieCardHeight,
  } = useLayout();

  const [filter, setFilter] = useState('');
  const [catalog, setCatalog] = useState<ReadEachCatalogContent[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const isLoadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const skipRef = useRef(0);
  const LIMIT = 12;
  const [toastMessage, setToastMessage] = useState<string | undefined>();

  const fetchMovies = useCallback(async () => {
    if (isLoadingRef.current || !hasMoreRef.current) return;
    isLoadingRef.current = true;
    setLoading(true);
    try {
      const data = await getCatalog({ skip: skipRef.current, limit: LIMIT }) as ReadEachCatalogContent[];
      if (data.length < LIMIT) hasMoreRef.current = false;
      setCatalog(prev => [...prev, ...data]);
      skipRef.current += LIMIT;
    } catch (e: any) {
      setToastMessage("Error al cargar las películas y series");
      AccessibilityInfo.announceForAccessibility("Error al cargar las películas y series");
    } finally {
      isLoadingRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMovies().finally(() => setLoaded(true));
  }, [fetchMovies]);

  const handleSelect = useCallback((item: ReadEachCatalogContent) => {
    router.push({
      pathname: '/logContent',
      params: {
        id_content: String(item.id),
        title: item.title,
        type: item.type_catalog,
        link: encodeURIComponent(item.image_link)
      }
    });
  }, [router]);

  const filteredCatalog = useMemo(() =>
    catalog.filter(item =>
      item.title.toLowerCase().includes(filter.toLowerCase())
    ),
    [catalog, filter]
  );

  const renderItem = useCallback(({ item }: { item: ReadEachCatalogContent }) => (
    <MovieCard
      item={item}
      width={movieCardWidth}
      height={movieCardHeight}
      baseUrl={baseUrl}
      onPress={handleSelect}
    />
  ), [movieCardWidth, movieCardHeight, handleSelect]);

  const keyExtractor = useCallback((item: ReadEachCatalogContent) =>
    item.id.toString(),
    []
  );

  const ListFooter = useCallback(() =>
    loading
      ? <ActivityIndicator color="white" accessibilityLabel="Cargando más películas y series" />
      : null,
    [loading]
  );

  const handleSearch = useCallback((text: string) => {
    setFilter(text);
    if (text.length > 0) {
      const count = catalog.filter(item =>
        item.title.toLowerCase().includes(text.toLowerCase())
      ).length;
      AccessibilityInfo.announceForAccessibility(
        `${count} resultado${count !== 1 ? 's' : ''} encontrado${count !== 1 ? 's' : ''}`
      );
    }
  }, [catalog]);

  if (!loaded) return (
    <View className="flex-1 bg-dark items-center justify-center">
      <ActivityIndicator color="white" accessibilityLabel="Cargando películas y series" />
    </View>
  );

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

          {/* Header */}
          <View
            className="bg-chocolate items-center justify-end"
            style={{ height: headerHeight, width: screenWidth }}
          >
            <View
              className="flex-row w-full items-center"
              style={{ paddingBottom: headerPaddingBottom }}
            >

              {/* Title */}
              <View className="flex-1 items-center">
                <Text
                  accessibilityRole="header"
                  accessibilityLanguage="es"
                  autofocus
                  className="text-white text-large font-bold text-center"
                >
                  Nueva entrada
                </Text>
              </View>

            </View>
          </View>

          {/* Search bar */}
          <View
            className="justify-start flex-row items-center"
            style={{
              marginTop: paddingVertical * 1.5,
              marginHorizontal: paddingHorizontal,
              gap: screenWidth * 0.02,
            }}
            accessibilityLanguage="es"
          >
            <Ionicons
              name="search"
              size={screenWidth * 0.045}
              color="white"
              accessibilityElementsHidden
              importantForAccessibility="no"
            />
            <Text
              className="text-white font-bold"
              style={{ fontSize: screenWidth * 0.045 }}
              accessibilityElementsHidden
              importantForAccessibility="no"
            >
              Buscar:
            </Text>
            <Input
              label="Nombre de la película o serie que acabas de ver"
              placeholder="Nombre de película o serie..."
              hideLabel
              width={String(Math.floor(screenWidth * 0.65))}
              value={filter}
              onChangeText={handleSearch}
              accessibilityLanguage="es"
              returnKeyType="search"
            />
          </View>

          {/* Results count for screen readers */}
          {filter.length > 0 && (
            <Text
              accessibilityLanguage="es"
              accessibilityLiveRegion="polite"
              className="text-bone text-sm"
              style={{
                paddingLeft: paddingHorizontal,
                marginTop: paddingVertical * 0.5,
              }}
            >
              {filteredCatalog.length} resultado{filteredCatalog.length !== 1 ? 's' : ''} encontrado{filteredCatalog.length !== 1 ? 's' : ''}
            </Text>
          )}

          {/* List */}
          <View
            className="flex-1"
            style={{ marginTop: paddingVertical, marginBottom: paddingVertical * 0.5 }}
          >
            <FlatList
              key="3-columns"
              numColumns={3}
              data={filteredCatalog}
              keyExtractor={keyExtractor}
              renderItem={renderItem}
              onEndReached={fetchMovies}
              onEndReachedThreshold={0.3}
              accessibilityLabel="Lista de películas y series"
              accessibilityLanguage="es"
              ListEmptyComponent={EmptyList}
              ListFooterComponent={ListFooter}
              removeClippedSubviews={true}
              maxToRenderPerBatch={6}
              windowSize={3}
              initialNumToRender={12}
              updateCellsBatchingPeriod={100}
            />
          </View>

        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}