//#region Imports
import React, { useRef, useEffect, useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  Linking,
  RefreshControl
} from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LocationData } from '@/constants/dataTypes';
import RenderHTML from 'react-native-render-html';
import MapView, { Marker } from 'react-native-maps';
import * as Clipboard from 'expo-clipboard';
import { showMessage } from 'react-native-flash-message';
import { ScrollView } from 'react-native-gesture-handler';
import {openDirectionsInGoogleMaps} from '@/utils/maps';
import ImageGallery from './ImageGallery'; // Ajuste o caminho

//#endregion

interface BottomSheetProps {
  location: LocationData | null;
  onClose: () => void;
  toggleCamera: () => void;
}

const CustomBottomSheet: React.FC<BottomSheetProps> = ({ location, onClose, toggleCamera }) => {
  //#region constants
  const bottomSheetRef = useRef<BottomSheet>(null);
  const screenWidth = Dimensions.get('window').width;
  const [currentSnapIndex, setCurrentSnapIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const { bottom: bottomSafeArea } = useSafeAreaInsets();
  //#endregion

  //#region effects
  useEffect(() => {
    if (location == null) {
      bottomSheetRef.current?.close();
    } else {
      bottomSheetRef.current?.collapse();
    }
  }, [location]);
  //#endregion

  //#region callbacks
  const handleSheetChanges = useCallback((index: number) => {
    setCurrentSnapIndex(index);
  }, []);

  const handleClose = () => {
    bottomSheetRef.current?.close();
    onClose();
  };

  const handleOpenMaps = () => {
    if (!location?.coordinates) return;
    
    const { latitude, longitude } = location.coordinates;
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    
    Linking.openURL(url).catch(err => {
      showMessage({
        message: "Não foi possível abrir o mapa",
        description: "Verifique se você tem um aplicativo de mapas instalado",
        type: "danger",
      });
    });
  };

  const handleCopyAddress = async () => {
    if (!location?.address) return;
    
    await Clipboard.setStringAsync(location.address);
    showMessage({
      message: "Endereço copiado!",
      type: "success",
    });
  };
  //#endregion

  //#region styles
  const contentContainerStyle = useMemo(
    () => ({
      ...styles.contentContainer,
      paddingBottom: bottomSafeArea,
    }),
    [bottomSafeArea]
  );

  const getMapStyle = () => ({
    height: currentSnapIndex >= 2 ? 200 : 100,
    borderRadius: 12,
    marginVertical: 10,
    overflow: 'hidden',
  });
  //#endregion

  //#region render helpers
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerContent}>
        <View style={[styles.iconContainer, { backgroundColor: location?.color || '#027AFF' }]}>
          <MaterialCommunityIcons 
            name={location?.icon || 'map-marker'} 
            size={24} 
            color="white" 
          />
        </View>
        <View style={styles.headerTextContainer}>
          <Text style={styles.name} numberOfLines={1}>{location?.name || 'Local'}</Text>
          <TouchableOpacity onPress={handleCopyAddress}>
            <Text style={styles.address} numberOfLines={1}>
              {location?.address || 'Endereço não disponível'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.madeBy}>Registado por {location?.createdBy}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
        <MaterialCommunityIcons name="close" size={24} color="#666" />
      </TouchableOpacity>
    </View>
  );

  const renderMap = () => {
    if (!location?.coordinates) return null;
    
    return (
      <TouchableOpacity activeOpacity={0.9} onPress={handleOpenMaps}>
        <MapView
          style={getMapStyle()}
          initialRegion={{
            latitude: location.coordinates.latitude,
            longitude: location.coordinates.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }}
          scrollEnabled={false}
          zoomEnabled={false}
        >
          <Marker
            coordinate={{
              latitude: location.coordinates.latitude,
              longitude: location.coordinates.longitude,
            }}
          >
            <View style={[styles.marker, { backgroundColor: location?.color || '#027AFF' }]}>
              <MaterialCommunityIcons name={location?.icon || 'map-marker'} size={20} color="white" />
            </View>
          </Marker>
        </MapView>
      </TouchableOpacity>
    );
  };

  const renderImages = () => {
    if (!location?.images || location.images.length === 0) return null;
    
    return (
      <View style={styles.imagesContainer}>
        <Text style={styles.sectionTitle}>Fotos</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.imagesScrollContent}
        >
          {location.images.length >0 &&
          location.images.map((uri, index) => (
            <TouchableOpacity key={index} activeOpacity={0.8}>
              <Image source={{ uri }} style={styles.image} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };
  

  const renderAdditionalInfo = () => {
    if (!location?.aditional) return null;
    
    return (
      <View style={styles.additionalInfoContainer}>
        <Text style={styles.sectionTitle}>Informações Adicionais</Text>
        <View style={styles.htmlContainer}>
          <RenderHTML 
            contentWidth={screenWidth - 40} 
            source={{ html: location.aditional }} 
            baseStyle={styles.htmlBaseStyle}
          />
        </View>
      </View>
    );
  };
  //#endregion

  return (
    <BottomSheet
      ref={bottomSheetRef}
      onChange={handleSheetChanges}
      snapPoints={['30%', '60%', '85%']}
      index={currentSnapIndex}
      backgroundStyle={styles.background}
      handleIndicatorStyle={styles.handleIndicator}
    >
      <BottomSheetScrollView 
        style={contentContainerStyle}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={() => setRefreshing(false)} 
            colors={['#027AFF']}
          />
        }
      >
        {renderHeader()}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.cameraButton]} 
            onPress={toggleCamera}
          >
            <MaterialCommunityIcons name="camera-plus" size={20} color="white" />
            <Text style={styles.buttonText}>Fotos</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.googleButton]}
            onPress={() => openDirectionsInGoogleMaps(location?.coordinates)}
          >
            <View style={styles.googleIconContainer}>
              <MaterialCommunityIcons name="google-maps" size={20} color="white" />
            </View>
            <Text style={styles.buttonText}>Direções</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>{location?.description}</Text>
        </View>

        <ImageGallery
          images={location?.images || []} 
          thumbnailSize={200}
          containerStyle={{ marginTop: 15 }}
          thumbnailStyle={{ borderRadius: 10 }}
        />
      </BottomSheetScrollView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  background: {
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  handleIndicator: {
    backgroundColor: '#ccc',
    width: 40,
    height: 5,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  address: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  madeBy: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  closeButton: {
    padding: 8,
    marginLeft: 10,
  },
  descriptionContainer: {
    marginVertical: 15,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#444',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  imagesContainer: {
    marginTop: 20,
  },
  imagesScrollContent: {
    paddingRight: 20,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 10,
    marginRight: 10,
  },
  additionalInfoContainer: {
    marginTop: 20,
  },
  htmlContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
  },
  htmlBaseStyle: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12, // Espaço entre botões
  },
  actionButton: {
    flex: 1, // Ocupa espaço igual
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  cameraButton: {
    backgroundColor: '#027AFF', // Azul consistente com seu tema
  },
  googleButton: {
    backgroundColor: '#db4437', // Azul oficial do Google
    position: 'relative',
    overflow: 'hidden',
  },
  googleIconContainer: {
    marginRight: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 4,
  },

  marker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
});

export default CustomBottomSheet;