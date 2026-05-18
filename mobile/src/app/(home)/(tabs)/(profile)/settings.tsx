import { router } from 'expo-router';
import { View, Pressable, ScrollView,Keyboard } from "react-native";
import { useState, useEffect } from "react";
import { Text } from "@react-native-ama/react-native";
import ReturnButton from '@/components/ui/ReturnButton';
import TitleGrid from '@/components/ui/TitleGrid';
import { useSession } from '@/hooks/ctx';
import { getMovies } from "@/services/movie.service";
import { useFavorites } from '@/hooks/useFavorites';
import ActionButton from '@/components/ui/ActionButton';
import { getShows } from '@/services/show.service';
import SearchModal from '@/hooks/searchModalFavorites';
import ProfilePhotoSection from '@/hooks/updatePhoto';
import { updateFavorites, uploadProfilePicture, removeProfilePicture } from '@/services/user.service';
import { useLayout } from '@/hooks/useLayout';
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
    
    const { headerHeight, screenWidth, paddingHorizontal, paddingVertical,screenHeight,headerPaddingBottom } = useLayout();
  const gap = screenWidth * 0.03;
    const { user, signOut, session, refreshUser } = useSession();

    const { movies, shows, refetch } = useFavorites();

    const [tempMovies, setTempMovies] = useState<any[]>([]);
    const [tempShows, setTempShows] = useState<any[]>([]);

    const [editingMovieIndex, setEditingMovieIndex] = useState<number | null>(null);
    const [showMovieModal, setShowMovieModal] = useState(false);
    
    const [editingShowIndex, setEditingShowIndex] = useState<number | null>(null);
    const [showShowModal, setShowShowModal] = useState(false);

    const [photoUri, setPhotoUri] = useState<string | null>(
    user?.profilePicture ?? null
    );
    const resolvedPhotoUri = Array.isArray(photoUri) ? photoUri[0] : photoUri;
    const [photoDeleted, setPhotoDeleted] = useState(false);
    
    const handleSave = async () => {
    try {
        if (!session) return;

        const movieIds = tempMovies
        .filter(Boolean)
        .map(m => m.id);

        const showIds = tempShows
        .filter(Boolean)
        .map(s => s.id);

        await updateFavorites(movieIds, showIds, session);

        if (photoUri?.startsWith("file://")) {
            await uploadProfilePicture(photoUri, session);
        } else if (photoUri === null) {
            await removeProfilePicture(session);
            
        }

        await refetch();
        await refreshUser();
        console.log("Cambios guardados");

        // opcional
        router.replace("/(profile)");

        } catch (error:any) {
            console.log("Error data:", JSON.stringify(error?.response?.data));
        }
    };

    const handleCancel = () => {

        setTempMovies(movies);
        setTempShows(shows);

        setPhotoUri(user?.profilePicture ?? null);;

        setShowMovieModal(false);
        setShowShowModal(false);

        setEditingMovieIndex(null);
        setEditingShowIndex(null);

        Keyboard.dismiss();

        router.back();
    };

    useEffect(() => {
        setTempMovies(movies);
    }, [movies]);

    useEffect(() => {
        setTempShows(shows);
    }, [shows]);

    const peliculasMostradas = [...tempMovies];
    while (peliculasMostradas.length < 3) {
        peliculasMostradas.push(null);
    }

    const showsMostrados = [...tempShows];
    while (showsMostrados.length < 3) {
        showsMostrados.push(null);
    }
    
    useEffect(() => {}, [resolvedPhotoUri]);

    return (
        <View className="py-0 flex-1 bg-chocolate">
            <View className="bg-flour">
          <View
            className=" items-center justify-end"
            style={{ height: headerHeight, width: screenWidth }}
          >
            <View
              className="flex-row w-full items-center"
              style={{ paddingBottom: headerPaddingBottom, paddingHorizontal: gap }}
            >

              {/* Title */}
            <ActionButton
                    variant='save'
                    label="Guardar"
                    onPress={handleSave}
                />
              <View className="flex-1 items-center">
                <Text
                  accessibilityRole="header"
                  accessibilityLanguage="es"
                  autofocus
                  className="text-black text-large font-bold text-center"
                >
                  Ajustes
                </Text>
              </View>
                            <ActionButton
                    variant='cancel'
                    label="Cancelar"
                    onPress={handleCancel}
                />
            </View>
          </View>
            </View>
            <ScrollView
            showsVerticalScrollIndicator={false}
            className='px-5 p-2'
            accessibilityLabel="Contenido de ajustes">

                    <Text className='text-white text-medium font-semibold' style={{ marginTop: gap}}
                        accessibilityRole="text"
                        accessibilityLabel={`Sesión iniciada con ${user?.name ?? "Usuario"} y correo ${user?.email ?? "correo desconocido"}`}>
                        {'Sesión iniciada con: ' +
                            (user?.name ?? "Usuario") +
                            ' (' +
                            (user?.email ?? "email desconocido") +
                            ')'}
                            
                    </Text>
                    <View
                    style={{ height: 1, backgroundColor: '#C4C4C4' ,marginVertical: gap*2}}
                    accessible={false}
                    importantForAccessibility="no"
                    />
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Cambiar contraseña"
                        accessibilityLanguage="es"
                        onPress={() => router.push("/forgot-password") }
                        >
                        <Text className="text-white text-medium font-semibold">
                            Cambiar contraseña
                        </Text>
                    </Pressable>
                                        <View
                    style={{ height: 1, backgroundColor: '#C4C4C4' ,marginVertical: gap*2}}
                    accessible={false}
                    importantForAccessibility="no"
                    />
                <View 
                    accessible={true}
                    accessibilityLabel="Sección de películas favoritas"
                >
                    <Text className='text-white text-medium font-semibold'
                     accessibilityRole="header"
                        accessibilityLabel="Editar películas favoritas">
                        Editar Películas Favoritas
                    </Text>
                    <View className="py-3 flex-row w-full jpx-3 justify-between">
                        {peliculasMostradas.map((pelicula, index) => (
                            <TitleGrid 
                                key={index}
                                item={pelicula}
                                onPress={() => {
                                setEditingMovieIndex(index);
                                setShowMovieModal(true);
                                }}
                            />
                        ))}
                    </View>
                </View>
                    <View
                    style={{ height: 1, backgroundColor: '#C4C4C4' ,marginVertical: gap*2}}
                    accessible={false}
                    importantForAccessibility="no"
                    />
            <ScrollView className="max-h-60">
                <SearchModal
                    visible={showMovieModal}
                    onClose={() => setShowMovieModal(false)}
                    label="Busca una película"
                    existingItems={tempMovies}
                    onSearch={(text) =>
                    getMovies({ skip: 0, limit: 10, title: text }) }
                    onSelect={(movie) => {
                        if (editingMovieIndex === null) return;
                    setTempMovies(prev => {
                        const updated = [...prev];
                        updated[editingMovieIndex] = movie;
                        return updated;
                    }); }}
                />
            </ScrollView>
                <View 
                    accessible={true}
                    accessibilityLabel="Sección de series favoritas"
                >
                    <Text className='text-white text-medium font-semibold'
                        accessibilityRole="header"
                        accessibilityLabel="Editar series favoritas"
                    >
                        Editar Series Favoritas
                    </Text>
                    <View className="py-3 flex-row justify-between w-full px-2">
                        {showsMostrados.map((show, index) => (
                            <TitleGrid
                                key={index}
                                item={show}
                                onPress={() => {
                                    setEditingShowIndex(index);
                                    setShowShowModal(true);
                                }}
                            />
                        ))}
                    </View>
                    <View className="flex-1 bg-black/80 justify-center px-5">
                        <SearchModal
                            visible={showShowModal}
                            onClose={() => setShowShowModal(false)}
                            label="Busca una serie"
                            existingItems={tempShows}
                            onSearch={(text) =>
                                getShows({ skip: 0, limit: 10, title: text })
                            }
                            onSelect={(show) => {
                                if (editingShowIndex === null) return;
                            setTempShows(prev => {
                                const updated = [...prev];
                                updated[editingShowIndex] = show;
                                return updated; });
                            }}
                        />
                    </View>
                </View> 
                <View
                    style={{ height: 1, backgroundColor: '#C4C4C4' ,marginVertical: gap*2}}
                    accessible={false}
                    importantForAccessibility="no"
                    />
                <View className="flex-row items-center "
                    accessibilityLabel="Sección de foto de perfil">
                    <ProfilePhotoSection
                    initialPhoto={photoUri ?? user?.profilePicture}
                    onChange={(uri) => setPhotoUri(uri)}
                    />
                </View>
                    <View
                    style={{ height: 1, backgroundColor: '#C4C4C4' ,marginVertical: gap*2}}
                    accessible={false}
                    importantForAccessibility="no"
                    />
                    <Pressable onPress={() => signOut()}
                        accessibilityRole="button"
                        accessibilityLabel="Cerrar sesión"
                        accessibilityHint="Cierra la sesión actual"
                        >
                        <Text className='text-white text-medium font-semibold'>
                            Cerrar Sesión
                        </Text>
                    </Pressable>
                    <View
                    style={{ height: 1, backgroundColor: '#C4C4C4' ,marginVertical: gap*2}}
                    accessible={false}
                    importantForAccessibility="no"
                    />
                    <Pressable onPress={() => console.log("Eliminar cuenta")}
                        accessibilityRole="button"
                        accessibilityLabel="Eliminar cuenta"
                        accessibilityHint="Elimina la cuenta de usuario"
                    >
                        <Text className='text-white text-medium font-semibold mb-5'>
                            Eliminar Cuenta
                        </Text>
                    </Pressable>

            </ScrollView>
        </View>
    );
}
