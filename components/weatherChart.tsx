import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

interface WeatherData {
  name: string;
  sys: {
    country: string;
  };
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  weather: {
    description: string;
    icon: string;
  }[];
  wind: {
    speed: number;
    deg: number;
  };
  visibility: number;
  clouds: {
    all: number;
  };
}

interface WeatherInfoProps {
  data: WeatherData;
}

const WeatherInfo: React.FC<WeatherInfoProps> = ({ data }) => {
  // URL do ícone das condições climáticas
  const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

  return (
    <View style={styles.container}>
      {/* Localização */}
      <Text style={styles.location}>
        {data.name}, {data.sys.country}
      </Text>

      {/* Temperatura e Condições Climáticas */}
      <View style={styles.weatherMain}>
        <Image source={{ uri: iconUrl }} style={styles.weatherIcon} />
        <Text style={styles.temperature}>{data.main.temp}°C</Text>
      </View>
      <Text style={styles.condition}>
        {data.weather[0].description}
      </Text>

      {/* Detalhes Adicionais */}
      <View style={styles.details}>
        <Text style={styles.detailText}>
          Sensação: {data.main.feels_like}°C
        </Text>
        <Text style={styles.detailText}>
          Umidade: {data.main.humidity}%
        </Text>
        <Text style={styles.detailText}>
          Pressão: {data.main.pressure} hPa
        </Text>
        <Text style={styles.detailText}>
          Vento: {data.wind.speed} m/s, {data.wind.deg}°
        </Text>
        <Text style={styles.detailText}>
          Visibilidade: {data.visibility / 1000} km
        </Text>
        <Text style={styles.detailText}>
          Nuvens: {data.clouds.all}%
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  location: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
    textAlign: 'center',
  },
  weatherMain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  weatherIcon: {
    width: 50,
    height: 50,
    marginRight: 8,
  },
  temperature: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  condition: {
    fontSize: 18,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 16,
  },
  details: {
    marginTop: 8,
  },
  detailText: {
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 4,
  },
});

export default WeatherInfo;