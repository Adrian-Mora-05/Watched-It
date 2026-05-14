import {View} from 'react-native';
import { Image } from 'expo-image';
import { Text } from '@react-native-ama/react-native';
import { useLayout } from '@/hooks/useLayout';
import RatingBarChart from '@/components/ui/RatingBarChart';
import ReturnButton from '@/components/ui/ReturnButton';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function ShowScreen() {
  const { headerHeight, screenWidth, headerPaddingBottom, paddingHorizontal, paddingVertical } = useLayout();
  const gap = screenWidth * 0.03;
  const imgWidth = screenWidth * 0.28;
  const imgHeight = imgWidth * 1.5;
  return (
    <View className="flex-1 bg-dark">
      {/* Header */}
      <View
        className="items-start justify-end"
        style={{ padding: gap, gap, width: screenWidth, height: headerHeight }}
        accessible={false}
      >
        <ReturnButton
          label="Volver"
          onPress={() => router.back()}
        />
      </View>
      {/* Movie Info */}
      <View style={{ paddingHorizontal, paddingVertical, gap }} >
        {/* Basic Info */}
        <Text className="text-white text-intermediate font-bold flex-wrap">Título de la película</Text>
        <View className="flex-row">
          {/* Text Info */}
          <View style={{ gap }} className="w-1/2">
            <Text className="text-white text-medium font-bold">AñoPelículas</Text>
            <Text className="text-white text-normal font-bold">Duración: 10mins</Text>
            <Text className="text-white text-normal font-bold">Origen: Estados Unidos</Text>
            <Text className="text-white text-normal font-bold">Género: Acción</Text>
            <Text className="text-white text-normal font-bold">Clasificación: +18</Text>
          </View>
          {/* Poster Image and button */}
          <View style={{  gap }} className="w-2/4 items-end ">
          <View className="flex-row items-center " style={{ gap }}>
            <Text className="text-white text-petite">Agregar a lista de películas por ver</Text>
            <Ionicons name="add-circle-outline" size={gap*2.5} color="white" />
            </View>
            <Image
              source={{ uri: 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fimages.pexels.com%2Fphotos%2F30994370%2Fpexels-photo-30994370.jpeg%3Fcs%3Dsrgb%26dl%3Dpexels-optical-chemist-340351297-30994370.jpg%26fm%3Djpg&f=1&nofb=1&ipt=3405ba99b343eaed9a70090697c960bcf9f7129e74c2aba780abccef56dd1fa0' }}
              style={{ width: imgWidth, height: imgHeight, borderRadius: 8 }}
            />
          </View>
        </View>
        {/* Summary */}
        <Text className="text-white text-normal">Esta es una película de acción que combina efectos especiales impresionantes con una trama emocionante.</Text>
      <RatingBarChart
        cant_1={0}
        cant_2={3}
        cant_3={8}
        cant_4={12}
        cant_5={20}
        total_calificaciones={44}
      />
      
    </View></View>
  );
}