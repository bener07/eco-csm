import { useSignUp } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { Text, TextInput, TouchableOpacity, View, Alert, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

export default function SignUpScreen() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onSignUpPress = async () => {
    if (!isLoaded) return;
    setIsLoading(true);

    try {
      // Primeiro passo: criar o cadastro básico
      const signUpAttempt = await signUp.create({
        emailAddress,
        password,
        username,
        firstName,
        lastName,
      });

      // Verificar se precisa de verificação de email
      if (signUpAttempt.status === 'missing_requirements') {
        if (signUpAttempt.unverifiedFields.includes('email_address')) {
          // Enviar código de verificação por email
          await signUp.prepareEmailAddressVerification();
          router.push('/verify-email');
          return;
        }
      }

      // Se o cadastro estiver completo
      if (signUpAttempt.status === 'complete') {
        await setActive({ session: signUpAttempt.createdSessionId });
        router.replace('/'); // Redireciona para a tela inicial após o cadastro
      } else {
        console.error(JSON.stringify(signUpAttempt, null, 2));
        Alert.alert('Atenção', 'Preencha todos os campos obrigatórios');
      }
    } catch (err: any) {
      let errorMessage = 'Ocorreu um erro ao criar sua conta';
      
      if (err.errors) {
        errorMessage = err.errors[0].message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      Alert.alert('Erro', errorMessage);
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.innerContainer}>
        <Text style={styles.title}>Criar Nova Conta</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email*</Text>
          <TextInput
            autoCapitalize="none"
            keyboardType="email-address"
            value={emailAddress}
            placeholder="seu@email.com"
            onChangeText={setEmailAddress}
            style={styles.input}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Nome de Usuário*</Text>
          <TextInput
            autoCapitalize="none"
            value={username}
            placeholder="Escolha um nome de usuário"
            onChangeText={setUsername}
            style={styles.input}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Senha*</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              value={password}
              placeholder="Crie uma senha segura"
              secureTextEntry={!showPassword}
              onChangeText={setPassword}
              style={[styles.input, { flex: 1 }]}
            />
            <TouchableOpacity 
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons 
                name={showPassword ? 'eye-off' : 'eye'} 
                size={20} 
                color="#666" 
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.passwordHint}>Use pelo menos 8 caracteres, incluindo números e letras</Text>
        </View>

        <View style={styles.nameContainer}>
          <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.label}>Primeiro Nome</Text>
            <TextInput
              value={firstName}
              placeholder="Seu nome"
              onChangeText={setFirstName}
              style={styles.input}
            />
          </View>
          <View style={[styles.inputContainer, { flex: 1 }]}>
            <Text style={styles.label}>Sobrenome</Text>
            <TextInput
              value={lastName}
              placeholder="Seu sobrenome"
              onChangeText={setLastName}
              style={styles.input}
            />
          </View>
        </View>

        <TouchableOpacity
          onPress={onSignUpPress}
          disabled={isLoading}
          style={[styles.button, isLoading && styles.buttonDisabled]}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Criar Conta</Text>
          )}
        </TouchableOpacity>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Já tem uma conta? </Text>
          <TouchableOpacity onPress={() => router.push('/sign-in')}>
            <Text style={styles.loginLink}>Faça login</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.requiredText}>* Campos obrigatórios</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  innerContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    marginBottom: 5,
    fontSize: 14,
    color: '#555',
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  eyeIcon: {
    padding: 15,
  },
  passwordHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  nameContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#4A90E2',
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: '#a0c4ff',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    color: '#666',
  },
  loginLink: {
    color: '#4A90E2',
    fontWeight: 'bold',
  },
  requiredText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
  },
});