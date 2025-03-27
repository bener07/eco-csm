import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Button, TextInput, Card, Title, ActivityIndicator, IconButton } from 'react-native-paper';
import { db } from '@/firebaseConfig';
import { addDoc, collection } from 'firebase/firestore';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import {LocationData} from '@/constants/dataTypes';
import { SafeAreaView } from 'react-native-safe-area-context';
import { handlePicture } from '@/context/CameraContext';
import { useUser } from '@clerk/clerk-expo';


const AddLocationPage = () => {
  const {user} = useUser();
  const [formData, setFormData] = useState<LocationData>({
    name: '',
    description: '',
    coordinates:{
      latitude: 0,
      longitude: 0,
    },
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
        coordinates: location.coords
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
    // Validação básica dos campos obrigatórios
    if (!formData.name || !formData.description) {
      Alert.alert('Atenção', 'Preencha pelo menos o nome e descrição');
      return;
    }
  
    // Verifica se há coordenadas válidas
    if (!formData.coordinates || !formData.coordinates.latitude || !formData.coordinates.longitude) {
      Alert.alert('Atenção', 'Localização geográfica é obrigatória');
      return;
    }
  
    setLoading(prev => ({...prev, submit: true}));
  
    try {
      // 1. Primeiro salva os dados básicos no Firestore
      const docRef = await addDoc(collection(db, 'locations'), {
        name: formData.name,
        description: formData.description,
        coordinates: formData.coordinates,
        color: formData.color || '#1da1f2', // Cor padrão se não for fornecida
        icon: formData.icon || 'map-marker', // Ícone padrão
        address: formData.address || '',
        images: [], // Inicialmente vazio, será atualizado depois
        createdAt: new Date(),
        createdBy: user?.username || 'anonymous',
        updatedAt: new Date()
      });
  
      // 2. Se houver imagens para upload, processa-as
      if (formData.images && formData.images.length > 0) {
        try {
          // Cria o objeto de localização para passar ao handlePicture
          const newLocation: LocationData = {
            id: docRef.id,
            ...formData,
            images: [] // Serão atualizadas pelo upload
          };
  
          // Executa o upload das fotos e atualização no Firebase
          await handlePicture(formData.images, newLocation);
        } catch (uploadError) {
          console.error("Erro no upload de imagens:", uploadError);
          // Não interrompe o fluxo principal, apenas registra o erro
        }
      }
  
      // Feedback de sucesso
      Alert.alert('Sucesso!', 'Localização salva com sucesso');
      router.back();
  
    } catch (error) {
      console.error("Erro ao salvar localização:", error);
      Alert.alert('Erro', 'Ocorreu um erro ao salvar a localização');
    } finally {
      setLoading(prev => ({...prev, submit: false}));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* CABEÇALHO */}
        <View style={styles.header}>
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
                  value={formData.coordinates.latitude.toString()}
                  style={styles.coordinateInput}
                  mode="outlined"
                  editable={false}
                />
                <TextInput
                  label="Longitude"
                  value={formData.coordinates.longitude.toString()}
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
              <Text>Guarde fotos com a camara e selecione-as aqui</Text>
              
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
    </SafeAreaView>
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
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
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