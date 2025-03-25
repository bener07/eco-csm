import React, { useState } from "react";
import { View, Text, TextInput, Button, Switch, StyleSheet, Alert } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
    const { isLoaded, user } = useUser();
    const { signOut } = useAuth();

    // Estados para gerenciar as preferências
    const [firstName, setFirstName] = useState(user?.firstName || "");
    const [lastName, setLastName] = useState(user?.lastName || "");
    const [email, setEmail] = useState(user?.emailAddresses[0]?.emailAddress || "");
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [darkModeEnabled, setDarkModeEnabled] = useState(false);

    if(!isLoaded){
        console.log('Not loaded')
        return null;
    }

    // Função para atualizar o perfil
    const handleUpdateProfile = async () => {
        try {
            await user.update({
                firstName: 'John',
                lastName: 'Doe',
            });
            Alert.alert("Sucesso", "Perfil atualizado com sucesso!");
        } catch (error) {
            Alert.alert("Erro", "Falha ao atualizar o perfil: " + error.message);
        }
    };

    // Função para deslogar
    const handleSignOut = () => {
        signOut();
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <Text style={styles.title}>Definições</Text>

                {/* Seção do Perfil */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Perfil</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Nome"
                        value={firstName}
                        onChangeText={setFirstName}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Sobrenome"
                        value={lastName}
                        onChangeText={setLastName}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        value={email}
                        editable={false} // Email não pode ser editado
                    />
                    <Button title="Atualizar Perfil" onPress={handleUpdateProfile} />
                </View>

                {/* Seção de Preferências */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Preferências</Text>
                    <View style={styles.preferenceItem}>
                        <Text>Receber notificações</Text>
                        <Switch
                            value={notificationsEnabled}
                            onValueChange={setNotificationsEnabled}
                        />
                    </View>
                    <View style={styles.preferenceItem}>
                        <Text>Modo Escuro</Text>
                        <Switch
                            value={darkModeEnabled}
                            onValueChange={setDarkModeEnabled}
                        />
                    </View>
                </View>

                {/* Botão de Logout */}
                <View style={styles.section}>
                    <Button title="Sair" onPress={handleSignOut} color="red" />
                </View>
                <View style={{ height: 50 }}></View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: "#f5f5f5",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
    },
    section: {
        marginBottom: 20,
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 4,
        padding: 10,
        marginBottom: 10,
    },
    preferenceItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
});