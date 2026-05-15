import { View, Image, Pressable } from "react-native";
import { Text } from "@react-native-ama/react-native";
import { baseUrl } from "@/services/movie.service";

export default function ListPreview({ item, onPress }: any) {
  const media = item.movies || item.series || [];
  const preview = media.slice(0, 3);

  return (
    <Pressable
      onPress={onPress}   
      style={{
        marginBottom: 16,
        borderRadius: 16,
        backgroundColor: "rgba(209, 213, 219, 0.2)",
        padding: 12,
      }}
    >
      {/* GRID */}
      <View style={{ flexDirection: "row", gap: 6, height: 120 }}>
        {preview.length > 0 ? (
          preview.map((m: any) => (
            <Image
              key={m.id}
              source={{ uri: baseUrl + m.enlace_imagen }}
              style={{
                flex: 1,
                borderRadius: 10,
                height: "100%",
              }}
              resizeMode="cover"
            />
          ))
        ) : (
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(209, 213, 219, 0.2)",
              borderRadius: 10,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#aaa" }}>Sin contenido</Text>
          </View>
        )}
      </View>

      {/* INFO */}
      <View style={{ marginTop: 10 }}>
        <Text style={{ fontSize: 16, fontWeight: "600", color: "white" }}>
          {item.nombre}
        </Text>

        <Text style={{ fontSize: 12, color: "#aaa", marginTop: 2 }}>
          {media.length} elementos
        </Text>
      </View>
    </Pressable>
  );

}