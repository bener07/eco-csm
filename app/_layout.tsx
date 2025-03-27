import { Stack, Tabs} from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ClerkProvider } from '@clerk/clerk-expo'
import { tokenCache } from '@/cache';
import * as SplashScreen from 'expo-splash-screen';
import { MaterialIcons } from '@expo/vector-icons';
import { CameraProvider, handlePicture, handleClose } from '@/context/CameraContext';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from'react-native-gesture-handler';
import { LogBox } from 'react-native';


LogBox.ignoreLogs(['Warning: TNodeChildrenRenderer: ']);


const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!

if (!publishableKey) {
  throw new Error(
    'Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env',
  )
} 

// Prevent the splash screen from auto-hiding before asset loading is complete.
// SplashScreen.preventAutoHideAsync();

export default function RootLayout() {

  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <CameraProvider onPicture={handlePicture} onClose={handleClose}>
            <Stack>
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(initial)" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }}/>
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="auto" />
        </CameraProvider>
      </GestureHandlerRootView>
    </ClerkProvider>
  );
}
