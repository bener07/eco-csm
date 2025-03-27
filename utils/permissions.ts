// Primeiro, vamos atualizar a função requestLocationPermission em utils/permissions.ts
import * as Location from 'expo-location';
import { Alert } from 'react-native';

export const requestLocationPermission = async () => {
  try {
    // Solicita permissão para acessar a localização
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Precisamos de acesso à sua localização para apresentar os locais próximos!');
      return null;
    }
  
    // Obtém a localização atual
    let location = await Location.getCurrentPositionAsync({});
    return location;
  } catch (error) {
    console.error("Error getting location:", error);
    return null;
  }
};