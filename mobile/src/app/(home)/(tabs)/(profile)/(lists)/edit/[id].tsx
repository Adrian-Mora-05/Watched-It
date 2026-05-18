import {
  View,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Modal,
  Pressable,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@react-native-ama/react-native';
import { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useSession } from '@/hooks/ctx';
import { getListById, baseUrl, deleteList, renameList, removeFromList } from '@/services/list.service';
import SearchModalLists from '@/hooks/searchModalLists';
import { ReadEachCatalogContent } from '@shared/catalog.schema';
import { useLayout } from '@/hooks/useLayout';
import { Ionicons } from '@expo/vector-icons';
import api from '@/services/api';

const groupListContent = (data: any[]) => {
  if (!data?.length) return null;
  const first = data[0];
  return {
    id: first.id,
    nombre_lista: first.nombre_lista,
    nombre_usuario: first.nombre_usuario,
    tipo: first.tipo,
    content: data
      .filter((item) => item.contenido_id !== null)
      .map((item) => ({
        contenido_id: item.contenido_id,
        image_link: item.enlace_imagen,
        type: item.tipo,
      })),
  };
};

export default function EditListScreen() {
  const { id } = useLocalSearchParams();
  const { session } = useSession();
  const { headerHeight, screenWidth } = useLayout();

  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<any>(null);
  const [selectedTitles, setSelectedTitles] = useState<ReadEachCatalogContent[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  const [title, setTitle] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [savingTitle, setSavingTitle] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);

  const listType = list?.tipo === 'serie' ? 'serie' : 'pelicula';

  useEffect(() => {
  if (!session || !id) return;

  const fetchList = async () => {
    try {
      setLoading(true);
      const data = await getListById(Number(id), session!);
      const grouped = groupListContent(data);
      setList(grouped);
      setTitle(grouped?.nombre_lista ?? '');

      if (grouped?.content) {
        setSelectedTitles(
          grouped.content.map((item: any) => ({
            id: item.contenido_id,
            image_link: item.image_link,
            type_catalog: item.type,
            title: '',
          }))
        );
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  fetchList();
}, [session, id]);

  const handleSaveTitle = async () => {
    if (!title.trim() || title === list?.nombre_lista) {
      setIsEditingTitle(false);
      return;
    }

    try {
      setSavingTitle(true);
      await renameList(
        {
          nombre_lista: list.nombre_lista,
          nuevo_nombre: title.trim(),
          tipo: listType,
        },
        session!
      );
      setList((prev: any) => ({ ...prev, nombre_lista: title.trim() }));
      setIsEditingTitle(false);
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'No se pudo cambiar el nombre');
    } finally {
      setSavingTitle(false);
    }
  };

  const handleRemove = (item: any) => {
  Alert.alert(
    'Quitar título',
    '¿Quieres quitar este título de la lista?',
    [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Quitar',
        style: 'destructive',
        onPress: async () => {
          try {
            setRemovingId(item.id);
            await removeFromList(session!, item.id, {
              tipo: listType,
              nombre_lista: list.nombre_lista,
            });
            setSelectedTitles((prev) =>
              prev.filter((x) => x.id !== item.id)
            );
          } catch (error) {
            console.log(error);
            Alert.alert('Error', 'No se pudo quitar el título');
          } finally {
            setRemovingId(null);
          }
        },
      },
    ]
  );
};

  const handleDeleteList = () => {
    Alert.alert(
      'Eliminar lista',
      '¿Estás seguro? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await deleteList(
                {
                  nombre_lista: list.nombre_lista,
                  tipo: listType,
                },
                session!
              );
              router.back();
            } catch (error) {
              console.log(error);
              Alert.alert('Error', 'No se pudo eliminar la lista');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-dark items-center justify-center">
        <ActivityIndicator color="white" size="large" />
      </View>
    );
  }

  const itemWidth = (screenWidth - 32 - 16) / 3;

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 16, paddingTop: headerHeight * 0.3 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              paddingVertical: 16,
            }}
          >
            {/* BACK */}
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                position: "absolute",
                left: 0,
                padding: 8,
              }}
            >
              <Ionicons name="arrow-back" size={24} color="#AA500F" />
            </TouchableOpacity>

            {/* TITLE */}
            <Text
              style={{
                color: "#FFFFFF",
                fontWeight: "700",
                letterSpacing: 0.5,
              }}
              className="text-large"
            >
              Editar Lista
            </Text>
          </View>

          {/* NOMBRE */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius: 14,
              paddingHorizontal: 14,
              paddingVertical: 10,
              marginBottom: 20,
              gap: 10,
            }}
          >
            {isEditingTitle ? (
              <TextInput
                value={title}
                onChangeText={setTitle}
                autoFocus
                placeholder="Nombre de la lista"
                placeholderTextColor="#888"
                selectionColor="#AA500F"
                style={{
                  color: 'white',
                  fontSize: 20,
                  fontWeight: '700',
                  flex: 1,
                  paddingVertical: 2,
                }}
              />
            ) : (
              <Text
                className="text-white text-normal"
                style={{ flex: 1 }}
              >
                {list?.nombre_lista}
              </Text>
            )}

            {savingTitle ? (
              <ActivityIndicator size="small" color="#AA500F" />
            ) : (
              <TouchableOpacity
                onPress={isEditingTitle ? handleSaveTitle : () => setIsEditingTitle(true)}
                style={{
                  backgroundColor: isEditingTitle ? '#AA500F' : 'rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  padding: 6,
                }}
              >
                <MaterialIcons
                  name={isEditingTitle ? 'check' : 'edit'}
                  size={20}
                  color="white"
                />
              </TouchableOpacity>
            )}
          </View>

          {/* ACCIONES */}
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 24 }}>
            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                backgroundColor: '#AA500F',
                paddingVertical: 12,
                borderRadius: 12,
              }}
            >
              <Ionicons name="add-circle-outline" size={18} color="white" />
              <Text className="text-white font-bold">Agregar títulos</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleDeleteList}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                backgroundColor: 'rgba(220,38,38,0.15)',
                borderWidth: 1,
                borderColor: '#dc2626',
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 12,
              }}
            >
              <Ionicons name="trash-outline" size={18} color="#dc2626" />
              <Text style={{ color: '#dc2626', fontWeight: '700' }}>Eliminar lista</Text>
            </TouchableOpacity>
          </View>

          {/* SUBTITULO */}
          <Text className="text-white font-bold" style={{ fontSize: 16, marginBottom: 14 }}>
            Contenido ({selectedTitles.length})
          </Text>

          {/* GRID */}
          {selectedTitles.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 40, gap: 10 }}>
              <Ionicons name="film-outline" size={48} color="#AA500F" />
              <Text className="text-gray-400">
                Esta lista está vacía. ¡Agrega títulos!
              </Text>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {selectedTitles.map((item: any, index: number) => (
                <View
                  key={`${item.type_catalog}-${item.id}-${index}`}
                  style={{ width: itemWidth }}
                >
                  <View style={{ position: 'relative' }}>
                    <Image
                      source={{ uri: baseUrl + item.image_link }}
                      style={{ width: '100%', aspectRatio: 2 / 3, borderRadius: 10 }}
                      contentFit="cover"
                    />
                    <TouchableOpacity
                      onPress={() => handleRemove(item)}
                      disabled={removingId === item.id}
                      style={{
                        position: 'absolute',
                        top: 6,
                        right: 6,
                        backgroundColor: 'rgba(0,0,0,0.65)',
                        borderRadius: 20,
                        padding: 5,
                      }}
                    >
                      {removingId === item.id ? (
                        <ActivityIndicator size="small" color="#AA500F" />
                      ) : (
                        <Ionicons name="trash" size={16} color="#AA500F" />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* MODAL */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }}
          onPress={() => setModalVisible(false)}
        >
          <Pressable
            style={{
              flex: 1,
              marginTop: 80,
              backgroundColor: '#231709',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 20,
            }}
          >
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
                listName={list?.nombre_lista}
                listType={listType}
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
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}