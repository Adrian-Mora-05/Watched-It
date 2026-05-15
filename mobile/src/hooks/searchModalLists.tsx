import { View, TextInput, FlatList, TouchableOpacity, Text, ActivityIndicator, Image, } from 'react-native';
import { ReadEachCatalogContent } from '@shared/catalog.schema';
import { getMovies } from '@/services/movie.service';
import { getShows } from '@/services/show.service';
import { useState } from 'react';
import { baseUrl } from '@/services/movie.service';
import { useWindowDimensions } from 'react-native';
import { useSession } from '@/hooks/ctx';
import api from '@/services/api';

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
  const { height } = useWindowDimensions();
  const { session } = useSession();

  const handleSearch = async (text: string) => {
    setQuery(text);
    if (!text.trim()) {
      setResults([]);
      return;
    }
    try {
      setLoading(true);
      const res =
        listType === 'pelicula'
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
    const exists = selectedTitles.some((x) => x.id === item.id);
    try {
      if (exists) {
        await api.delete(`/list/${item.id}`, {
          headers: { Authorization: `Bearer ${session}` },
          data: { tipo: listType, nombre_lista: listName },
        });
        setSelectedTitles((prev) => prev.filter((x) => x.id !== item.id));
      } else {
        await api.post(
          `/list/${item.id}`,
          { tipo: listType, nombre_lista: listName },
          { headers: { Authorization: `Bearer ${session}` } }
        );
        setSelectedTitles((prev) => [...prev, item]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* INPUT */}
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

      {/* RESULTS */}
      {loading ? (
        <ActivityIndicator color="white" />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => `${item.type_catalog}-${item.id}`}
          style={{ flex: 1 }}                  // ← ocupa el espacio disponible
          contentContainerStyle={{ paddingBottom: 20 }}  // ← sin altura dinámica
          keyboardShouldPersistTaps="handled"  // ← evita que el tap cierre el teclado antes de seleccionar
          renderItem={({ item }) => {
            const isSelected = selectedTitles.some((x) => x.id === item.id);
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
                  style={{
                    backgroundColor: isSelected ? '#AA500F' : '#231709',
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 6,
                  }}
                >
                  <Text style={{ color: 'white', fontSize: 18 }}>
                    {isSelected ? '✓' : '+'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}