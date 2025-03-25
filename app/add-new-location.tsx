import React, { useState } from 'react';
import { View, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Button, TextInput, Card, Title } from 'react-native-paper';
import { db } from '@/firebaseConfig';
import { addDoc, collection } from 'firebase/firestore';
import {router} from 'expo-router';
import AntDesign from '@expo/vector-icons/AntDesign';
import {LocationData} from '@/constants/dataTypes';

const AddLocationPage = () => {
  const [location, setLocation] = useState<LocationData>({
    id: Math.floor(Math.random() * 1000), // Gera um ID aleatório
    name: '',
    description: '',
    latitude: 0,
    longitude: 0,
    color: '',
    icon: '',
    images: [],
    address: '',
    aditional: '',
  });

  const handleInputChange = (name, value) => {
    setLocation({ ...location, [name]: value });
  };

  const handleSubmit = async () => {
    if (
      !location.name ||
      !location.description ||
      !location.latitude ||
      !location.longitude ||
      !location.address
    ) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios.');
      return;
    }

    try {
      await addDoc(collection(db, 'locations'), location);
      Alert.alert('Sucesso', 'Localização adicionada com sucesso!');
      setLocation({
        id: Math.floor(Math.random() * 1000),
        name: '',
        description: '',
        latitude: '',
        longitude: '',
        color: '',
        icon: '',
        images: [],
        address: '',
        aditional: '',
      });
    } catch (error) {
      console.error('Erro ao adicionar localização: ', error);
      Alert.alert('Erro', 'Ocorreu um erro ao adicionar a localização.');
    }
  };

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
        <TouchableOpacity style={{position:'absolute', top: 20, left: 20, width: 50, height: 50, borderRadius: 50}} onPress={() => router.back()}>
            <AntDesign name="pluscircle" size={24} color="black" />
        </TouchableOpacity>
      <Card style={{ marginBottom: 16 }}>
        <Card.Content>
          <Title style={{ marginBottom: 16 }}>Adicionar Nova Localização</Title>

          <TextInput
            label="Nome *"
            value={location.name}
            onChangeText={(text) => handleInputChange('name', text)}
            style={{ marginBottom: 8 }}
          />

          <TextInput
            label="Descrição *"
            value={location.description}
            onChangeText={(text) => handleInputChange('description', text)}
            style={{ marginBottom: 8 }}
          />

          <TextInput
            label="Latitude *"
            value={location.latitude}
            onChangeText={(text) => handleInputChange('latitude', text)}
            keyboardType="numeric"
            style={{ marginBottom: 8 }}
          />

          <TextInput
            label="Longitude *"
            value={location.longitude}
            onChangeText={(text) => handleInputChange('longitude', text)}
            keyboardType="numeric"
            style={{ marginBottom: 8 }}
          />

          <TextInput
            label="Cor"
            value={location.color}
            onChangeText={(text) => handleInputChange('color', text)}
            style={{ marginBottom: 8 }}
          />

          <TextInput
            label="Ícone"
            value={location.icon}
            onChangeText={(text) => handleInputChange('icon', text)}
            style={{ marginBottom: 8 }}
          />

          <TextInput
            label="Endereço *"
            value={location.address}
            onChangeText={(text) => handleInputChange('address', text)}
            style={{ marginBottom: 8 }}
          />

          <TextInput
            label="Informações Adicionais"
            value={location.aditional}
            onChangeText={(text) => handleInputChange('aditional', text)}
            style={{ marginBottom: 16 }}
          />

          <Button mode="contained" onPress={handleSubmit}>
            Adicionar Localização
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

export default AddLocationPage;