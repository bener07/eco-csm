import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, ActivityIndicator } from 'react-native';
import { Link } from 'expo-router';
import { db } from '@/firebaseConfig';
import { collection, onSnapshot } from 'firebase/firestore';
import { Article, LocationData } from '@/constants/dataTypes';
import { requestLocationPermission } from '@/utils/permissions';
import { useAuth } from '@clerk/clerk-expo';
import Geolocation from 'react-native-geolocation-service';

interface Coordinate {
  latitude: number;
  longitude: number;
}

interface WeatherChartData {
  labels: string[];
  data: number[];
}

export default function HomeScreen() {
  const [pollutionArticles, setArticles] = useState<Article[]>([]);
  const [userLocation, setUserLocation] = useState<Coordinate | null>(null);
  const [allLocations, setAllLocations] = useState<LocationData[]>([]);
  const [nearbyLocations, setNearbyLocations] = useState<LocationData[]>([]);
  const [loading, setLoading] = useState({
    articles: true,
    locations: true,
    weather: true
  });
  const [error, setError] = useState<string | null>(null);
  const [locaiton, setLocation] = useState<LocationData|null>(null)
  const screenWidth = Dimensions.get('window').width;
  const { isSignedIn } = useAuth();

  // Função para calcular distância entre coordenadas (fórmula Haversine)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Carregar artigos
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'artigos'), (querySnapshot) => {
      try {
        const articles = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Article[];
        setArticles(articles);
        setLoading(prev => ({ ...prev, articles: false }));
      } catch (err) {
        console.error("Error loading articles:", err);
        setLoading(prev => ({ ...prev, articles: false }));
      }
    });
    return () => unsubscribe();
  }, []);

  // Obter localização do usuário
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const location = await requestLocationPermission();
        
        if (!location) {
          setError('Permissão de localização não concedida');
          setLoading(prev => ({ ...prev, locations: false, weather: false }));
          return;
        }
  
        const coords = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        };
        
        setUserLocation(coords);
        setLoading(prev => ({ ...prev, locations: false }));
  
      } catch (err) {
        console.error("Error getting location:", err);
        setError('Não foi possível obter a localização');
        setLoading(prev => ({ ...prev, locations: false, weather: false }));
      }
    };
  
    fetchLocation();
  }, []);

  // Carregar e filtrar localizações
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'locations'), (querySnapshot) => {
      try {
        const locations = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name,
            description: data.description,
            images: data.images || [],
            coordinates: data.coordinates
          } as LocationData;
        });
  
        setAllLocations(locations);
  
        if (userLocation) {
          const locationsWithDistance = locations.map(loc => {
            // Verifique se as coordenadas existem
            if (!loc.coordinates) {
              console.log(loc);
              console.warn(`Local ${loc.id} não tem coordenadas definidas`);
              return { ...loc, distance: Infinity };
            }
            
            return {
              ...loc,
              distance: calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                loc.coordinates.latitude,
                loc.coordinates.longitude
              )
            };
          });
  
          const nearby = locationsWithDistance
            .filter(loc => loc.distance <= 10) // Dentro de 10km
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 5); // Limitar a 5 resultados
  
          setNearbyLocations(nearby);
        }
  
      } catch (err) {
        console.error("Error loading locations:", err);
      }
    });
  
    return () => unsubscribe();
  }, [userLocation]); // Adicione userLocation como dependência
  

  // Componente de Card de Localização
  const LocationCard = ({ location }: { location: LocationData }) => (
    <Link
      key={location.id}
      href={{
        pathname: '/',
        params: {id: location.id,},
      }}
      asChild
      >
      <TouchableOpacity style={styles.locationCard}>
        <Image 
          source={{ uri: location.images[0] || 'https://via.placeholder.com/150' }} 
          style={styles.locationImage} 
        />
        <View style={styles.locationInfo}>
          <Text style={styles.locationName}>{location.name}</Text>
          <Text style={styles.locationDescription}>
            {location.description.substring(0, 100)}...
          </Text>
          {'distance' in location && (
            <Text style={styles.distanceText}>
              {location.distance.toFixed(1)} km de distância
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </Link>
  );

  const SmallLocaitonCard = ({location}: {location:LocationData})=>(
      <Link
        key={location.id}
        href={{
          pathname: '/',
          params: {id: location.id,},
        }}
        asChild
      >
        <TouchableOpacity style={styles.smalllocationCard}>
          <Image source={{ uri: location.images[0] }} style={styles.smalllocationImage} />
          <View style={styles.smalllocationInfo}>
            <Text style={styles.smalllocationName}>{location.name}</Text>
            <Text style={styles.smalllocationDescription}>{location.description}</Text>
          </View>
        </TouchableOpacity>
      </Link>
  );

  // Componente de Card de Artigo
  const ArticleCard = ({ article }: { article: Article }) => (
    <Link
      key={article.id}
      href={{
        pathname: '/article',
        params: {
          id: article.id,
          title: article.title,
          summary: article.summary,
          content: article.content,
          author: article.author,
          date: article.date,
          image: article.image,
        },
      }} asChild>
      <TouchableOpacity style={styles.articleCard}>
        <Image 
          source={{ uri: article.image || 'https://via.placeholder.com/150' }} 
          style={styles.articleImage} 
        />
        <View style={styles.articleInfo}>
          <Text style={styles.articleTitle}>{article.title}</Text>
          <Text style={styles.articleSummary}>
            {article.summary.substring(0, 100)}...
          </Text>
          <Text style={styles.articleMeta}>
            Por {article.author} • {new Date(article.date).toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>
    </Link>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Eco CSM</Text>
        <Text style={styles.headerSubtitle}>
          Ajude o ambiente e não polua
        </Text>
      </View>

      {/* Seção de Locais Próximos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🌍 Locais Próximos</Text>
        {loading.locations ? (
          <ActivityIndicator size="large" color="#4A90E2" />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : nearbyLocations.length > 0 ? (
          nearbyLocations.map(location => (
            <LocationCard key={location.id} location={location} />
          ))
        ) : (
          <Text style={styles.infoText}>Nenhum local poluído próximo encontrado</Text>
        )}
      </View>

      {/* Seção de Todos os Locais */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🗺️ Todos os Locais Registados</Text>
        {loading.locations ? (
          <ActivityIndicator size="large" color="#4A90E2" />
        ) : allLocations.length > 0 ? (
          allLocations.map(location => (
            <SmallLocaitonCard key={location.id} location={location} />
          ))
        ) : (
          <Text style={styles.infoText}>Nenhum local registado</Text>
        )}
      </View>

      {/* Seção de Artigos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📰 Artigos sobre Poluição</Text>
        {loading.articles ? (
          <ActivityIndicator size="large" color="#4A90E2" />
        ) : pollutionArticles.length > 0 ? (
          pollutionArticles.map(article => (
            <ArticleCard key={article.id} article={article} />
          ))
        ) : (
          <Text style={styles.infoText}>Nenhum artigo disponível</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    padding: 20,
    paddingTop: 40,
  },
  header: {
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 15,
  },
  locationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  locationImage: {
    width: '100%',
    height: 150,
  },
  locationInfo: {
    padding: 15,
  },
  locationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  locationDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  smalllocationCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  smalllocationImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
  },
  smalllocationInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  smalllocationName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  smalllocationDescription: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  distanceText: {
    fontSize: 13,
    color: '#4A90E2',
    fontWeight: '500',
  },
  articleCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  articleImage: {
    width: '100%',
    height: 150,
  },
  articleInfo: {
    padding: 15,
  },
  articleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  articleSummary: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  articleMeta: {
    fontSize: 12,
    color: '#95a5a6',
    fontStyle: 'italic',
  },
  errorText: {
    color: '#e74c3c',
    textAlign: 'center',
    padding: 15,
    backgroundColor: '#fadbd8',
    borderRadius: 8,
  },
  infoText: {
    color: '#7f8c8d',
    textAlign: 'center',
    padding: 15,
    backgroundColor: '#f0f3f4',
    borderRadius: 8,
  },
  footer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  footerText: {
    textAlign: 'center',
    color: '#95a5a6',
    fontSize: 12,
  },
});