import { Linking } from 'react-native';
import { Alert } from 'react-native';

export const openDirectionsInGoogleMaps = (destinationCoords: {latitude: number, longitude: number}) => {
  // Verifica se temos coordenadas válidas
  if (!destinationCoords || !destinationCoords.latitude || !destinationCoords.longitude) {
    Alert.alert('Erro', 'Localização de destino inválida');
    return;
  }

  // Formata as coordenadas para a URL
  const { latitude, longitude } = destinationCoords;
  const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`;

  // Tenta abrir o Google Maps
  Linking.openURL(url).catch(() => {
    // Se o Google Maps não estiver instalado, abre no navegador
    const browserUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`;
    Linking.openURL(browserUrl).catch(err => {
      Alert.alert('Erro', 'Não foi possível abrir o Google Maps');
      console.error('Error opening URL:', err);
    });
  });
};
