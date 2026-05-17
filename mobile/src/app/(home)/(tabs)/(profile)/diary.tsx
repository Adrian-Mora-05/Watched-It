import { useEffect, useState, useMemo } from "react";
import { View, FlatList } from "react-native";
import { Text } from "@react-native-ama/react-native";
import DiaryEntryCard from '../../../../components/ui/DiaryEntryCard';
import { useSession } from '@/hooks/ctx';
import { getDiaryEntries } from "@/services/diary.service";

type DiaryEntry = {
  id: number;
  type: 'movie' | 'series';
  fecha_creado: string;
  calificacion: number;

  content: {
    id: number;
    titulo: string;
    anio: number;
    enlace_imagen: string;
  };
};

export default function DiaryScreen() {

  const { session } = useSession();

  const LIMIT = 15;

  const [skip, setSkip] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [entries, setEntries] = useState<DiaryEntry[]>([]);

  useEffect(() => {
    loadDiary(0);
  }, []);

  const loadDiary = async (nextSkip: number) => {

    if (loadingMore) return;

    setLoadingMore(true);

    const res = await getDiaryEntries(session!, {
      skip: nextSkip,
      limit: LIMIT
    });

    if (nextSkip === 0) {
      setEntries(res.data);
    } else {
      setEntries(prev => [
        ...prev,
        ...res.data
      ]);
    }

    setSkip(nextSkip);
    setLoadingMore(false);
  };

  const groupedEntries = useMemo(() => {

    return entries.reduce((groups, entry) => {

      const date = new Date(entry.fecha_creado);

      const monthName =
        date.toLocaleString('es-ES', { month: 'long' });

      const year = date.getFullYear();

      const month =
        `${monthName} ${year}`;

      if (!groups[month]) {
        groups[month] = [];
      }

      groups[month].push(entry);

      return groups;

    }, {} as Record<string, DiaryEntry[]>);

  }, [entries]);

  const flatData = useMemo(() => {

    const result: any[] = [];

    Object.entries(groupedEntries).forEach(([month, items]) => {

      result.push({ type: 'header', month });

      items.forEach(item => {
        result.push({ type: 'item', item });
      });

    });

    return result;

  }, [groupedEntries]);

  return (

    <FlatList

      data={flatData}

      keyExtractor={(item, index) =>
        item.type === 'header'
          ? item.month
          : `${item.item.id}-${index}`
      }

      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 24,
        paddingBottom: 120
      }}

      renderItem={({ item }) => {

        if (item.type === 'header') {

          return (
             <View 
              className="mt-0 mb-4"
              accessible={true}
              accessibilityLabel={item.month}
              accessibilityRole="header">
              <View className="
                self-start
                px-4
                py-2
                rounded-full
                bg-chocolate
              ">
                <Text className="
                  text-white
                  text-lg
                  font-bold
                  capitalize
                "
                 accessibilityRole="text">
                  {item.month}
                </Text>
              </View>

            </View>
          );
        }

        const entry = item.item;

        const day =
          new Date(entry.fecha_creado).getDate();

        return (

          <DiaryEntryCard
            title={entry.content.titulo}
            image_link={entry.content.enlace_imagen}
            year={entry.content.anio}
            rating={entry.calificacion}
            day={day}
            onPress={() => {}}
          
          />
        );
      }}

      onEndReached={() => {
        loadDiary(entries.length);
      }}

      onEndReachedThreshold={0.5}

      accessibilityRole="list"
      accessible={true}
      accessibilityLabel="Lista del diario de películas y series"
    />
  );
}