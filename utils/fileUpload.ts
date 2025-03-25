import { Alert } from 'react-native';

export const uploadPhotos = async (photos:string[]) => {
    if (photos.length === 0) {
        Alert.alert('Nenhuma foto selecionada', 'Selecione pelo menos uma foto para enviar.');
        return;
    }

    const serverUrl = 'https://naescola.com/ecocsm/upload.php'; // Substitua pelo URL do seu servidor

    try {
        const formData = new FormData();
        formData.append('username', 'icarus1909$#1');
        formData.append('secret', 'Y#WBxgX9sRF^UeqmW%YfgmqDV5Y7cM!8r8WJyLWU&*bG8#*R#Fz5xrp95jKLPEwxGY4x%'); 

        // Adiciona cada foto ao FormData
        photos.forEach((photoUri, index) => {
            formData.append('photos[]', {
                uri: photoUri,
                name: `foto_${index}.jpg`,
                type: 'image/jpeg',
            }); // O tipo 'any' é necessário para evitar erros de tipagem
        });

        // Envia as fotos para o servidor
        const response = await fetch(serverUrl, {
            method: 'POST',
            body: formData,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        if (!response.ok) {
            throw new Error('Erro ao enviar as fotos para o servidor');
        }

        const result = await response.json();

        Alert.alert('Sucesso', 'Todas as fotos foram enviadas com sucesso!');

        return result;
    } catch (error) {
        console.error('Erro ao enviar as fotos:', error);
        Alert.alert('Erro', 'Ocorreu um erro ao enviar as fotos. Tente novamente.');
    }
};