import { useEffect, useState, useCallback } from "react";
import {
  View,
  Image,
  ScrollView,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@react-native-ama/react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { useSession } from "@/hooks/ctx";
import { getUserLogById, UserLog } from "@/services/user.service";
import { baseUrl } from "@/services/movie.service";

export default function LogDetailsScreen() {
  const { logId, type } = useLocalSearchParams<{
    logId: string;
    type: string;
  }>();

  const { session, isLoading } = useSession();
  const [loading, setLoading] = useState(true);
  const [log, setLog] = useState<UserLog | null>(null);
  useFocusEffect(
    useCallback(() => {
      if (!isLoading && session) {
        loadLog();
      }
    }, [isLoading, session, logId, type])
  );

  const loadLog = async () => {
    if (!session) return;
    try {
      setLoading(true);
      const data = await getUserLogById(Number(logId), String(type), session);
      setLog(data);
    } catch (error) {
      console.log("Error loading log:", error);
      setLog(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading || isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-dark">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#fff" />
        </View>
      </SafeAreaView>
    );
  }

  if (!log) {
    return (
      <SafeAreaView className="flex-1 bg-dark">
        <View className="flex-1 justify-center items-center">
          <Text className="text-white">Log no encontrado</Text>
        </View>
      </SafeAreaView>
    );
  }

  const posterUri = `${baseUrl}${decodeURIComponent(log.catalog.poster)}`;

  const formattedDate = new Date(log.date).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <SafeAreaView className="flex-1 bg-dark" edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false}>

        <View className="absolute top-5 left-5 right-5 flex-row justify-between z-10">
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={26} color="#AA500F" />
          </Pressable>

          <Pressable
            onPress={() =>
              router.push({
                pathname: "/editReview",
                params: {
                  logId: String(log.id),
                  type: log.type === "series" ? "show" : log.type,
                },
              })
            }
          >
            <Ionicons name="pencil" size={26} color="#AA500F" />
          </Pressable>

        </View>

        {/* POSTER */}
        <Image
          source={{ uri: posterUri }}
          style={{
            width: "100%",
            height: 380,
          }}
        />

        {/* INFO */}
        <View style={{ padding: 20 }}>

          <Text className="text-white font-bold text-large">
            {log.catalog.title}
          </Text>

          <Text className="text-gray-400 text-medium" style={{marginTop: 10}}>
            {log.catalog.year}
          </Text>

          {/* RATING */}
          <View className="flex-row mt-4">
          {[1,2,3,4,5].map((i) => (
            <FontAwesome
              key={i}
              name={i <= log.rating ? "star" : "star-o"}
              size={18}
              color="#AA500F"
            />
          ))}
        </View>

          {/* COMMENT */}
          <Text className="text-gray-400 mt-4 leading-5 text-medium">
            {log.content || "Sin comentario"}
          </Text>

          {/* DATE */}
          <Text className="text-gray-500 mt-4">
            {formattedDate}
          </Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 20,
            }}
          >
            <Text
              style={{
                color: "#9CA3AF",
                fontSize: 16,
                marginRight: 8,
                fontWeight: "500",
              }}
            >
              Gustas
            </Text>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 16,
              }}
            >
              <FontAwesome name="heart" size={18} color="#AA500F" />

              <Text
                style={{
                  color: "#AA500F",
                  marginLeft: 6,
                  fontSize: 16,
                  fontWeight: "500",
                }}
              >
                {log.likes ?? 0}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}