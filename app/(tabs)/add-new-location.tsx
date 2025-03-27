import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Button, TextInput, Card, Title, ActivityIndicator, IconButton } from 'react-native-paper';
import { db, storage } from '@/firebaseConfig';
import { addDoc, collection } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

interface LocationData {
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  address?: string;
  images: string[];
}

const AddLocationPage = () => {
  const [formData, setFormData] = useState<LocationData>({
    name: '',
    description: '',
    latitude: 0,
    longitude: 0,
    images: []
  });
  
  const [loading, setLoading] = useState({
    location: false,
    address: false,
    submit: false
  });

  // 1. OBTER LOCALIZAÇÃO AUTOMÁTICA
  const handleGetLocation = async () => {
    setLoading(prev => ({...prev, location: true}));
    
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Ative a localização para continuar');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setFormData({
        ...formData,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });

      // Obter endereço aproximado
      await fetchAddress(location.coords.latitude, location.coords.longitude);
      
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível obter a localização');
      console.error("Location error:", error);
    } finally {
      setLoading(prev => ({...prev, location: false}));
    }
  };

  // 2. OBTER ENDEREÇO DAS COORDENADAS
  const fetchAddress = async (lat: number, lng: number) => {
    setLoading(prev => ({...prev, address: true}));
    
    try {
      const addresses = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      if (addresses.length > 0) {
        const addr = addresses[0];
        const formattedAddress = `${addr.street || ''} ${addr.streetNumber || ''}, ${addr.city || ''}`.trim();
        if (formattedAddress) {
          setFormData(prev => ({...prev, address: formattedAddress}));
        }
      }
    } catch (error) {
      console.error("Address error:", error);
    } finally {
      setLoading(prev => ({...prev, address: false}));
    }
  };

  // 3. ADICIONAR FOTOS (Câmera ou Galeria)
  const handleAddPhotos = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permissão necessária', 'Precisamos acessar suas fotos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      const newImages = result.assets.map(asset => asset.uri);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }));
    }
  };

  // 4. REMOVER FOTO
  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // 5. ENVIAR PARA O FIREBASE
  const handleSubmit = async () => {
    if (!formData.name || !formData.description) {
      Alert.alert('Atenção', 'Preencha pelo menos o nome e descrição');
      return;
    }

    setLoading(prev => ({...prev, submit: true}));

    try {
      // Upload das imagens primeiro
      const imageUrls = await Promise.all(
        formData.images.map(async (uri, index) => {
          const response = await fetch(uri);
          const blob = await response.blob();
          const filename = uri.substring(uri.lastIndexOf('/') + 1);
          const storageRef = ref(storage, `locations/${Date.now()}_${filename}`);
          await uploadBytes(storageRef, blob);
          return await getDownloadURL(storageRef);
        })
      );

      // Salvar todos os dados no Firestore
      await addDoc(collection(db, 'locations'), {
        ...formData,
        images: imageUrls,
        createdAt: new Date(),
      });

      Alert.alert('Sucesso!', 'Localização salva com sucesso');
      router.back();
      
    } catch (error) {
      console.error("Firebase error:", error);
      Alert.alert('Erro', 'Ocorreu um erro ao salvar');
    } finally {
      setLoading(prev => ({...prev, submit: false}));
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* CABEÇALHO */}
        <View style={styles.header}>
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={() => router.back()}
          />
          <Title style={styles.title}>Adicionar Local</Title>
        </View>

        {/* FORMULÁRIO */}
        <Card style={styles.card}>
          <Card.Content>
            {/* NOME */}
            <TextInput
              label="Nome do local *"
              value={formData.name}
              onChangeText={text => setFormData({...formData, name: text})}
              style={styles.input}
              mode="outlined"
            />

            {/* DESCRIÇÃO */}
            <TextInput
              label="Descrição *"
              value={formData.description}
              onChangeText={text => setFormData({...formData, description: text})}
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={3}
            />

            {/* LOCALIZAÇÃO */}
            <View style={styles.section}>
              <Title style={styles.sectionTitle}>Localização</Title>
              
              <Button 
                mode="outlined" 
                onPress={handleGetLocation}
                loading={loading.location}
                icon="map-marker"
                style={styles.locationButton}
              >
                Usar minha localização
              </Button>

              <View style={styles.coordinatesContainer}>
                <TextInput
                  label="Latitude"
                  value={formData.latitude.toString()}
                  style={styles.coordinateInput}
                  mode="outlined"
                  editable={false}
                />
                <TextInput
                  label="Longitude"
                  value={formData.longitude.toString()}
                  style={styles.coordinateInput}
                  mode="outlined"
                  editable={false}
                />
              </View>

              <TextInput
                label="Endereço (opcional)"
                value={formData.address || ''}
                onChangeText={text => setFormData({...formData, address: text})}
                style={styles.input}
                mode="outlined"
              />
            </View>

            {/* FOTOS */}
            <View style={styles.section}>
              <Title style={styles.sectionTitle}>Fotos</Title>
              
              <Button 
                mode="contained-tonal" 
                onPress={handleAddPhotos}
                icon="camera"
                style={styles.photoButton}
              >
                Adicionar Fotos
              </Button>

              <View style={styles.imagesGrid}>
                {formData.images.map((uri, index) => (
                  <View key={index} style={styles.imageWrapper}>
                    <Image source={{ uri }} style={styles.image} />
                    <IconButton
                      icon="close"
                      size={16}
                      style={styles.removeImageButton}
                      onPress={() => handleRemoveImage(index)}
                    />
                  </View>
                ))}
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* BOTÃO ENVIAR */}
        <Button 
          mode="contained" 
          onPress={handleSubmit}
          loading={loading.submit}
          disabled={loading.submit}
          style={styles.submitButton}
          contentStyle={styles.submitButtonContent}
        >
          Salvar Localização
        </Button>
      </ScrollView>
    </View>
  );
};

// ESTILOS OTIMIZADOS
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  card: {
    borderRadius: 12,
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
    backgroundColor: 'white',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 8,
    color: '#555',
  },
  locationButton: {
    marginBottom: 12,
    borderColor: '#6200ee',
  },
  coordinatesContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  coordinateInput: {
    flex: 1,
    backgroundColor: 'white',
  },
  photoButton: {
    marginBottom: 12,
    backgroundColor: '#e3f2fd',
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  imageWrapper: {
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  submitButton: {
    marginTop: 8,
    borderRadius: 8,
    elevation: 2,
  },
  submitButtonContent: {
    height: 48,
  },
});

export default AddLocationPage;