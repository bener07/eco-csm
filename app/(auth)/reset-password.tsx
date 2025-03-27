import { useSignIn } from '@clerk/clerk-expo';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text, TextInput, TouchableOpacity, View, Alert, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

export default function ResetPasswordConfirmScreen() {
  const { signIn } = useSignIn();
  const router = useRouter();
  const { email } = useLocalSearchParams();

  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onResetConfirmPress = async () => {
    if (!signIn || newPassword !== confirmPassword) {
      Alert.alert('Erro', 'As passwords não coincidem');
      return;
    }

    setIsLoading(true);

    try {
      const resetAttempt = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
        password: newPassword,
      });

      if (resetAttempt.status === 'complete') {
        Alert.alert('Sucesso', 'Password alterada com sucesso!');
        router.replace('/sign-in');
      } else {
        console.error(JSON.stringify(resetAttempt, null, 2));
      }
    } catch (err: any) {
      let errorMessage = 'Ocorreu um erro ao redefinir a password';
      
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
        <Ionicons name="key" size={60} color="#4A90E2" style={styles.icon} />
        <Text style={styles.title}>Nova Palavra-passe</Text>
        
        <Text style={styles.subtitle}>
          Insira o código enviado para {email} e sua nova palavra-passe.
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

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Nova Palavra-passe</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              value={newPassword}
              placeholder="Crie uma nova palavra-passe"
              secureTextEntry={!showPassword}
              onChangeText={setNewPassword}
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
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Confirmar Palavra-passe</Text>
          <TextInput
            value={confirmPassword}
            placeholder="Confirme a nova palavra-passe"
            secureTextEntry={!showPassword}
            onChangeText={setConfirmPassword}
            style={styles.input}
          />
        </View>

        <TouchableOpacity
          onPress={onResetConfirmPress}
          disabled={isLoading || !code || !newPassword || !confirmPassword}
          style={[styles.button, (isLoading || !code || !newPassword || !confirmPassword) && styles.buttonDisabled]}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Redefinir Password</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={16} color="#4A90E2" />
          <Text style={styles.backText}>Voltar</Text>
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
    fontSize: 28,
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
    paddingHorizontal: 20,
  },
  inputContainer: {
    marginBottom: 15,
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
  },
  backText: {
    color: '#4A90E2',
    fontSize: 14,
    marginLeft: 5,
  },
});