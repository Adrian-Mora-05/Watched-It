import ErrorToast from '@/components/ui/ErrorMessage'
import { useLayout } from '@/hooks/useLayout';
import { Pressable, Text } from '@react-native-ama/react-native'
import { useState, useEffect } from 'react';
import { View, Image, useWindowDimensions, FlatList, ScrollView } from 'react-native'
import { getFriendRequests, acceptFriendRequest, denyFriendRequest, getFriend } from '@/services/friend.service'
import Button from '@/components/ui/Button';
import { useSession } from '@/hooks/ctx';
import { getAvatarUrl } from '@/services/friend.service';
import { router } from 'expo-router';

type FriendRequest = {
    id: number;
    sender_name: string;
    sender_profile_pic: string | null;
};

type Friend = {
    id: number;
    friend_id: string;
    friend_name: string;
    friend_profile_pic: string | null;
    chat_id: number;
};

export default function index() {
    const [toastMessage, setToastMessage] = useState<string | undefined>();
    const { session } = useSession();
    const [requests, setRequests] = useState<FriendRequest[]>([]);
    const [friends, setFriends] = useState<Friend[]>([]);

    const { headerHeight, screenWidth, headerPaddingBottom, paddingHorizontal, paddingVertical } = useLayout();
    const { width } = useWindowDimensions();

    const widthButton = width * 0.20;
    const avatarSize = width * 0.12;
    const gap = width * 0.03;

    useEffect(() => {
        getFriendRequests(session!).then((data) => {
            setRequests(data);
        }).catch((e) => {
            setToastMessage('Error al cargar las solicitudes' + e.message);
        });

        getFriend(session!).then((data) => {
            setFriends(data);
        }).catch((e) => {
            setToastMessage('Error al cargar las conversaciones' + e.message);
        });
    }, []);

    const handleAccept = (requestId: number) => {
        acceptFriendRequest(session!, requestId).then(() => {
            setRequests(prev => prev.filter(r => r.id !== requestId));
            setToastMessage('Solicitud aceptada');
        }).catch((e) => {
            setToastMessage('Error al aceptar la solicitud' + e.message);
        });
    };

    const handleDeny = (requestId: number) => {
        denyFriendRequest(session!, requestId).then(() => {
            setRequests(prev => prev.filter(r => r.id !== requestId));
            setToastMessage('Solicitud eliminada');
        }).catch((e) => {
            setToastMessage('Error al eliminar la solicitud' + e.message);
        });
    };

    return (
        <ScrollView className="flex-1 bg-dark">
            <ErrorToast
                message={toastMessage}
                visible={!!toastMessage}
                onDismiss={() => setToastMessage(undefined)}
            />
            {/* Header */}
            <View className="bg-chocolate items-center justify-end"
                style={{ height: headerHeight, width: screenWidth }}>
                <Text
                    accessibilityRole="header"
                    accessibilityLanguage="es"
                    autofocus
                    className="text-white text-large font-bold"
                    style={{ paddingBottom: headerPaddingBottom }}
                >
                    Amigos
                </Text>
            </View>

            <View style={{ paddingHorizontal, paddingVertical, gap }}>
                <Text className="text-white text-intermediate font-bold">Solicitudes</Text>

                <FlatList
                    data={requests}
                    keyExtractor={(item) => item.id.toString()}
                    scrollEnabled={false}
                    ItemSeparatorComponent={() => (
                        <View style={{ height: 0.5, marginVertical: gap / 2 }} />
                    )}
                    renderItem={({ item }) => {
                        const avatarUrl = item.sender_profile_pic ? getAvatarUrl(item.sender_profile_pic) : null;
                        return (
                            <View className="flex-row items-center" style={{ gap }}>
                                <Image
                                    source={avatarUrl
                                        ? { uri: avatarUrl }
                                        : require('../../../../assets/images/default-profile-pic.png')
                                    }
                                    style={{ width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }}
                                />
                                <Text className="text-white text-medium flex-1">{item.sender_name}</Text>
                                <Button
                                    label="Confirmar"
                                    bgColor='#D9D9D9'
                                    textColor='#231709'
                                    width={widthButton}
                                    onPress={() => handleAccept(item.id)}
                                />
                                <Button
                                    label="Eliminar"
                                    bgColor='#D9D9D9'
                                    textColor='#231709'
                                    width={widthButton}
                                    onPress={() => handleDeny(item.id)}
                                />
                            </View>
                        );
                    }}
                />

                <View style={{ height: 1, backgroundColor: '#5D3E14' }} />
                <Text className="text-white text-intermediate font-bold">Conversaciones</Text>

                <FlatList
                    data={friends}
                    keyExtractor={(item) => item.id.toString()}
                    scrollEnabled={false}
                    ItemSeparatorComponent={() => (
                        <View style={{ height: 0.5, backgroundColor: '#5D3E14', marginVertical: gap / 2 }} />
                    )}
                    renderItem={({ item }) => {
                        const avatarUrl = item.friend_profile_pic ? getAvatarUrl(item.friend_profile_pic) : null;
                        return (
                                <Pressable
                                    onPress={() => router.push({ pathname: '/(home)/(friends)/[id]', params: { id: item.chat_id } })}
                                    accessibilityRole="button"
                                    accessibilityLabel={`Chat con ${item.friend_name}`}
                                    className="flex-row items-center"
                                    style={{ gap }}
                                >
                                <Image
                                    source={avatarUrl
                                        ? { uri: avatarUrl }
                                        : require('../../../../assets/images/default-profile-pic.png')
                                    }
                                    style={{ width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }}
                                />
                                <Text className="text-white text-medium flex-1">{item.friend_name}</Text>
                            </Pressable>
                        );
                    }}
                />
            </View>
        </ScrollView>
    );
}