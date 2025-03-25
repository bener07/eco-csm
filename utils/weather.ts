const getCurrentWeather = async (latitude: number, longitude: number, setWeather: any) => {
    const API_KEY = 'fd14d01a8b79d4e99f7e28c7321fb346'; // Substitua pela sua chave do OpenWeatherMap
  
    const formatWeatherDataForDisplay = (data: any) => {
        return {
          name: data.name, // Nome da cidade
          sys: {
            country: data.sys.country, // País
          },
          main: {
            temp: data.main.temp, // Temperatura em °C
            feels_like: data.main.feels_like, // Sensação térmica em °C
            humidity: data.main.humidity, // Umidade em %
            pressure: data.main.pressure, // Pressão em hPa
          },
          weather: [
            {
              description: data.weather[0].description, // Descrição das condições climáticas
              icon: data.weather[0].icon, // Ícone das condições climáticas
            },
          ],
          wind: {
            speed: data.wind.speed, // Velocidade do vento em m/s
            deg: data.wind.deg, // Direção do vento em graus
          },
          visibility: data.visibility, // Visibilidade em metros
          clouds: {
            all: data.clouds.all, // Cobertura de nuvens em %
          },
        };
      };

    try {
      // Faz a requisição à API do OpenWeatherMap
      console.log(latitude, longitude);
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&lang=pt`
      );
      const data = await response.json();
  
      // Verifica se a requisição foi bem-sucedida
      if (data.cod === 200) {
        setWeather(formatWeatherDataForDisplay(data));
      } else {
        throw new Error('Erro ao buscar dados atmosféricos.');
      }
    } catch (error) {
      throw new Error('Erro na requisição: ' + error.message);
    }
  };
  
  export default getCurrentWeather;