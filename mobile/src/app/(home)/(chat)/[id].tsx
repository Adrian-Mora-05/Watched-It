import { router, useLocalSearchParams } from 'expo-router';
import { Image, Keyboard, KeyboardAvoidingView, Platform, ScrollView, useWindowDimensions, View, TouchableWithoutFeedback, AccessibilityInfo } from 'react-native';
import { Pressable, Text } from '@react-native-ama/react-native';
import { useSession } from '@/hooks/ctx';
import { useLayout } from '@/hooks/useLayout';
import ErrorToast from '@/components/ui/ErrorMessage';
import { useEffect, useState, useRef, useCallback } from 'react';
import ReturnButton from '@/components/ui/ReturnButton';
import { getAvatarUrl } from '@/services/friend.service';
import MessageBubble from '@/components/ui/MessageBubble';
import Input from '@/components/ui/Input';
import AntDesign from '@expo/vector-icons/AntDesign';
import { sendMessage, getMessages, connectSocket, disconnectSocket } from '@/services/chat.service';
import { jwtDecode } from 'jwt-decode';
import { Message } from '@shared/message.schema';

export default function Chat() {
    const { id, name, profilePic } = useLocalSearchParams();
    const parsedId = Array.isArray(id) ? id[0] : id;
    const parsedName = Array.isArray(name) ? name[0] : name;
    const parsedProfilePic = Array.isArray(profilePic) ? profilePic[0] : profilePic;

    const { session } = useSession();
    const { headerHeight, screenWidth, headerPaddingBottom, paddingHorizontal, paddingVertical } = useLayout();
    const { width } = useWindowDimensions();

    const [toastMessage, setToastMessage] = useState<string | undefined>();
    const [messages, setMessages] = useState<Message[]>([]);
    const [messageText, setMessageText] = useState('');
    const [userId, setUserId] = useState<string | null>(null);
    const [isSending, setIsSending] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);

    const gap = width * 0.03;
    const avatarSize = width * 0.10;
    const avatarUrl = parsedProfilePic ? getAvatarUrl(parsedProfilePic) : null;

    // Get userId from token
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
                AccessibilityInfo.announceForAccessibility(
                    `Chat con ${parsedName}. ${mapped.length} mensaje${mapped.length !== 1 ? 's' : ''} cargado${mapped.length !== 1 ? 's' : ''}`
                );
            })
            .catch((e) => setToastMessage('Error al cargar mensajes: ' + e.message));
    }, [session, parsedId, userId]);

    // Socket connection
    useEffect(() => {
        if (!session) return;
        const socket = connectSocket(session);

        socket.once('connect', () => {
            socket.emit('join_chat', parsedId);
        });

        socket.on('connect_error', () => {
            setToastMessage('Error de conexión al chat');
        });

        socket.on('new_message', (msg: any) => {
            const incoming: Message = { ...msg, isOwn: msg.id_usuario === userId };
            setMessages((prev) => [...prev, incoming]);
            scrollViewRef.current?.scrollToEnd({ animated: true });

            if (msg.id_usuario !== userId) {
                AccessibilityInfo.announceForAccessibility(
                    `Nuevo mensaje de ${parsedName}: ${msg.texto}`
                );
            }
        });

        return () => { disconnectSocket(); };
    }, [session, parsedId, userId]);

    const handleSend = useCallback(async () => {
        if (!userId || !messageText.trim() || isSending) return;
        setIsSending(true);
        try {
            await sendMessage(
                { user_id: userId, text: messageText.trim() },
                parsedId,
                session!
            );
            setMessageText('');
            // ✅ Confirm send to screen readers
            AccessibilityInfo.announceForAccessibility('Mensaje enviado');
        } catch (e: any) {
            setToastMessage('Error al enviar mensaje: ' + e.message);
            AccessibilityInfo.announceForAccessibility('Error al enviar el mensaje');
        } finally {
            setIsSending(false);
        }
    }, [userId, messageText, isSending, parsedId, session]);

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
                        <View
                            className="items-center justify-end bg-chocolate"
                            style={{ height: headerHeight, width: screenWidth }}
                            accessibilityLanguage="es"
                        >
                            <View
                                className="flex-row w-full items-center"
                                style={{ paddingBottom: headerPaddingBottom }}
                            >
                                {/* Back button */}
                                <View className="w-1/6 items-center">
                                    <ReturnButton
                                        label="Volver"
                                        showLabel={false}
                                        onPress={() => router.back()}
                                    />
                                </View>

                                {/* Title — truly centered */}
                                <View className="flex-1 items-center">
                                    <Text
                                        accessibilityRole="header"
                                        accessibilityLabel={`Chat con ${parsedName}`}
                                        accessibilityLanguage="es"
                                        className="text-white text-large font-bold text-center"
                                    >
                                        {parsedName}
                                    </Text>
                                </View>

                                {/* Avatar — right side balances header */}
                                <View className="w-1/6 items-center">
                                    <Image
                                        source={avatarUrl
                                            ? { uri: avatarUrl }
                                            : require('../../../../assets/images/default-profile-pic.png')
                                        }
                                        style={{
                                            width: avatarSize,
                                            height: avatarSize,
                                            borderRadius: avatarSize / 2,
                                        }}
                                        accessibilityLabel={`Foto de perfil de ${parsedName}`}
                                        accessibilityRole="image"
                                    />
                                </View>
                            </View>
                        </View>

                        {/* Messages list */}
                        <ScrollView
                            ref={scrollViewRef}
                            style={{ flex: 1 }}
                            contentContainerStyle={{ paddingVertical: gap }}
                            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: false })}
                            accessibilityLabel={`Conversación con ${parsedName}`}
                            accessibilityLanguage="es"
                            accessible={false}
                        >
                            {messages.length === 0 ? (
                                <Text
                                    className="text-bone text-medium text-center"
                                    accessibilityLanguage="es"
                                    accessibilityLiveRegion="polite"
                                    style={{ marginTop: paddingVertical * 2 }}
                                >
                                    No hay mensajes aún. ¡Empieza la conversación!
                                </Text>
                            ) : (
                                messages.map((msg) => (
                                    <MessageBubble
                                        key={msg.id}
                                        message={msg.texto}
                                        timestamp={new Date(msg.fecha_creacion).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                        isOwn={msg.isOwn}
                                        senderName={msg.isOwn ? 'Tú' : parsedName}
                                    />
                                ))
                            )}
                        </ScrollView>

                        {/* Input bar */}
                        <View
                            className="bg-chocolate"
                            style={{ paddingVertical: paddingVertical / 1.5 }}
                            accessibilityLanguage="es"
                        >
                            <View
                                className="flex-row items-center bg-chocolate"
                                style={{ gap, paddingHorizontal }}
                            >
                                <View className="flex-1" style={{ paddingVertical }}>
                                    <Input
                                        label="Escribe un mensaje"
                                        hideLabel={true}
                                        value={messageText}
                                        onChangeText={(text: string) => setMessageText(text)}
                                        onSubmitEditing={handleSend}
                                        placeholder="Escribe un mensaje..."
                                        accessibilityLabel="Campo de mensaje"
                                        accessibilityHint="Escribe aquí tu mensaje y presiona enviar"
                                        accessibilityLanguage="es"
                                        returnKeyType="send"
                                        blurOnSubmit={false}
                                    />
                                </View>

                                <Pressable
                                    onPress={handleSend}
                                    disabled={isSending || !messageText.trim()}
                                    accessibilityRole="button"
                                    accessibilityLabel="Enviar mensaje"
                                    accessibilityHint={
                                        !messageText.trim()
                                            ? "Escribe un mensaje antes de enviar"
                                            : "Envía tu mensaje"
                                    }
                                    accessibilityLanguage="es"
                                    accessibilityState={{
                                        disabled: isSending || !messageText.trim(),
                                        busy: isSending,
                                    }}
                                    style={{
                                        minWidth: 44,
                                        minHeight: 44,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        opacity: !messageText.trim() ? 0.4 : 1,
                                    }}
                                >
                                    <AntDesign
                                        name="send"
                                        size={24}
                                        color="white"
                                        accessibilityElementsHidden
                                        importantForAccessibility="no"
                                    />
                                </Pressable>
                            </View>
                        </View>

                    </View>
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
        </View>
    );
}