import { useSignUp } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { Text, TextInput, TouchableOpacity, View, Alert, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

export default function VerifyEmailScreen() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const router = useRouter();

  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const onPressVerify = async () => {
    if (!isLoaded) return;
    setIsLoading(true);

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId });
        router.replace('/'); // Redireciona para a tela inicial após verificação
      } else {
        console.error(JSON.stringify(completeSignUp, null, 2));
      }
    } catch (err: any) {
      let errorMessage = 'Ocorreu um erro ao verificar seu email';
      
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

  const onResendCode = async () => {
    if (!isLoaded) return;
    setIsResending(true);

    try {
      await signUp.prepareEmailAddressVerification();
      Alert.alert('Sucesso', 'Novo código enviado para seu email');
    } catch (err: any) {
      Alert.alert('Erro', 'Não foi possível enviar um novo código');
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.innerContainer}>
        <Ionicons name="mail" size={60} color="#4A90E2" style={styles.icon} />
        <Text style={styles.title}>Verifique seu Email</Text>
        
        <Text style={styles.subtitle}>
          Enviamos um código de verificação para o email que você cadastrou. Por favor, insira o código abaixo.
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Código de Verificação</Text>
          <TextInput
            value={code}
            placeholder="Digite o código de 6 dígitos"
            onChangeText={setCode}
            style={styles.input}
            keyboardType="number-pad"
            autoFocus
          />
        </View>

        <TouchableOpacity
          onPress={onPressVerify}
          disabled={isLoading || !code}
          style={[styles.button, (isLoading || !code) && styles.buttonDisabled]}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Verificar Email</Text>
          )}
        </TouchableOpacity>

        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Não recebeu o código? </Text>
          <TouchableOpacity onPress={onResendCode} disabled={isResending}>
            <Text style={styles.resendLink}>
              {isResending ? 'Enviando...' : 'Reenviar código'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
        >
          <Text style={styles.backText}>Voltar para cadastro</Text>
        </TouchableOpacity>
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
  icon: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: 25,
  },
  label: {
    marginBottom: 8,
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
  button: {
    backgroundColor: '#4A90E2',
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#a0c4ff',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 25,
  },
  resendText: {
    color: '#666',
  },
  resendLink: {
    color: '#4A90E2',
    fontWeight: 'bold',
  },
  backButton: {
    marginTop: 30,
    alignSelf: 'center',
  },
  backText: {
    color: '#4A90E2',
    fontSize: 14,
  },
});