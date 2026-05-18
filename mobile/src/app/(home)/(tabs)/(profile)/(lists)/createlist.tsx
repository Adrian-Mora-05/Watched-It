import {
  View,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@react-native-ama/react-native";
import { useState } from "react";
import { useSession } from "@/hooks/ctx";
import { createList } from "@/services/list.service";
import SearchModalLists from "@/hooks/searchModalLists";
import { ReadEachCatalogContent } from "@shared/catalog.schema";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useLayout } from "@/hooks/useLayout";


export default function CreateListScreen() {
  const { session } = useSession();
  const { headerHeight } = useLayout();
  const [name, setName] = useState("");
  const [type, setType] = useState<"pelicula" | "serie">("pelicula");
  const [loading, setLoading] = useState(false);
  const [createdListName, setCreatedListName] = useState<string | null>(null);
  const [selectedTitles, setSelectedTitles] = useState<ReadEachCatalogContent[]>([]);

  if (!session) {
    return (
      <View className="flex-1 bg-dark items-center justify-center">
        <ActivityIndicator color="white" />
      </View>
    );
  }

  const handleCreateList = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "El nombre no puede estar vacío");
      return;
    }
    if (name.toLowerCase().trim() === "por_ver") {
      Alert.alert("Error", 'El nombre "por_ver" está reservado');
      return;
    }
    try {
      setLoading(true);
      await createList({ nombre_lista: name.trim(), tipo: type }, session);
      setCreatedListName(name.trim());
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "No se pudo crear la lista");
    } finally {
      setLoading(false);
    }
  };

  if (createdListName) {
    return (
      <SafeAreaView className="flex-1 bg-dark">
        <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: headerHeight * 0.3 }}>

          {/* HEADER */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 20,
            }}
          >
            <View>
              <Text style={{ color: '#9CA3AF', fontSize: 15, marginBottom: headerHeight*0.15, }}>
                Agregando titulos a
              </Text>
              <Text style={{ color: 'white', fontSize: 25, fontWeight: '700' }}>
                {createdListName}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                backgroundColor: '#AA500F',
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 12,
              }}
            >
              <Text style={{ color: 'white', fontWeight: '700' }}>Listo</Text>
            </TouchableOpacity>
          </View>

          {/* BUSCADOR */}
          <View style={{ flex: 1 }}>
            <SearchModalLists
              listName={createdListName}
              listType={type}
              selectedTitles={selectedTitles}
              setSelectedTitles={setSelectedTitles}
            />
          </View>

        </View>
      </SafeAreaView>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView className="flex-1 bg-dark">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: headerHeight * 0.3 }}>
           {/* BACK + TÍTULO */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                marginBottom: 32,
              }}
            >
              <TouchableOpacity
                onPress={() => router.back()}
                style={{ position: 'absolute', left: 0 }}
              >
                <Ionicons name="arrow-back" size={26} color="#AA500F" />
              </TouchableOpacity>

              <Text style={{ color: 'white', fontWeight: '700' }} className="text-large">
                Nueva lista
              </Text>
            </View>

            {/* SUBTÍTULO */}
            <Text style={{ color: '#9CA3AF', fontSize: 14, marginBottom: 32 }}>
              Dale un nombre y elige el tipo de contenido que tendrá
            </Text>

              {/* NOMBRE */}
              <Text style={{ color: '#D1D5DB', fontSize: 13, marginBottom: 8, fontWeight: '700' }}>
                Nombre
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Ej: Futuristas"
                placeholderTextColor="#555"
                selectionColor="#AA500F"
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  color: 'white',
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  borderRadius: 12,
                  fontSize: 16,
                  marginBottom: 24,
                  borderWidth: 1,
                  borderColor: name ? '#AA500F' : 'transparent',
                }}
              />

            {/* TIPO */}
            <Text style={{ color: '#D1D5DB', fontSize: 13, marginBottom: 8, fontWeight: '700'  }}>
              Tipo de contenido
            </Text>
            <View
              style={{
                flexDirection: 'row',
                backgroundColor: 'rgba(255,255,255,0.06)',
                borderRadius: 12,
                padding: 4,
                marginBottom: 40,
              }}
            >
              {(['pelicula', 'serie'] as const).map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setType(t)}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: 10,
                    backgroundColor: type === t ? '#AA500F' : 'transparent',
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                >
                  <Ionicons
                    name={t === 'pelicula' ? 'film-outline' : 'tv-outline'}
                    size={16}
                    color={type === t ? 'white' : '#9CA3AF'}
                  />
                  <Text
                    style={{
                      color: type === t ? 'white' : '#9CA3AF',
                      fontWeight: '600',
                      fontSize: 14,
                    }}
                  >
                    {t === 'pelicula' ? 'Películas' : 'Series'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* CREAR */}
            <TouchableOpacity
              onPress={handleCreateList}
              disabled={loading || !name.trim()}
              style={{
                backgroundColor: '#AA500F',
                paddingVertical: 16,
                borderRadius: 14,
                alignItems: 'center',
                opacity: loading || !name.trim() ? 0.5 : 1,
              }}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>
                  Crear lista
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}