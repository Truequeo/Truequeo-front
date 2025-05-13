// src/Components/RegistrationScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native"; // Importa TextInput, TouchableOpacity, Alert
import { useNavigation } from "@react-navigation/native"; // Importa useNavigation

export function RegistrationScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [celular, setCelular] = useState(""); // Asumiendo que el celular se recoge aquí también
  const navigation = useNavigation(); // Usa el hook de navegación

  const handleRegistration = () => {
    // Validaciones básicas (puedes hacerlas más robustas)
    if (!email || !password || !celular) {
      Alert.alert("Campos incompletos", "Por favor llena todos los campos.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      Alert.alert("Email inválido", "Por favor ingresa un email válido.");
      return;
    }
    if (!/^\d{8}$/.test(celular)) {
      Alert.alert("Número inválido", "El número debe tener 8 dígitos.");
      return;
    }

    // *** Lógica de Registro (simulada por ahora) ***
    console.log("Intentando registrar con:", { email, password, celular });

    // Aquí iría la llamada a tu API de registro
    // Si el registro es exitoso y la API envía el código de verificación al celular:

    // *** Navegar a la pantalla/estado de Verificación de Código ***
    // Como la verificación está actualmente en el componente Login,
    // navegaremos DE NUEVO a la pantalla 'Login', pero deberemos indicarle
    // que pase directamente a la fase de verificación.
    // Esto es una simplificación temporal. Idealmente, PhoneVerification sería una pantalla separada.

    // Una forma simple de simular el paso a la verificación en Login:
    // Pasar un parámetro a la pantalla Login
    navigation.navigate("Login", {
      needsPhoneVerification: true,
      phoneNumber: celular,
    });

    // Mostrar un mensaje al usuario
    Alert.alert(
      "Registro casi listo",
      "Hemos enviado un código de verificación a tu número de celular."
    );
  };

  // Lógica para registro con Google (similar a la de Login, pero con flujo de nuevo usuario)
  const iniciarGoogleRegistro = () => {
    Alert.alert(
      "Próximamente",
      "Registro con Google estará disponible pronto."
    );
    // Cuando implementes esto:
    // 1. Autenticación con Google.
    // 2. Verificar si el usuario de Google ya existe en tu DB.
    // 3. Si no existe: Navegar a una pantalla para recolectar el número de celular
    //    y luego proceder con la verificación del teléfono y el perfil.
    // 4. Si existe pero necesita verificar teléfono: Navegar a la verificación.
    // 5. Si existe y está completo: Llamar a signIn() directamente.
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear Nueva Cuenta</Text>

      <TextInput
        style={styles.input}
        onChangeText={setEmail}
        value={email}
        placeholder="Email"
        placeholderTextColor="#888"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        onChangeText={setPassword}
        value={password}
        placeholder="Contraseña"
        placeholderTextColor="#888"
        secureTextEntry
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        onChangeText={setCelular}
        value={celular}
        placeholder="Número de Celular (8 dígitos)"
        placeholderTextColor="#888"
        keyboardType="phone-pad"
      />

      <TouchableOpacity style={styles.button} onPress={handleRegistration}>
        <Text style={styles.buttonText}>Registrarse</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.googleButton}
        onPress={iniciarGoogleRegistro}
      >
        <Text style={styles.buttonText}>Registrarse con Google</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.loginLink}
        onPress={() => navigation.navigate("Login")} // Enlace para volver a Login
      >
        <Text style={styles.loginLinkText}>
          ¿Ya tienes cuenta? Inicia sesión
        </Text>
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
    marginBottom: 30,
    textAlign: "center",
  },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 15, // Ajusta el margen
    paddingHorizontal: 10,
    borderRadius: 5,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#000",
    padding: 15,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 10, // Ajusta el margen
  },
  googleButton: {
    backgroundColor: "#4285F4", // Color de Google
    padding: 15,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 15,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  loginLink: {
    marginTop: 20,
    alignItems: "center",
  },
  loginLinkText: {
    color: "#007BFF", // Color de enlace
    fontSize: 16,
  },
});
