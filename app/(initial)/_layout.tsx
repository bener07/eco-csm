import Icon from 'react-native-vector-icons/MaterialIcons';
import { Tabs, router } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';

export default function PublicLayout() {
  const { isSignedIn } = useAuth();

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 0,
          borderBottomWidth: 1,
          borderColor: '#fff',
          shadowColor: 'rgba(0, 0, 0, 0.08)',
          shadowOffset: { width: 1, height: 2 },
          shadowOpacity: 1,
          shadowRadius: 4,
          elevation: 10,
          paddingHorizontal: 10,
          paddingVertical: 5,
          position: 'absolute',
          padding: 10,
          height: 60,
        },
        tabBarActiveTintColor: '#333',
        tabBarInactiveTintColor: '#999',
        tabBarLabelStyle: {
          fontSize: 12,
        },
        tabBarIconStyle: {
          marginBottom: 0,
        },
        headerShown: false,
      }}
    >
      {/* Tab "Início" */}
      <Tabs.Screen
        name="home"
        options={{
          title: "Início",
          tabBarIcon: ({ size, color }) => <Icon name="house" size={size} color={color} />,
        }}
      />

      {/* Tab "Mapa" */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Mapa",
          tabBarIcon: ({ size, color }) => <Icon name="map" size={size} color={color} />,
        }}
      />

      {/* Tab "Perfil" ou "Log In" (condicional) */}
      <Tabs.Screen
        name="profile" // Rota "placeholder" dentro do grupo (public)
        options={{
          title: isSignedIn ? "Perfil" : "Log In",
          tabBarIcon: ({ size, color }) => (
            <Icon name={isSignedIn ? "person" : "login"} size={size} color={color} />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            if (!isSignedIn) {
                e.preventDefault(); // Impede a navegação para a tab
                router.push('/(auth)/sign-in'); // Redireciona para a tela de login
            } else {
                console.log('User logged in');
                // Navegação para a tela de perfil já é tratada automaticamente
            }
          },
        }}
      />
    </Tabs>
  );
}