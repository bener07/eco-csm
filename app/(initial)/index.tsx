import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebaseConfig'; // Ajuste o caminho conforme necessário
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import CustomBottomSheet from '@/components/CustomBottomSheet';
import { router } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';
import { LocationData } from '@/constants/dataTypes';
import { requestLocationPermission } from '@/utils/permissions';
import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import { useAuth } from '@clerk/clerk-expo';

export default function MapScreen() {
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [ isSelectingNewMarker, setIsSelectingNewMarker] = useState(false);
  const { isSignedIn } = useAuth();
  const [loading, setLoading] = useState(true);

  const mapRef = useRef(null);
  const markerRefs = useRef([]);


  const { id } = useLocalSearchParams<{id: number|undefined|null}>();

  useEffect(()=>{
    if(id){
      const location = locations.find((location) => location.id == id);
      if(!location){
        return (
          <View style={styles.container}>
            <Text>Local não encontrado.</Text>
          </View>
        );
      }
      if(mapRef.current){
        const region = {
          latitude: location.coordinates.latitude,
          longitude: location.coordinates.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };  
        mapRef.current.animateToRegion(region, 1000);
        markerRefs.current[location.id].showCallout()
        setSelectedLocation(location);
      }
    }
  }, [id, locations]);

  // Obtém a localização atual do usuário
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const location = await requestLocationPermission();
        
        if (!location) {
          setLoading(true);
          return;
        }
  
        const coords = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        };
        
        setUserLocation(coords);
        setLoading(false);
  
      } catch (err) {
        console.error("Error getting location:", err);
        // setError('Não foi possível obter a localização');
        setLoading(false);
      }
    };
  
    fetchLocation();
  }, []);

  // Busca os locais do Firestore em tempo real
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'locations'), (querySnapshot) => {
      try {
        const locationsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as LocationData[];
        setLocations(locationsData);
      } catch (error) {
        console.error('Erro ao carregar locais:', error);
      }
    });

    // Retorna uma função para parar de escutar as atualizações quando o componente for desmontado
    return () => unsubscribe();
  }, []);



  const handleMarkerSelect = (newLocation: LocationData) => {
    setIsSelectingNewMarker(true); // Indica que um novo marcador está sendo selecionado
    setSelectedLocation(newLocation); // Atualiza a localização selecionada
  };

  const handleMarkerDeselect = () => {
    if (!isSelectingNewMarker) {
      // Se não estiver selecionando um novo marcador, fecha o BottomSheet
      setSelectedLocation(null);
    }else{
    setIsSelectingNewMarker(false); // Reseta o estado de seleção
    }
  };



  const toggleCamera = () => {
    router.push({
      pathname: '/(tabs)/camera',
      params: {
        id: selectedLocation?.id,
        name: selectedLocation?.name,
        description: selectedLocation?.description,
        latitude: selectedLocation?.coordinates.latitude.toString(), // Converte número para string
        longitude: selectedLocation?.coordinates.longitude.toString(),
        color: selectedLocation?.color,
        icon: selectedLocation?.icon,
        images: JSON.stringify(selectedLocation?.images), // Converte array para string JSON
        address: selectedLocation?.address
      },
    })
  }

  const addNew = () => {
    if(!isSignedIn){
      Alert.alert("Precisa de conta para adicionar lixeiras");
    }else{
      router.push({pathname: '/add-new-location'});
    }
  }

  if (!userLocation && loading) {
    return (
      <View style={styles.container}>
        <Text>Carregando localização...</Text>
      </View>
    );
  }

  

  const mapStyle = [
    {
      "featureType": "poi.business",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "poi.park",
      "elementType": "labels.text",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "road.arterial",
      "elementType": "labels",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "road.highway",
      "elementType": "labels",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "road.local",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    }
  ]

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: userLocation?.latitude || 38.7223, // Default to Lisbon coordinates
          longitude: userLocation?.longitude || -9.1393,
          latitudeDelta: 0.09622,
          longitudeDelta: 0.09622,
        }}
        showsUserLocation={!!userLocation} // Only show if we have user location
        customMapStyle={mapStyle}
      >

        {/* Marcadores dos locais do banco de dados */}
        {locations.map((loc) =>{
          console.log(loc.coordinates);
          return (
          <Marker
            ref={(ref) => (markerRefs.current[loc.id] = ref)}
            key={loc.id}
            coordinate={{
              latitude: loc.coordinates.latitude,
              longitude: loc.coordinates.longitude,
            }}
            title={loc.name}
            description={loc.description}
            onPress={() => handleMarkerSelect(loc)}
            onDeselect={handleMarkerDeselect}
          >
            <Feather name="map-pin" size={30} color={loc.color} />
          </Marker>
          )
        })}
      </MapView>
        <TouchableOpacity onPress={addNew} style={styles.addBtn}>
          <AntDesign name="plus" size={40} color="white" />
        </TouchableOpacity>
      {
        selectedLocation &&
        <CustomBottomSheet onClose={handleMarkerDeselect} location={selectedLocation} toggleCamera={toggleCamera}/>
      }
    </View>
  );
}

const styles = StyleSheet.create({
  addBtn: {
    position: 'absolute',
    bottom: 80,
    right: 30,
    width: 50,
    height: 50,
    backgroundColor: '#1da1f2',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
    shadowColor: 'black',
    shadowOffset: { width: 10, height: 10 },
    shadowOpacity: 0.9,
    shadowRadius: 2,
    elevation: 10,
    zIndex: 10,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  bottomSheet: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    bottom: 0,
    backgroundColor: 'white',
    zIndex: 1000,
  },
  userMarkerView: {
    width: 50,
    height: 50,
    borderRadius: 30, // Torna a imagem redonda
    borderWidth: 2,
    borderColor: 'red',
    backgroundColor: 'blue',
    alignContent: 'center',
    justifyContent: 'center',
  },
  userImage: {
    width: '100%',
    height: '100%',
  },
  calloutContainer: {
    width: 150,
    padding: 10,
    alignItems: 'center',
  },
  calloutTitle: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  calloutDescription: {
    fontSize: 14,
    color: '#666',
  },

  searchContainer: {
    position: 'absolute',
    top: 30,
    left: 10,
    backgroundColor: 'red',
    width: '80%',
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1000,
    height: 40,
  },
});
