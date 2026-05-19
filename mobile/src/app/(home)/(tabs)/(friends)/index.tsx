import ErrorToast from '@/components/ui/ErrorMessage'
import { useLayout } from '@/hooks/useLayout';
import { Pressable, Text } from '@react-native-ama/react-native'
import { useState, useEffect, useCallback, memo } from 'react';
import { View, Image, useWindowDimensions, FlatList, ScrollView, AccessibilityInfo } from 'react-native'
import { getFriendRequests, acceptFriendRequest, denyFriendRequest, getFriend } from '@/services/friend.service'
import Button from '@/components/ui/Button';
import { useSession } from '@/hooks/ctx';
import { getAvatarUrl } from '@/services/friend.service';
import { router } from 'expo-router';
import OkayToast from '@/components/ui/OkayMessage';
import { useFocusEffect } from "expo-router";



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

// ── Memoized request row ──────────────────────────────────────────────────────
const RequestRow = memo(({
    item,
    avatarSize,
    gap,
    widthButton,
    onAccept,
    onDeny,
}: {
    item: FriendRequest;
    avatarSize: number;
    gap: number;
    widthButton: number;
    onAccept: (id: number) => void;
    onDeny: (id: number) => void;
}) => {
    const avatarUrl = item.sender_profile_pic ? getAvatarUrl(item.sender_profile_pic) : null;

    return (
        <View
            accessible={true}
            accessibilityRole="none"
            accessibilityLabel={`Solicitud de amistad de ${item.sender_name}`}
            className="flex-row items-center"
            style={{ gap }}
        >
            <Image
                source={avatarUrl
                    ? { uri: avatarUrl }
                    : require('../../../../../assets/images/default-profile-pic.png')
                }
                style={{ width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }}
                accessibilityLabel={`Foto de perfil de ${item.sender_name}`}
                accessibilityRole="image"
            />
            <Text
                className="text-white text-medium flex-1"
                accessibilityLanguage="es"
            >
                {item.sender_name}
            </Text>
            <Button
                label="Confirmar"
                bgColor='#D9D9D9'
                textColor='#231709'
                width={widthButton}
                onPress={() => onAccept(item.id)}

                accessibilityHint={`Acepta esta solicitud de amistad de ${item.sender_name}`}
                accessibilityLanguage="es"
            />
            <Button
                label="Eliminar"
                bgColor='#D9D9D9'
                textColor='#231709'
                width={widthButton}
                onPress={() => onDeny(item.id)}
                accessibilityHint={`Rechaza y elimina esta solicitud de amistad de ${item.sender_name}`}
                accessibilityLanguage="es"
            />
        </View>
    );
});

// ── Memoized friend row ───────────────────────────────────────────────────────
const FriendRow = memo(({
    item,
    avatarSize,
    gap,
}: {
    item: Friend;
    avatarSize: number;
    gap: number;
}) => {
    const avatarUrl = item.friend_profile_pic ? getAvatarUrl(item.friend_profile_pic) : null;

    return (
        <Pressable
            onPress={() => router.push({
                pathname: '/[id]',
                params: { id: item.chat_id, name: item.friend_name, profilePic: item.friend_profile_pic }
            })}
            accessibilityRole="button"
            accessibilityLabel={`Abrir chat con ${item.friend_name}`}
            accessibilityHint="Abre la conversación con este amigo"
            accessibilityLanguage="es"
            className="flex-row items-center"
            style={{ gap, minHeight: 48 }}
        >
            <Image
                source={avatarUrl
                    ? { uri: avatarUrl }
                    : require('../../../../../assets/images/default-profile-pic.png')
                }
                style={{ width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }}
                accessibilityLabel={`Foto de perfil de ${item.friend_name}`}
                accessibilityRole="image"
            />
            <Text
                className="text-white text-medium flex-1"
                accessibilityLanguage="es"
            >
                {item.friend_name}
            </Text>
        </Pressable>
    );
});

// ── Empty state components ────────────────────────────────────────────────────
const EmptyRequests = memo(() => (
    <Text
        className="text-bone text-medium"
        accessibilityLanguage="es"
        accessibilityLiveRegion="polite"
        accessibilityRole="text"
    >
        No tienes solicitudes de amistad pendientes
    </Text>
));

const EmptyFriends = memo(() => (
    <Text
        className="text-bone text-medium"
        accessibilityLanguage="es"
        accessibilityLiveRegion="polite"
        accessibilityRole="text"
    >
        No tienes amigos agregados
    </Text>
));

// ── Screen ────────────────────────────────────────────────────────────────────
export default function index() {
    const [errorToastMessage, setErrorToastMessage] = useState<string | undefined>();
    const [okayToastMessage, setOkayToastMessage] = useState<string | undefined>();
    const { session } = useSession();
    const [requests, setRequests] = useState<FriendRequest[]>([]);
    const [friends, setFriends] = useState<Friend[]>([]);

    const { headerHeight, screenWidth, headerPaddingBottom, paddingHorizontal, paddingVertical } = useLayout();
    const { width } = useWindowDimensions();

    const widthButton = width * 0.20;
    const avatarSize = width * 0.12;
    const gap = width * 0.03;

// Remove the old useEffect and replace with:
useFocusEffect(
  useCallback(() => {
    if (!session) return;

    getFriendRequests(session).then((data) => {
      setRequests(data);
      AccessibilityInfo.announceForAccessibility(
        data.length > 0
          ? `Tienes ${data.length} solicitud${data.length !== 1 ? 'es' : ''} de amistad pendiente${data.length !== 1 ? 's' : ''}`
          : 'No tienes solicitudes de amistad pendientes'
      );
    }).catch((e) => {
      setErrorToastMessage('Error al cargar las solicitudes: ' + e.message);
    });

    getFriend(session).then((data) => {
      setFriends(data);
    }).catch((e) => {
      setErrorToastMessage('Error al cargar las conversaciones: ' + e.message);
    });
  }, [session])
);

    const handleAccept = useCallback((requestId: number) => {
        const request = requests.find(r => r.id === requestId);
        acceptFriendRequest(session!, requestId).then(() => {
            setRequests(prev => prev.filter(r => r.id !== requestId));
            const msg = `Solicitud de ${request?.sender_name ?? 'amigo'} aceptada`;
            setOkayToastMessage(msg);
            AccessibilityInfo.announceForAccessibility(msg);
        }).catch((e) => {
            setErrorToastMessage('Error al aceptar la solicitud: ' + e.message);
        });

        getFriend(session!).then((data) => {
            setFriends(data);
        }).catch((e) => {
            setErrorToastMessage('Error al cargar las conversaciones: ' + e.message);
        });
    }, [requests, session]);

    const handleDeny = useCallback((requestId: number) => {
        const request = requests.find(r => r.id === requestId);
        denyFriendRequest(session!, requestId).then(() => {
            setRequests(prev => prev.filter(r => r.id !== requestId));
            const msg = `Solicitud de ${request?.sender_name ?? 'amigo'} eliminada`;
            setOkayToastMessage(msg);
            AccessibilityInfo.announceForAccessibility(msg);
        }).catch((e) => {
            setErrorToastMessage('Error al eliminar la solicitud: ' + e.message);
        });
    }, [requests, session]);

    const renderRequest = useCallback(({ item }: { item: FriendRequest }) => (
        <RequestRow
            item={item}
            avatarSize={avatarSize}
            gap={gap}
            widthButton={widthButton}
            onAccept={handleAccept}
            onDeny={handleDeny}
        />
    ), [avatarSize, gap, widthButton, handleAccept, handleDeny]);

    const renderFriend = useCallback(({ item }: { item: Friend }) => (
        <FriendRow
            item={item}
            avatarSize={avatarSize}
            gap={gap}
        />
    ), [avatarSize, gap]);

    const requestKeyExtractor = useCallback((item: FriendRequest) => item.id.toString(), []);
    const friendKeyExtractor = useCallback((item: Friend) => item.id.toString(), []);

    return (
        <ScrollView
            className="flex-1 bg-dark"
            accessibilityLanguage="es"
        >
            <ErrorToast
                message={errorToastMessage}
                visible={!!errorToastMessage}
                onDismiss={() => setErrorToastMessage(undefined)}
            />
            <OkayToast
                message={okayToastMessage}
                visible={!!okayToastMessage}
                onDismiss={() => setOkayToastMessage(undefined)}
            />

            {/* Header */}
            <View
                className="bg-chocolate items-center justify-end"
                style={{ height: headerHeight, width: screenWidth }}
            >
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

                {/* Solicitudes section */}
                <Text
                    className="text-white text-intermediate font-bold"
                    accessibilityRole="header"
                    accessibilityLanguage="es"
                >
                    Solicitudes
                    {requests.length > 0 ? ` (${requests.length})` : ''}
                </Text>

                <FlatList
                    data={requests}
                    keyExtractor={requestKeyExtractor}
                    renderItem={renderRequest}
                    scrollEnabled={false}
                    accessibilityLabel={`Lista de solicitudes de amistad, ${requests.length} pendiente${requests.length !== 1 ? 's' : ''}`}
                    accessibilityLanguage="es"
                    ListEmptyComponent={EmptyRequests}
                    ItemSeparatorComponent={() => (
                        <View
                            style={{ height: 0.5, marginVertical: gap / 2 }}
                            accessible={false}
                            importantForAccessibility="no"
                        />
                    )}
                />

                {/* Divider */}
                <View
                    style={{ height: 1, backgroundColor: '#5D3E14' }}
                    accessible={false}
                    importantForAccessibility="no"
                />

                {/* Conversaciones section */}
                <Text
                    className="text-white text-intermediate font-bold"
                    accessibilityRole="header"
                    accessibilityLanguage="es"
                >
                    Conversaciones
                    {friends.length > 0 ? ` (${friends.length})` : ''}
                </Text>

                <FlatList
                    data={friends}
                    keyExtractor={friendKeyExtractor}
                    renderItem={renderFriend}
                    scrollEnabled={false}
                    accessibilityLabel={`Lista de conversaciones, ${friends.length} amigo${friends.length !== 1 ? 's' : ''}`}
                    accessibilityLanguage="es"
                    ListEmptyComponent={EmptyFriends}
                    ItemSeparatorComponent={() => (
                        <View
                            style={{ height: 0.5, backgroundColor: '#5D3E14', marginVertical: gap / 2 }}
                            accessible={false}
                            importantForAccessibility="no"
                        />
                    )}
                />

            </View>
        </ScrollView>
    );
}