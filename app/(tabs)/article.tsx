import { useLocalSearchParams } from 'expo-router';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ArticleDetails() {
  const { id, title, content, author, date, image } = useLocalSearchParams();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.container}>
        {/* Imagem do Artigo */}
        <Image source={{ uri: image || 'https://t3.ftcdn.net/jpg/03/45/05/92/360_F_345059232_CPieT8RIWOUk4JqBkkWkIETYAkmz2b75.jpg' }} style={styles.image} />

        {/* Título do Artigo */}
        <Text style={styles.title}>{title}</Text>

        {/* Informações do Artigo (Autor e Data) */}
        <View style={styles.metaContainer}>
          <Text style={styles.metaText}>Por {author}</Text>
          <Text style={styles.metaText}>Publicado a {date}</Text>
        </View>

        {/* Conteúdo do Artigo */}
        <Text style={styles.content}>{content}</Text>
        <View style={{height: 50}}></View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  image: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    marginBottom: 16,
    resizeMode: 'cover',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  metaContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metaText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
  content: {
    fontSize: 16,
    color: '#2c3e50',
    lineHeight: 24,
  },
});