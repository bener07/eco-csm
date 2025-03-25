import { useSignIn } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import React from 'react';
import { SignIn } from '@clerk/clerk-expo/web'


export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');

  const onSignInPress = async () => {
    if (!isLoaded) return;

    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace('/'); // Redireciona para a tela inicial após o login
      } else {
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err) {
      Alert.alert('Erro', 'Falha ao fazer login. Verifique suas credenciais.');
      console.error(JSON.stringify(err, null, 2));
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Sign In</Text>

      <TextInput
        autoCapitalize="none"
        value={emailAddress}
        placeholder="Enter email"
        onChangeText={setEmailAddress}
        style={{ borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10 }}
      />

      <TextInput
        value={password}
        placeholder="Enter password"
        secureTextEntry={true}
        onChangeText={setPassword}
        style={{ borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 20 }}
      />

      <TouchableOpacity
        onPress={onSignInPress}
        style={{ backgroundColor: '#4A90E2', padding: 15, alignItems: 'center' }}
      >
        <Text style={{ color: '#fff', fontSize: 16 }}>Continue</Text>
      </TouchableOpacity>

      <View style={{ marginTop: 20, flexDirection: 'row', justifyContent: 'center' }}>
        <Text>Don't have an account? </Text>
        <TouchableOpacity onPress={() => router.push('/sign-up')}>
          <Text style={{ color: '#4A90E2' }}>Sign up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}