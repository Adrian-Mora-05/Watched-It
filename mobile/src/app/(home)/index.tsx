import { Text, View } from 'react-native';
import { useSession } from '@/hooks/ctx';
import Button from '@/components/ui/Button';
import { jwtDecode } from 'jwt-decode';

export default function Index() {

  const { session } = useSession();
  const user = session ? jwtDecode(session) : null; // If your token is a JWT, decode it to get user info
  const { signOut } = useSession();

  return (
    <View className='flex-1 bg-dark'>
      <Text className='text-white'>Welcome to the app !</Text>

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
