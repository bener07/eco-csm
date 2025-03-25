import { useSignUp } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import React from 'react';

export default function SignUpScreen() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');

  const onSignUpPress = async () => {
    if (!isLoaded) return;

    try {
      const signUpAttempt = await signUp.create({
        emailAddress,
        password,
      });

      if (signUpAttempt.status === 'complete') {
        await setActive({ session: signUpAttempt.createdSessionId });
        router.replace('/'); // Redireciona para a tela inicial após o cadastro
      } else {
        console.error(JSON.stringify(signUpAttempt, null, 2));
      }
    } catch (err) {
      Alert.alert('Erro', 'Falha ao criar conta. Verifique os dados fornecidos.');
      console.error(JSON.stringify(err, null, 2));
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Sign Up</Text>

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
        onPress={onSignUpPress}
        style={{ backgroundColor: '#4A90E2', padding: 15, alignItems: 'center' }}
      >
        <Text style={{ color: '#fff', fontSize: 16 }}>Create Account</Text>
      </TouchableOpacity>

      <View style={{ marginTop: 20, flexDirection: 'row', justifyContent: 'center' }}>
        <Text>Already have an account? </Text>
        <TouchableOpacity onPress={() => router.push('/sign-in')}>
          <Text style={{ color: '#4A90E2' }}>Sign in</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}