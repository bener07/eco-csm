// context/CameraContext.tsx
import React, { createContext, useContext, ReactNode } from 'react';
import {router, useLocalSearchParams} from 'expo-router';
import { uploadPhotos } from '@/utils/fileUpload';
import {LocationData} from '@/constants/dataTypes';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig'; // Ajuste o caminho para o seu arquivo de configuração do Firebase



interface CameraContextType {
    onPicture: (photoUri: string) => void;
    onClose: () => void;
}

const CameraContext = createContext<CameraContextType | undefined>(undefined);

const updatePhotosInFirebase = (id:string, pictures:any) => {
    pictures.forEach((pic:any) => {
        console.log(pic.file)
        updateImagesArray(id, pic.file);
    });

}
/**
 * Função para atualizar o campo `images` de um documento no Firestore.
 * @param collectionName - Nome da coleção onde o documento está armazenado.
 * @param documentId - ID do documento a ser atualizado.
 * @param newImageUrl - Nova URL da imagem a ser adicionada ao array `images`.
 */
async function updateImagesArray(documentId: string, newImageUrl: string) {
  try {
    // Referência ao documento
    const collectionName = 'locations';
    const documentRef = doc(db, collectionName, documentId);

    // Busca o documento
    const documentSnapshot = await getDoc(documentRef);

    // Verifica se o documento existe
    if (!documentSnapshot.exists()) {
      console.error('Documento não encontrado.');
      return;
    }

    // Obtém o array atual de imagens
    const currentImages = documentSnapshot.data().images || [];

    // Adiciona a nova URL ao array (ou faz outra operação, se necessário)
    const updatedImages = [...currentImages, newImageUrl];

    // Atualiza o campo `images` no Firestore
    await updateDoc(documentRef, {
      images: updatedImages,
    });

  } catch (error) {
    console.error('Erro ao atualizar o documento:', error);
  }
}

export const CameraProvider = ({ children, onPicture, onClose }: { children: ReactNode; onPicture: (photoUri: string) => void; onClose: () => void }) => {
    return (
        <CameraContext.Provider value={{ onPicture, onClose }}>
            {children}
        </CameraContext.Provider>
    );
};
export const handlePicture = (pictures:string[], location:LocationData) => {
    console.log("Location ", location.color);
    uploadPhotos(pictures).then((pics) => updatePhotosInFirebase(location?.id, pics));
    handleClose();
}

export const handleClose = () => {
    router.back();
}

export const useCamera = () => {
    const context = useContext(CameraContext);
    if (!context) {
        throw new Error('useCamera must be used within a CameraProvider');
    }
    return context;
};