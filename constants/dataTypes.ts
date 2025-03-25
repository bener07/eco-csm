export interface LocationData {
    id: number;
    name: string;
    description: string;
    latitude: number;
    longitude: number;
    color: string;
    icon: string;
    images: string[];
    address: string;
    aditional: string | undefined;
  }

export interface Article {
  id: number;
  title: string;
  content: string;
  summary: string;
  author: string;
  date: string;
  image: string;
}

export interface Weather{
  temperatura: number, // Temperatura em Celsius
  humidade: number, // Umidade em %
  condicao: string, // Condição climática (ex.: "céu limpo")
  pressao: number, // Pressão atmosférica em hPa
  vento: number,
  overview: string,
}