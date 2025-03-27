import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Modal, Dimensions } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';


interface ImageGalleryProps {
  images: string[];
  thumbnailSize?: number;
  thumbnailStyle?: object;
  containerStyle?: object;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ 
  images, 
  thumbnailSize = 100,
  thumbnailStyle = {},
  containerStyle = {}
}) => {
  const [visible, setVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { width: screenWidth } = Dimensions.get('window');

  const openViewer = (index: number) => {
    setCurrentIndex(index);
    setVisible(true);
  };

  const closeViewer = () => setVisible(false);

  const changeImage = (direction: 'next' | 'prev') => {
    setCurrentIndex(prev => {
      if (direction === 'next') {
        return prev === images.length - 1 ? 0 : prev + 1;
      } else {
        return prev === 0 ? images.length - 1 : prev - 1;
      }
    });
  };

  if (!images || images.length === 0) return null;

  return (
    <>
        <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={true}
            contentContainerStyle={[styles.thumbnailContainer, {height: thumbnailSize + 10}]} // Adiciona altura baseada no tamanho das thumbnails
            style={styles.scrollView} // Adiciona estilo para o ScrollView
        >
            {images.map((uri, index) => (
            <TouchableOpacity 
                key={`thumbnail-${index}`} 
                onPress={() => openViewer(index)}
                activeOpacity={0.7}
            >
                <Image
                style={[
                    styles.thumbnail, 
                    { width: thumbnailSize, height: thumbnailSize },
                    thumbnailStyle
                ]}
                source={{ uri }}
                contentFit="cover"
                transition={300}
                />
            </TouchableOpacity>
            ))}
        </ScrollView>
        <View style={[styles.container, containerStyle]}>
            <Modal
                visible={visible}
                transparent
                onRequestClose={closeViewer}
                animationType="fade"
                statusBarTranslucent
                >
                <View style={styles.modalContainer}>
                    {/* Close Button */}
                    <TouchableOpacity style={styles.closeButton} onPress={closeViewer}>
                        <MaterialCommunityIcons name="close" size={30} color="white" />
                    </TouchableOpacity>

                    {/* Main Image */}
                    <Image
                        style={[styles.fullImage, { width: screenWidth * 0.95 }]}
                        source={{ uri: images[currentIndex] }}
                        contentFit="contain"
                        transition={300}
                    />
                    <View style={styles.navigation}>
                        <TouchableOpacity 
                        style={styles.navButton} 
                        onPress={() => changeImage('prev')}
                        >
                        <MaterialCommunityIcons 
                            name="chevron-left" 
                            size={40} 
                            color="white" 
                        />
                        </TouchableOpacity>

                        <Text style={styles.counter}>
                        {currentIndex + 1} / {images.length}
                        </Text>

                        <TouchableOpacity 
                        style={styles.navButton} 
                        onPress={() => changeImage('next')}
                        >
                        <MaterialCommunityIcons 
                            name="chevron-right" 
                            size={40} 
                            color="white" 
                        />
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
  },
  thumbnailContainer: {
    paddingHorizontal: 10,
    paddingBottom: 5,
    flexGrow: 1
  },
  thumbnail: {
    borderRadius: 8,
    marginRight: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    height: '70%',
    resizeMode: 'contain',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 5,
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '80%',
    marginTop: 20,
  },
  navButton: {
    padding: 10,
  },
  counter: {
    color: 'white',
    fontSize: 18,
    fontWeight: '500',
  },
});

export default ImageGallery;