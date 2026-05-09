import { View } from 'react-native';
import { Text } from "@react-native-ama/react-native";
import { useSession } from '@/hooks/ctx';
import Button from '@/components/ui/Button';
import { jwtDecode } from 'jwt-decode';
import { useLayout } from '@/hooks/useLayout';

export default function Index() {

  const { session } = useSession();
  const user = session ? jwtDecode(session) : null; // If your token is a JWT, decode it to get user info
  const { signOut } = useSession();
 const { headerHeight, screenWidth, headerPaddingBottom, paddingHorizontal, paddingVertical } = useLayout();
  return (
    <View className='flex-1 bg-dark'>
        {/* Header */}
        <View className="items-center justify-end bg-chocolate"
            style={{ height: headerHeight, width: screenWidth }}>
            <View className="bg-chocolate items-center justify-end"
                style={{ height: headerHeight, width: screenWidth }}>
                <Text
                    accessibilityRole="header"
                    accessibilityLanguage="en"
                    autofocus
                    className="text-white text-large font-bold"
                    style={{ paddingBottom: headerPaddingBottom }}
                >
                    Watched It
                </Text>
            </View>
        </View>

      {/* Esto es solo para q sepan donde esta el token de sesion y el userID*/}
      <Text className='text-blue-600 '>Your session token: {session}</Text>
      <Text className='text-green'>Your userID: {user?.sub}</Text>
      {/***********************************************************************/}
      
      <Button label="Sign Out" loading={false}
        onPress={() => {
          // The guard in `RootNavigator` redirects back to the sign-in screen.
          signOut();
        }}
      />
    </View>
  );
}
