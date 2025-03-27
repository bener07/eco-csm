import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Link } from 'expo-router';
import { db } from '@/firebaseConfig';
import { collection, onSnapshot } from 'firebase/firestore';
import { Article, LocationData } from '@/constants/dataTypes';
import { requestLocationPermission } from '@/utils/permissions';
import WeatherInfo from '@/components/weatherChart';
import { useAuth } from '@clerk/clerk-expo';
import getCurrentWeather from '@/utils/weather';



interface Location {
  latitude: number;
  longitude: number;
}

interface WeatherChartData {
  labels: string[];
  data: number[];
}

export default function HomeScreen() {
  const [pollutionArticles, setArticles] = useState<Article[]>([]);
  const [weatherData, setWeatherData] = useState<WeatherChartData|null>(null);
  const [location, setLocation] = useState<Location|null>(null);
  const [pollutedLocations, setLocations] = useState<LocationData[]>([]); // Dados de exemplo para locais poluídos
  const screenWidth = Dimensions.get('window').width;
  const { isSignedIn } = useAuth();
  // Dados de exemplo para locais poluídos


  // Dados de exemplo para artigos sobre poluição
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'artigos'), (querySnapshot) => {
      try {
        const articlesData = querySnapshot.docs.map((doc) => ({
          id: doc.id, // Firestore retorna o ID como string
          title: doc.data().title,
          content: doc.data().content,
          summary: doc.data().summary,
          author: doc.data().author,
          date: doc.data().date,
          image: doc.data().image,
        })) as unknown as Article[]; // Conversão de tipo segura
        setArticles(articlesData);
      } catch (error) {
        console.error('Erro ao carregar artigos:', error);
      }
    });
  
    // Retorna uma função para parar de escutar as atualizações quando o componente for desmontado
    return () => unsubscribe();
  }, []);

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

  useEffect(() => {
    requestLocationPermission(setLocation);
  }, []);

  useEffect(()=>{
    if(location !== null) {
      // Dados para o gráfico de progresso
      getCurrentWeather(location.coords.latitude, location.coords.longitude, setWeatherData);
    };
  }, [location]);

  return (
    <ScrollView style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Eco CSM</Text>
        <Text style={styles.headerSubtitle}>Informações sobre poluição e locais afetados</Text>
      </View>

      {/* Gráfico de Poluição */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Metereologia na sua zona</Text>
        {weatherData && (
          <>
            <WeatherInfo
              data={weatherData}
              width={screenWidth - 20}
              height={200}
            />
          </>
        )
        }
      </View>

      {/* Lista de Locais Poluídos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Locais Poluídos</Text>
        {pollutedLocations.map((location) => (
          <Link
            key={location.id}
            href={{
              pathname: '/',
              params: {id: location.id,},
            }}
            asChild
          >
            <TouchableOpacity style={styles.locationCard}>
              <Image source={{ uri: location.images[0] }} style={styles.locationImage} />
              <View style={styles.locationInfo}>
                <Text style={styles.locationName}>{location.name}</Text>
                <Text style={styles.locationDescription}>{location.description}</Text>
              </View>
            </TouchableOpacity>
          </Link>
        ))}
      </View>

      {/* Artigos sobre Poluição */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Artigos sobre Poluição</Text>
        {pollutionArticles.map((article) => (
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
            }}
            asChild
          >
            <TouchableOpacity style={styles.articleCard}>
              <Image source={{ uri: article.image }} style={styles.articleImage} />
              <View style={styles.articleInfo}>
                <Text style={styles.articleTitle}>{article.title}</Text>
                <Text style={styles.articleSummary}>{article.summary}</Text>
              </View>
            </TouchableOpacity>
          </Link>
        ))}
      </View>
      <View style={{height: 50}}></View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
    marginTop: 30
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 10,
  },
  map: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  locationCard: {
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
  locationImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
  },
  locationInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  locationName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  locationDescription: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  articleCard: {
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
  articleImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
  },
  articleInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  articleTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 5,
  },
  articleSummary: {
    fontSize: 14,
    color: '#7f8c8d',
  },
});