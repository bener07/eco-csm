import * as Location from 'expo-location';
import { Alert } from 'react-native';

export const requestLocationPermission = (setLocation:any) => {
    (async () => {
        // Solicita permissão para acessar a localização
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted'){
            Alert.alert('Precisamos de acesso à sua localização para apresentar o mapa!');
            return false;
        }
  
        // Obtém a localização atual
        let location = await Location.getCurrentPositionAsync({});
        setLocation(location);
      })();
};
