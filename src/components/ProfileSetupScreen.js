// src/Components/ProfileSetupScreen.js
import React, { useState } from "react"; // Importa useState
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native"; // Importa TextInput, TouchableOpacity, Alert
import { useNavigation } from "@react-navigation/native"; // Importa useNavigation

// Importa AuthContext si decides llamar a signIn directamente desde aquí
// import { AuthContext } from '../context/AuthContext';

export function ProfileSetupScreen() {
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  // Añade más estados para otros campos del perfil si es necesario

  const navigation = useNavigation();
  // const { signIn } = useContext(AuthContext); // Si llamas a signIn desde aquí

  const handleSaveProfile = () => {
    // Validaciones básicas
    if (!name || !city) {
      Alert.alert(
        "Campos incompletos",
        "Por favor ingresa tu nombre y ciudad."
      );
      return;
    }

    // *** Lógica para guardar el perfil (simulada) ***
    console.log("Guardando perfil:", { name, city });
    // Aquí iría tu llamada a la API para guardar los datos del perfil.

    // *** Navegar al siguiente paso: Registrar Artículo ***
    // Una vez que el perfil se guarda exitosamente:
    navigation.navigate("RegisterItem");

    // Si el registro de artículo no fuera obligatorio y quisieras
    // permitirle al usuario saltar *desde aquí*, podrías tener
    // un botón "Saltar" que llame a signIn()

    // Mostrar un mensaje (opcional)
    Alert.alert("Perfil Guardado", "Tu perfil ha sido actualizado.");
  };

  // Si quieres añadir una opción para saltar DENTRO de esta pantalla
  /*
   const handleSkipProfileSetup = async () => {
       // Aquí iría la lógica si hay algo que hacer antes de saltar
       await signIn('user-token-after-profile-skip'); // Llama a signIn si saltas
   };
   */

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Completa tu Perfil</Text>
      <Text style={styles.subtitle}>
        Esta información ayudará a otros usuarios.
      </Text>

      <TextInput
        style={styles.input}
        onChangeText={setName}
        value={name}
        placeholder="Nombre Completo"
        placeholderTextColor="#888"
      />

      <TextInput
        style={styles.input}
        onChangeText={setCity}
        value={city}
        placeholder="Ciudad"
        placeholderTextColor="#888"
      />

      {/* Añade más campos de perfil aquí */}

      <TouchableOpacity
        style={styles.button}
        onPress={handleSaveProfile} // Llama a la función para guardar y navegar
      >
        <Text style={styles.buttonText}>Guardar Perfil y Continuar</Text>
      </TouchableOpacity>

      {/* Si añadiste la opción de saltar aquí, pon el botón correspondiente */}
      {/*
       <TouchableOpacity style={styles.skipButton} onPress={handleSkipProfileSetup}>
          <Text style={styles.skipButtonText}>Saltar configuración de perfil</Text>
       </TouchableOpacity>
       */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
    textAlign: "center",
  },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 5,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#000",
    padding: 15,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 20, // Ajusta el margen
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  skipButton: {
    // Estilo si añades un botón de saltar aquí
    marginTop: 20,
    alignItems: "center",
  },
  skipButtonText: {
    // Estilo si añades un botón de saltar aquí
    color: "#007BFF",
    fontSize: 16,
  },
});
