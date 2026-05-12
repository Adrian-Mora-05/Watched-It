import { useLayout } from '@/hooks/useLayout';
import { View, Text, Image } from 'react-native';
import { getAllReviews, baseUrl } from '@/services/review.service';


export default function ReviewScreen() {
    const { headerHeight, screenWidth, headerPaddingBottom } = useLayout();
    const paddingHorizontal = screenWidth * 0.02;
    const gap = screenWidth * 0.03;

    return (
        <View className="flex-1" style={{ paddingHorizontal,  gap }}>
            
        <Text className="text-white text-intermediate">Populares de la semana</Text>
        <Text className="text-white text-normal">NombrePelicula</Text>
        <Text className="text-white text-normal">2001</Text>
        <Image source={{ uri: 'https://m.media-amazon.com/images/M/MV5BMDAyY2FhYjctNDc5OS00MDNlLThiMGUtY2UxYWVkNGY2ZjljXkEyXkFqcGc@._V1_.jpg' }} style={{ width: screenWidth * 0.3, height: screenWidth * 0.45, borderRadius: 10 }} /> 
        <Text className="text-white text-normal">comentario super largo de peliculas</Text> 
        <Text className="text-white text-normal">NombreUsuario</Text> 
        <Text className="text-white text-normal">MeGusta</Text> 
        </View>
    );
}