import { Text, View } from 'react-native';
import { useSession } from '../../hooks/ctx';
import Button from '../../components/ui/Button';

export default function Index() {
  const { signOut } = useSession();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Welcome to the app !</Text>
      <Button label="Sign Out" loading={false}
        onPress={() => {
          // The guard in `RootNavigator` redirects back to the sign-in screen.
          signOut();
        }}
      />
    </View>
  );
}
