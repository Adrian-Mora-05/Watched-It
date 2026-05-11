import { Tabs } from 'expo-router';
import Entypo from '@expo/vector-icons/Entypo';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

export default function AppLayout() {
  // This renders the navigation stack for all authenticated app routes.


  return (

      <Tabs screenOptions={{tabBarActiveTintColor:"white",tabBarInactiveTintColor:"#231709",tabBarStyle:{backgroundColor:"#5D3E14"}}}>
        <Tabs.Screen name="index" options={{ headerShown: false, tabBarShowLabel: false, title: "Menú principal", tabBarIcon: ({color,size}, ) => <Entypo name="home" size={size} color={color}/> }} />
        <Tabs.Screen name="(friends)" options={{ headerShown: false, tabBarShowLabel: false, tabBarLabel: "Amigos", title: "Mostrar amigos y solicitudes de amistad", tabBarIcon: ({color,size} ) => <FontAwesome5 name="user-friends" size={size} color={color} /> }} />
        <Tabs.Screen name="(logger)" options={{ headerShown: false, tabBarShowLabel: false, tabBarLabel: "Registrar", title: "Registrar contenido", tabBarIcon: ({color,size} ) => <AntDesign name="plus-circle" size={size} color={color} /> }} />
      </Tabs>

  );
}
