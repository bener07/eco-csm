import { handlePicture, useCamera } from '../context/CameraContext'; // Importe o hook do contexto
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState, useRef } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, Image, ScrollView } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { useLocalSearchParams } from 'expo-router';
import { LocationData } from '@/constants/dataTypes';
import { RouteParams } from 'expo-router';

export default function CameraScreen() {
    const { onPicture, onClose } = useCamera(); // Use o hook do contexto

    const [facing, setFacing] = useState<CameraType>('back');
    const [permission, requestPermission] = useCameraPermissions();
    const [photos, setPhotos] = useState<string[]>([]);
    const cameraRef = useRef<CameraView>(null);

    const params = useLocalSearchParams();

    // Converte os parâmetros de volta para o tipo LocationData
    const location:LocationData = {
        id: params.id,
        name: params.name,
        description: params.description,
        latitude: parseFloat(params.latitude), // Converte string para número
        longitude: parseFloat(params.longitude),
        color: params.color,
        icon: params.icon,
        images: JSON.parse(params.images), // Converte string JSON para array
        address: params.address,
    };


    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.message}>Precisamos de autorização para usar a sua câmera</Text>
                <Button onPress={requestPermission} title="Conceder permissão" />
            </View>
        );
    }

    const toggleCameraFacing = () => {
        setFacing(current => (current === 'back' ? 'front' : 'back'));
    };

    const takePicture = async () => {
        if (cameraRef.current) {
            const photo = await cameraRef.current.takePictureAsync();
            setPhotos([...photos, photo.uri]);
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setPhotos([...photos, result.assets[0].uri]);
            onPicture(result.assets[0].uri); // Usa a função onPicture do contexto
        }
    };

    // Função para remover uma foto
    const removePhoto = (index: number) => {
        const newPhotos = photos.filter((_, i) => i !== index);
        setPhotos(newPhotos);
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Câmera ocupa a maior parte da tela */}
            <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
                        <MaterialCommunityIcons name="camera-flip" size={24} color="white" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.button} onPress={takePicture}>
                        <MaterialCommunityIcons name="camera" size={24} color="white" />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.button]} onPress={pickImage}>
                        <MaterialCommunityIcons name="image" size={24} color="white" />
                    </TouchableOpacity>
                </View>
                <View style={styles.customHeader}>
                    <Text style={styles.headerText}>Camâra</Text>
                    <TouchableOpacity style={[styles.button, {position: 'absolute', right: 10}]} onPress={onClose}>
                        <MaterialCommunityIcons name="close" size={24} color="white" />
                    </TouchableOpacity>
                </View>
            </CameraView>

            {/* Área das imagens capturadas */}
            <View style={styles.photosContainer}>
                <ScrollView horizontal>
                    {photos.map((photoUri, index) => (
                        <View key={index} style={styles.photoContainer}>
                            <Image source={{ uri: photoUri }} style={styles.photo} />
                            <TouchableOpacity
                                style={styles.removeButton}
                                onPress={() => removePhoto(index)}
                            >
                                <MaterialCommunityIcons name="close" size={20} color="white" />
                            </TouchableOpacity>
                        </View>
                    ))}
                </ScrollView>
            </View>
            {
                photos.length > 0 &&
                <TouchableOpacity style={styles.confirmButton} onPress={() => handlePicture(photos, location)}>
                    <MaterialCommunityIcons name="check" size={30} color="white" />
                </TouchableOpacity>
            }
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
    },
    headerText: {
        color: 'white',
        fontSize: 20,
    },
    customHeader: {
        width: '100%',
        height: 50,
        position: 'absolute',
        top: 0,
        zIndex: 1000, // Coloca o botão de fechar no topo
        backgroundColor: 'rgba(0,0,0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    message: {
        textAlign: 'center',
        paddingBottom: 10,
        color: 'white',
    },
    camera: {
        flex: 1, // Ocupa a maior parte da tela
        width: '100%',
        justifyContent: 'flex-end', // Botões ficam na parte inferior
    },
    buttonContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0,0,0, 0.5)',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: 60,
        paddingHorizontal: 10,
        elevation: 20,
    },
    button: {
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 14,
        marginTop: 5,
    },
    confirmButton: {
        position: 'absolute',
        bottom: 70,
        right: 10,
        backgroundColor: Colors.primary.icon,
        borderRadius: 50,
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    photosContainer: {
        height: 120, // Altura fixa para a área das imagens
        backgroundColor: 'transparent', // Fundo preto para destacar
        paddingHorizontal: 10, // Espaçamento vertical
        position: 'absolute',
        bottom: 50
    },
    photoContainer: {
        position: 'relative', // Para posicionar o botão "X" corretamente
        marginRight: 10, // Espaçamento entre as fotos
    },
    photo: {
        width: 100,
        height: 100,
        borderRadius: 5,
    },
    removeButton: {
        position: 'absolute', // Posiciona o botão "X" sobre a imagem
        top: 5,
        right: 5,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: 10,
        padding: 5,
    },


});