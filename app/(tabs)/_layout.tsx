import { Redirect, Stack } from 'expo-router'
import { View, Text, TouchableOpacity, StyleSheet, Alert} from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from'react-native-gesture-handler';

export default function AuthRoutesLayout() {
  const { isSignedIn } = useAuth()

  if (!isSignedIn) {
    Alert.alert('Conta obrigatória!', 'precisa de ter conta para tirar fotografias!');
    return <Redirect href={'/'}/>
  }

  return (
    <>
      <View style={styles.closeBtnView}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="arrow-back" size={25} color="black" />
        </TouchableOpacity>
      </View>
      <Stack>
        <Stack.Screen name="add-new-location" options={{headerShown: false }} />
        <Stack.Screen name="article" options={{headerShown: false }} />
        <Stack.Screen name="camera" options={{headerShown: false }} />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({

  closeBtn: {
    color: 'black',
    fontSize: 25,
    fontWeight: 'bold',
    position: 'absolute',
    left: 20,
    width: 40,
    height: 40
  },

  closeBtnView: {
    position: 'absolute',
    top: 0,
    zIndex: 100,
    width: '100%',
    height: 100,
    backgroundColor: 'transparent',
    justifyContent: 'center',
  }
});