import { Redirect, Stack } from 'expo-router'
import { View, Text, TouchableOpacity} from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function AuthRoutesLayout() {
  const { isSignedIn } = useAuth()

  if (isSignedIn) {
    return <Redirect href={'/'} />
  }

  return (
  <>
    <View style={styles.closeBtnView}>
      <TouchableOpacity onPress={() => {console.log('Button Clicked');router.back()}}>
        <Ionicons name="arrow-back" style={styles.closeBtn} size={25} color="black" />
      </TouchableOpacity>
      <Text style={styles.screenText}></Text>
    </View>
    <Stack>
      <Stack.Screen name="add-new-location" options={{headerShown: false }} />
      <Stack.Screen name="article" options={{headerShown: false }} />
      <Stack.Screen name="camera" options={{headerShown: false }} />
    </Stack>
  </>
  );
}

const styles = {
  screenText: {

  },

  closeBtn: {
    color: 'black',
    fontSize: 25,
    fontWeight: 'bold',
    position: 'absolute',
    left: 20,
  },

  closeBtnView: {
    position: 'absolute',
    top: 0,
    zIndex: 100,
    elevation: 10,
    width: '100%',
    height: 70,
    backgroundColor: 'white',
    justifyContent: 'center',
    shadowColor: 'black',
  }
}