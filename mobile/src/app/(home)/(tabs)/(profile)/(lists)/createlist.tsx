import { View, TouchableOpacity, TextInput, ActivityIndicator, Pressable, Alert,} from "react-native";
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
  const [modalVisible, setModalVisible] = useState(false);
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
      await createList(
        {
          nombre_lista: name.trim(),
          tipo: type,
        },
        session
      );
      setCreatedListName(name.trim());
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "No se pudo crear la lista");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-dark px-5">
      <View style={{ paddingTop: headerHeight * 0.3 }}>

        {/* BACK */}
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 20 }}>
          <Ionicons name="arrow-back" size={26} color="#AA500F" />
        </TouchableOpacity>

        <Text className="text-white font-bold" style={{ fontSize: 24, marginBottom: 24 }}>
          Crear lista
        </Text>

        {/* CARD */}
        <View
          style={{
            backgroundColor: '#3B2207',
            borderRadius: 20,
            padding: 20,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.08)',
            gap: 16,
          }}
        >
          {/* NOMBRE */}
          <View>
            <Text className="text-gray-300" style={{ marginBottom: 8 }}>
              Nombre
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Ej: Futuristas"
              placeholderTextColor="#888"
              editable={!createdListName}
              selectionColor="#AA500F"
              style={{
                backgroundColor: 'rgba(255,255,255,0.07)',
                color: createdListName ? '#888' : 'white',
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderRadius: 12,
                fontSize: 15,
              }}
            />
          </View>

          {/* TIPO */}
          <View>
            <Text className="text-gray-300" style={{ marginBottom: 8 }}>
              Tipo
            </Text>
            <View
              style={{
                flexDirection: 'row',
                backgroundColor: 'rgba(255,255,255,0.07)',
                borderRadius: 12,
                padding: 4,
                opacity: createdListName ? 0.5 : 1,
              }}
            >
              <TouchableOpacity
                onPress={() => !createdListName && setType("pelicula")}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 10,
                  backgroundColor: type === "pelicula" ? "#AA500F" : "transparent",
                  alignItems: 'center',
                }}
              >
                <Text className="text-white font-bold">Películas</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => !createdListName && setType("serie")}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 10,
                  backgroundColor: type === "serie" ? "#AA500F" : "transparent",
                  alignItems: 'center',
                }}
              >
                <Text className="text-white font-bold">Series</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ACCION */}
          {!createdListName ? (
            <TouchableOpacity
              onPress={handleCreateList}
              disabled={loading}
              style={{
                backgroundColor: '#AA500F',
                paddingVertical: 14,
                borderRadius: 12,
                alignItems: 'center',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold">Crear lista</Text>
              )}
            </TouchableOpacity>
          ) : (
            <View style={{ gap: 10 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <Ionicons name="checkmark-circle" size={18} color="#AA500F" />
                <Text style={{ color: '#AA500F', fontWeight: '700' }}>
                  Lista creada exitosamente
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setModalVisible(true)}
                style={{
                  backgroundColor: '#AA500F',
                  paddingVertical: 14,
                  borderRadius: 12,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <Ionicons name="add-circle-outline" size={18} color="white" />
                <Text className="text-white font-bold">Agregar contenido</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.back()}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  paddingVertical: 14,
                  borderRadius: 12,
                  alignItems: 'center',
                }}
              >
                <Text className="text-white font-bold">Listo</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* BOTTOM SHEET MODAL */}
      {modalVisible && createdListName && (
        <View style={{ position: 'absolute', inset: 0, justifyContent: 'flex-end' }}>
          <Pressable
            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }}
            onPress={() => setModalVisible(false)}
          />

          <View
            style={{
              backgroundColor: '#1a1a1a',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              height: '85%',
              padding: 20,
              paddingBottom: 10,
            }}
          >
            {/* HANDLE */}
            <View
              style={{
                width: 40,
                height: 4,
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: 4,
                alignSelf: 'center',
                marginBottom: 16,
              }}
            />

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16,
              }}
            >
              <Text className="text-white font-bold" style={{ fontSize: 18 }}>
                Agregar contenido
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderRadius: 20,
                  padding: 4,
                }}
              >
                <Ionicons name="close" size={22} color="white" />
              </TouchableOpacity>
            </View>

            <View style={{ flex: 1 }}>
              <SearchModalLists
                listName={createdListName}
                listType={type}
                selectedTitles={selectedTitles}
                setSelectedTitles={setSelectedTitles}
              />
            </View>

            <View
              style={{
                paddingTop: 12,
                borderTopWidth: 1,
                borderTopColor: 'rgba(255,255,255,0.08)',
              }}
            >
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={{
                  backgroundColor: '#AA500F',
                  paddingVertical: 14,
                  borderRadius: 12,
                  alignItems: 'center',
                }}
              >
                <Text className="text-white font-bold">Listo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}