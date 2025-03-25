import React, { useRef, useEffect, useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent, 
  RefreshControl
} from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FlatGrid } from 'react-native-super-grid';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LocationData } from '@/constants/dataTypes';
import { ScrollView } from 'react-native-gesture-handler';
import RenderHTML from 'react-native-render-html';

interface BottomSheetProps {
  location: LocationData | null;
  onClose: () => void;
  toggleCamera: () => void;
}

const CustomBottomSheet: React.FC<BottomSheetProps> = ({ location, onClose, toggleCamera}) => {
  //#region contstants
  const bottomSheetRef = useRef<BottomSheet>(null);
  const screenWidth = Dimensions.get('window').width;
  const [isFullHeader, setFullHeader] = useState(true);
  const [currentSnapIndex, setCurrentSnapIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false); 
  //#endregion


  useEffect(() => {
    if (location == null) {
      bottomSheetRef.current?.close();
    } else {
      bottomSheetRef.current?.collapse();
    }
  }, [location]);


  //#region hooks
  const { bottom: bottomSafeArea } = useSafeAreaInsets();
  //#endregion

  //#region callbacks
  const handleSheetChanges = useCallback((index: number) => {
    if(index >= 2){
      setFullHeader(true);
    }else{
      setFullHeader(false);
    }
    setCurrentSnapIndex(index);
  }, []);

  const handleClose = () => {
    bottomSheetRef.current?.close();
    onClose();
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

  const closeButtonStyle = useMemo(
    () => ({
      ...styles.closeButton,
      backgroundColor: '#f0f0f0', // Cor de fundo do botão de fechar
    }),
    []
  );
  //#endregion

  //#region functions
  const onRefresh = () => {
    setRefreshing(true); // Ativa o estado de refreshing

    // Lógica do bottom sheet
    bottomSheetRef.current?.snapToIndex(currentSnapIndex - 1);
    setCurrentSnapIndex(currentSnapIndex - 1);

    // Simula uma operação assíncrona (ex.: buscar dados)
    setTimeout(() => {
      setRefreshing(false); // Desativa o estado de refreshing
      console.log('Refresh completo!');
    }, 2000); // 2 segundos de delay 
  };

  //#endregion

  //#region renders
  //#endregion

  return (
      <BottomSheet
        ref={bottomSheetRef}
        onChange={handleSheetChanges}
        snapPoints={['25%', '50%','75%', '90%']}
        index={currentSnapIndex}
      >
        <BottomSheetView style={contentContainerStyle}>
            <View style={styles.headerContainer}>
              <View style={styles.headerContentContainer}>
                <Text style={styles.name}>{location?.name || 'Local'}</Text>
                <Text style={styles.address}>
                  {location?.address || 'Endereço não disponível'}
                </Text>
              </View>

                {/* Botão de fechar */}
              <TouchableOpacity style={closeButtonStyle} onPress={handleClose}>
                <MaterialCommunityIcons name="close-circle-outline" size={30} color="black" />
              </TouchableOpacity>
            </View>
            <View style={styles.actionsContainer}>
              <Text style={styles.description}>
                {location?.description}
              </Text>
              <TouchableOpacity style={styles.actionButton} onPress={toggleCamera}>
                <MaterialCommunityIcons name="camera-plus" size={30} color="white" />
              </TouchableOpacity>
            </View>
            <ScrollView
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
              showsVerticalScrollIndicator={false} // Oculta o scroll vertical
              contentContainerStyle={{ padding: 10 }} // Ajusta o padding do conteúdo
              contentInset={{ top: 10 }} // Ajusta o topo do conteúdo
              onScroll={({ nativeEvent }) => {
                const { contentOffset } = nativeEvent;
                if (contentOffset.y <= -100) {
                  setFullHeader(true);
                } else {
                  setFullHeader(false);
                }
              }}
            >

              {/* Lista de imagens */}
              {location?.images && location.images.length > 0 && (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                  {location.images.map((item, index) => (
                    <Image
                      key={index}
                      style={styles.photo}
                      source={{ uri: item }}
                      resizeMode="cover"
                    />
                  ))}
                </View>
              )}

              {/* Conteúdo adicional (RenderHTML) */}
              <View style={{ padding: 10, marginTop: 20, marginBottom: 20 }}>
                <RenderHTML contentWidth={screenWidth - 20} source={{ html: location?.aditional || '' }} />
              </View>
            </ScrollView>
        </BottomSheetView>
      </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: 'none',
    position:'absolute',
    bottom: 0,
    height: '100%',
  },
  contentContainer: {
    flex: 1,
    minHeight: 200,
    padding: 10,
  },
  // Full Header
  fullHeaderContainer: {
    flexDirection: 'column',
    paddingTop: 15,
    paddingHorizontal: 16,
  },
  fullHeaderContentContainer: {
    flexGrow: 1,
    marginTop: 20,
  },
  fullHeaderName:{
    fontSize: 35,
    lineHeight: 35,
    fontWeight: '700',
    width: '100%',
    marginTop: 20,
  },
  fullHeaderCloseButton:{
    position: 'absolute',
    top: 0,
    right: 5,
    width: 30,
    height: 30,
  },
  // Header
  headerContainer: {
    flexDirection: 'row',
    paddingBottom: 8,
    paddingHorizontal: 16,
  },
  headerContentContainer: {
    flexGrow: 1,
  },
  name: {
    fontSize: 22,
    lineHeight: 22,
    width: '90%',
    fontWeight: '700',
  },
  address: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 14,
    fontWeight: '400',
    color: '#666',
    width: 200
  },
  closeButton: {
    alignContent: 'center',
    alignItems: 'center',
    width: 30,
    height: 30,
    borderRadius: 30,
    padding: 0,
    margin: 0,
  },
  closeText: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 30,
  },
  description: {
    fontSize: 15,
  },
  // Photos
  flatListContainer: {
    paddingVertical: 100,
  },
  flatListContentContainer: {
    paddingHorizontal: 16,
  },
  separator: {
    width: 4,
  },
  photo: {
    width: 100, // Largura de cada item
    height: 100, // Altura de cada item
    marginBottom: 20, // Espaçamento entre os itens
    borderRadius: 8, // Bordas arredondadas
  },
  scrollView: {
    height: 300, // Altura da ScrollView (ajuste conforme necessário)
  },
  scrollViewContent: {},
  imageContainer: {
    width: 300, // Largura de cada item
    height: 300, // Altura de cada item
    marginRight: 10, // Espaçamento entre os itens
    borderRadius: 8, // Bordas arredondadas
    overflow: 'hidden', // Garante que a imagem respeite o borderRadius
  },
  fullHeaderPhoto: {
    width: '100%',
    height: '100%',
  },

  // Actions
  actionsContainer: {
    paddingVertical: 8,
    paddingLeft: 16,
    paddingRight: 8,
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  actionButton: {
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    minHeight: 40,
    backgroundColor: '#027AFF',
  },
  actionButtonLabel: {
    color: 'white',
    fontWeight: '600',
  },
});

export default CustomBottomSheet;