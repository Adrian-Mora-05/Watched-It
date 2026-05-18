import { View, TextInput, FlatList, TouchableOpacity, Text, ActivityIndicator, Image } from 'react-native';
import { ReadEachCatalogContent } from '@shared/catalog.schema';
import { getMovies } from '@/services/movie.service';
import { getShows } from '@/services/show.service';
import { addToList, removeFromList } from '@/services/list.service';
import { useState } from 'react';
import { baseUrl } from '@/services/movie.service';
import { useSession } from '@/hooks/ctx';

type Props = {
  listName: string;
  listType: 'pelicula' | 'serie';
  selectedTitles: ReadEachCatalogContent[];
  setSelectedTitles: React.Dispatch<React.SetStateAction<ReadEachCatalogContent[]>>;
};

export default function SearchModalLists({
  listName,
  listType,
  selectedTitles,
  setSelectedTitles,
}: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ReadEachCatalogContent[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingIds, setLoadingIds] = useState<Set<number>>(new Set());
  const { session } = useSession();

  const handleSearch = async (text: string) => {
    setQuery(text);
    if (!text.trim()) {
      setResults([]);
      return;
    }
    try {
      setLoading(true);
      const res = listType === 'pelicula'
        ? await getMovies({ title: text })
        : await getShows({ title: text });
      setResults(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = async (item: ReadEachCatalogContent) => {
    if (loadingIds.has(item.id)) return;

    const exists = selectedTitles.some((x) => x.id === item.id);
    const body = { tipo: listType, nombre_lista: listName };

    try {
      setLoadingIds((prev) => new Set(prev).add(item.id));

      if (exists) {
        await removeFromList(session!, item.id, body);
        setSelectedTitles((prev) => prev.filter((x) => x.id !== item.id));
      } else {
        await addToList(session!, item.id, body);
        setSelectedTitles((prev) => [...prev, item]);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <TextInput
        value={query}
        onChangeText={handleSearch}
        placeholder={`Buscar ${listType === 'pelicula' ? 'películas' : 'series'}...`}
        placeholderTextColor="#9E8B7A"
        style={{
          backgroundColor: '#5D3E14',
          padding: 10,
          borderRadius: 8,
          color: 'white',
          marginBottom: 10,
        }}
      />

      {loading ? (
        <ActivityIndicator color="white" />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => `${item.type_catalog}-${item.id}`}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 20 }}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => {
            const isSelected = selectedTitles.some((x) => x.id === item.id);
            const isLoading = loadingIds.has(item.id);

            return (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: 'rgba(209, 213, 219, 0.1)',
                  padding: 10,
                  borderRadius: 10,
                  marginBottom: 10,
                }}
              >
                <Image
                  source={{ uri: baseUrl + item.image_link }}
                  style={{ width: 50, height: 70, borderRadius: 6 }}
                />
                <Text
                  numberOfLines={1}
                  style={{ color: 'white', flex: 1, marginLeft: 10 }}
                >
                  {item.title}
                </Text>
                <TouchableOpacity
                  onPress={() => toggleSelect(item)}
                  disabled={isLoading}
                  style={{
                    backgroundColor: isSelected ? '#AA500F' : '#231709',
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 6,
                    minWidth: 36,
                    alignItems: 'center',
                  }}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={{ color: 'white', fontSize: 18 }}>
                      {isSelected ? '✓' : '+'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}