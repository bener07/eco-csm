import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState, useRef } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, Image, ScrollView } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';

interface CameraProps {
    isCameraVisible: boolean;
    onPicture: (photoUri: string) => void;
    onClose: () => void;
}

function MainCamera({ onPicture, onClose }: { onPicture: (photoUri: string) => void, onClose: () => void }) {
    const [facing, setFacing] = useState<CameraType>('back');
    const [permission, requestPermission] = useCameraPermissions();
    const [photos, setPhotos] = useState<string[]>([]); // Armazena as fotos tiradas/selecionadas
    const cameraRef = useRef<CameraView>(null);

    if (!permission) {
        // Permissões da câmera ainda estão carregando.
        return <View />;
    }

    if (!permission.granted) {
        // Permissões da câmera ainda não foram concedidas.
        return (
            <View style={styles.container}>
                <Text style={styles.message}>Precisamos de autorização para usar a sua câmera</Text>
                <Button onPress={requestPermission} title="Conceder permissão" />
            </View>
        );
    }

    // Função para alternar entre câmera frontal e traseira
    const toggleCameraFacing = () => {
        setFacing(current => (current === 'back' ? 'front' : 'back'));
    };

    // Função para tirar uma foto
    const takePicture = async () => {
        if (cameraRef.current) {
            const photo = await cameraRef.current.takePictureAsync();
            setPhotos([...photos, photo.uri]); // Adiciona a foto à lista de fotos
        }
    };

    // Função para selecionar uma foto da galeria
    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setPhotos([...photos, result.assets[0].uri]); // Adiciona a foto selecionada à lista de fotos
            onPicture(result.assets[0].uri); // Chama a função onPicture com a URI da foto
        }
    };

    return (
        <View style={styles.container}>
            <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
                <View style={styles.buttonContainer}>
                    {/* Botão para alternar a câmera */}
                    <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
                        <MaterialCommunityIcons name="camera-flip" size={24} color="white" />
                        <Text style={styles.buttonText}>Virar Câmera</Text>
                    </TouchableOpacity>

                    {/* Botão para tirar foto */}
                    <TouchableOpacity style={styles.button} onPress={takePicture}>
                        <MaterialCommunityIcons name="camera" size={24} color="white" />
                        <Text style={styles.buttonText}>Tirar Foto</Text>
                    </TouchableOpacity>

                    {/* Botão para adicionar foto da galeria */}
                    <TouchableOpacity style={styles.button} onPress={pickImage}>
                        <MaterialCommunityIcons name="image" size={24} color="white" />
                        <Text style={styles.buttonText}>Galeria</Text>
                    </TouchableOpacity>

                    {/* Botão para fechar a câmera */}
                    <TouchableOpacity style={styles.button} onPress={onClose}>
                        <MaterialCommunityIcons name="close" size={24} color="white" />
                        <Text style={styles.buttonText}>Fechar</Text>
                    </TouchableOpacity>
                </View>
            </CameraView>

            <ScrollView horizontal style={styles.photosContainer}>
                {photos.map((photoUri, index) => (
                    <Image key={index} source={{ uri: photoUri }} style={styles.photo} />
                ))}
            </ScrollView>
        </View>
    );
}

export default function Camera({ onPicture, isCameraVisible, onClose }: CameraProps) {
    if (isCameraVisible) {
        return (
            <View style={styles.mainContainer}>
                <MainCamera onPicture={onPicture} onClose={onClose} />
            </View>
        );
    }
    return <></>;
}

const styles = StyleSheet.create({
    mainContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 20,
        zIndex: 9999,
        width: '100%',
        height: '95%',
        backgroundColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        justifyContent: 'center',
        width: '100%',
        height: '100%',
    },
    message: {
        textAlign: 'center',
        paddingBottom: 10,
        color: 'white',
    },
    camera: {
        height: '80%',
        width: '100%',
        backgroundColor: 'black',
    },
    buttonContainer: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'transparent',
        justifyContent: 'space-around',
        alignItems: 'flex-end',
        marginBottom: 20,
    },
    button: {
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 14,
        marginTop: 5,
    },
    photosContainer: {
        flexDirection: 'row',
        height: 10,
        paddingHorizontal: 10,
    },
    photo: {
        width: 100,
        height: 100,
        marginRight: 10,
        borderRadius: 5,
    },
});