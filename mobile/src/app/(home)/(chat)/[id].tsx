import { router, useLocalSearchParams } from 'expo-router';
import { Image, Keyboard, KeyboardAvoidingView, Platform, ScrollView, useWindowDimensions, View, TouchableWithoutFeedback } from 'react-native';
import { Text } from '@react-native-ama/react-native';
import { useSession } from '@/hooks/ctx';
import { useLayout } from '@/hooks/useLayout';
import ErrorToast from '@/components/ui/ErrorMessage';
import { useEffect, useState, useRef } from 'react';
import ReturnButton from '@/components/ui/ReturnButton';
import { getAvatarUrl } from '@/services/friend.service';
import MessageBubble from '@/components/ui/MessageBubble';
import Input from '@/components/ui/Input';
import AntDesign from '@expo/vector-icons/AntDesign';
import { sendMessage, getMessages, connectSocket, disconnectSocket } from '@/services/chat.service';
import { jwtDecode } from 'jwt-decode';

type Message = {
    id: number;
    texto: string;
    fecha_creacion: string;
    user_id: string;
    isOwn: boolean;
};

export default function Chat() {
    const { id, name, profilePic } = useLocalSearchParams();
    const parsedId = Array.isArray(id) ? id[0] : id;
    const parsedName = Array.isArray(name) ? name[0] : name;
    const parsedProfilePic = Array.isArray(profilePic) ? profilePic[0] : profilePic;
    const { session } = useSession();
    const user = session ? jwtDecode(session) : null;
    const { headerHeight, screenWidth, headerPaddingBottom, paddingHorizontal, paddingVertical } = useLayout();
    const { width } = useWindowDimensions();
    const [toastMessage, setToastMessage] = useState<string | undefined>();
    const [messages, setMessages] = useState<Message[]>([]);
    const [messageText, setMessageText] = useState('');
    const [userId, setUserId] = useState<string | null>(null);
    const scrollViewRef = useRef<ScrollView>(null);

    const gap = width * 0.03;
    const avatarSize = width * 0.12;
    const avatarUrl = parsedProfilePic ? getAvatarUrl(parsedProfilePic) : null;

    // Get userId from token (JWT payload)
    useEffect(() => {
        if (!session) return;
        try {
            const payload = JSON.parse(atob(session.split('.')[1]));
            setUserId(payload.sub);
        } catch {
            setToastMessage('Error al obtener usuario');
        }
    }, [session]);

    // Load existing messages
    useEffect(() => {
        if (!session || !parsedId || !userId) return;
        getMessages(session, { chat_id: Number(parsedId), skip: 0, limit: 50 })
            .then((data) => {
                const mapped = data.reverse().map((msg: any) => ({ 
                    ...msg,
                    isOwn: msg.id_usuario === userId,
                }));
                setMessages(mapped);
            })
            .catch((e) => setToastMessage('Error al cargar mensajes: ' + e.message));
    }, [session, parsedId, userId]);

    useEffect(() => {
        if (!session) return;

        const socket = connectSocket(session);

        socket.once('connect', () => {
            console.log('connected, joining:', parsedId);
            socket.emit('join_chat', parsedId);
        });

        socket.on('connect_error', (err) => {
            console.log('connect_error:', err.message);
        });

        socket.on('new_message', (msg: any) => {
            setMessages((prev) => [...prev, { ...msg, isOwn: msg.id_usuario === userId }]);
            scrollViewRef.current?.scrollToEnd({ animated: true });
        });

        return () => {
            disconnectSocket();
        };
    }, [session, parsedId, userId]);

    const handleSend = async () => {
        if (!userId || !messageText.trim()) return;
        try {
            await sendMessage(
                { user_id: userId, text: messageText.trim() },
                parsedId,
                session!
            );
            setMessageText('');
        } catch (e: any) {
            setToastMessage('Error al enviar mensaje: ' + e.message);
        }
    };

    return (
        <View className="flex-1 bg-dark">
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    className="flex-1 bg-chocolate"
                >
                    <View className="bg-dark flex-1">
                        <ErrorToast
                            message={toastMessage}
                            visible={!!toastMessage}
                            onDismiss={() => setToastMessage(undefined)}
                        />
                        {/* Header */}
                        <View className="items-center justify-end bg-chocolate"
                            style={{ height: headerHeight, width: screenWidth }}>
                            <View className="flex-row w-full" style={{ paddingBottom: headerPaddingBottom }}>
                                <View className="flex-row items-center w-1/6 ">
                                    <ReturnButton label="Volver" showLabel={false} onPress={() => router.back()} />
                                </View>
                                <View className="justify-center items-end w-4/6 flex-row " style={{ paddingHorizontal, gap }}>
                                    <Text accessibilityRole="header" className="text-white text-large font-bold text-center">
                                        {parsedName}
                                    </Text>
                                </View>
                                <View className="justify-end items-end w-1/6 flex-row" style={{ paddingHorizontal, gap }}>
                                    <Image
                                        source={avatarUrl
                                            ? { uri: avatarUrl }
                                            : require('../../../../assets/images/default-profile-pic.png')
                                        }
                                        style={{ width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }}
                                    />
                                </View>
                            </View>
                        </View>

                        {/* Messages */}
                        <ScrollView
                            ref={scrollViewRef}
                            style={{ flex: 1 }}
                            contentContainerStyle={{ paddingVertical: gap }}
                            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: false })}
                        >
                            {messages.map((msg) => (
                                <MessageBubble
                                    key={msg.id}
                                    message={msg.texto}
                                    timestamp={new Date(msg.fecha_creacion).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    isOwn={msg.isOwn}
                                />
                            ))}
                        </ScrollView>

                        {/* Input */}
                        <View className="bg-chocolate" style={{ paddingVertical: paddingVertical / 1.5 }}>
                            <View className="flex-row items-center bg-chocolate" style={{ gap, paddingHorizontal }}>
                                <View className="w-11/12" style={{ paddingVertical }}>
                                <Input
                                    label="Escribe un mensaje..."
                                    hideLabel={true}
                                    value={messageText}
                                    onChangeText={(text: string) => setMessageText(text)}
                                    onSubmitEditing={handleSend}
                                    placeholder="Escribe un mensaje..."
                                />
                                </View>
                                <AntDesign
                                    name="send"
                                    size={24}
                                    color="black"
                                    onPress={handleSend}
                                />
                            </View>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
        </View>
    );
}