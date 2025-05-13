// src/Components/RegisterItemScreen.js
import React, { useContext } from "react"; // Importa useContext
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext"; // Importa AuthContext

export function RegisterItemScreen() {
  const navigation = useNavigation();
  const { signIn } = useContext(AuthContext); // Obtén signIn del contexto

  const handleRegisterItem = async () => {
    // *** Lógica para registrar el artículo (simulada) ***
    console.log("Simulando registro de artículo...");
    // Aquí iría tu llamada a la API para guardar el artículo.
    // Una vez que el artículo se registra exitosamente:

    // *** LLamar a signIn para pasar al flujo principal ***
    await signIn("user-token-after-item-reg"); // Usa un token real de tu API

    // Después de signIn, App.js cambia la navegación automáticamente
  };

  const handleSkip = async () => {
    // *** Lógica para saltar el registro de artículo ***
    console.log("Saltando registro de artículo...");

    // *** LLamar a signIn para pasar al flujo principal ***
    await signIn("user-token-after-skip"); // Usa un token real de tu API

    // Después de signIn, App.js cambia la navegación automáticamente
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registra tu Primer Artículo</Text>
      <Text style={styles.subtitle}>Puedes añadir uno ahora o más tarde.</Text>

      {/* Aquí iría el formulario/UI para añadir el artículo */}
      <View style={styles.itemFormPlaceholder}>
        <Text style={{ color: "#888" }}>
          Formulario para añadir artículo...
        </Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleRegisterItem}>
        <Text style={styles.buttonText}>Registrar Artículo</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipButtonText}>Saltar por ahora</Text>
      </TouchableOpacity>
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
  itemFormPlaceholder: {
    height: 150, // Placeholder visual para el formulario
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  button: {
    backgroundColor: "#000",
    padding: 15,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  skipButton: {
    marginTop: 20,
    alignItems: "center",
  },
  skipButtonText: {
    color: "#007BFF",
    fontSize: 16,
  },
});
