import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableHighlight,
  Text,
  StyleSheet,
  BackHandler,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import {
  ALERT_TYPE,
  Dialog,
  AlertNotificationRoot,
} from "react-native-alert-notification";

import { sendVerificationCode, verifyLoginCode } from "../services/apiService";

export default function Login() {
  const [celular, setCelular] = useState("");
  const [codigo, setCodigo] = useState("");
  const [isPressed, setIsPressed] = useState(false);
  const [isPressedG, setIsPressedG] = useState(false);
  const [mostrandoInputCelular, setMostrandoInputCelular] = useState(true);
  const navigation = useNavigation();

  useFocusEffect(
    React.useCallback(() => {
      const backAction = () => {
        if (!mostrandoInputCelular) {
          setMostrandoInputCelular(true);
          setCodigo("");
          return true;
        }
        return false;
      };
      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        backAction
      );
      return () => backHandler.remove();
    }, [mostrandoInputCelular])
  );

  const handleEnviarCodigo = async () => {
    if (!celular.trim()) {
      return Dialog.show({
        type: ALERT_TYPE.WARNING,
        title: "Campo vacío",
        textBody: "Por favor ingresa un número de celular.",
        button: "Aceptar",
      });
    }
    /*if (!/^\d{6}$/.test(celular)) {
      return Dialog.show({
        type: ALERT_TYPE.WARNING,
        title: "Número inválido",
        textBody: "El número debe tener 8 dígitos.",
        button: "Aceptar",
      });
    }
*/
    try {
      await sendVerificationCode(celular);
      setMostrandoInputCelular(false);
      Dialog.show({
        type: ALERT_TYPE.SUCCESS,
        title: "Código Enviado",
        textBody: "Se envió correctamente al número.",
        button: "Aceptar",
      });
    } catch (error) {
      const errorMsg =
        error.response?.data?.error || "Error desconocido al enviar el código.";
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: "Error",
        textBody: errorMsg,
        button: "Aceptar",
      });
      console.error("Error al enviar código:", error);
    }
  };

  const handleVerificarCodigo = async () => {
    if (!codigo.trim()) {
      return Dialog.show({
        type: ALERT_TYPE.WARNING,
        title: "Campo vacío",
        textBody: "Por favor ingresa el código.",
        button: "Aceptar",
      });
    }

    try {
      const { usuario, token } = await verifyLoginCode(celular, codigo);
      Dialog.show({
        type: ALERT_TYPE.SUCCESS,
        title: "Código Verificado",
        textBody: "Código correcto.",
        button: "Continuar",
        onPressButton: () => {
          Dialog.hide();
          navigation.navigate("Home", { usuario, token });
        },
      });
      setCodigo("");
    } catch (error) {
      const errorMsg =
        error.response?.data?.error || "Error al verificar el código.";
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: "Error",
        textBody: errorMsg,
        button: "Aceptar",
      });
      console.error("Error en verificación:", error);
    }
  };

  const iniciarGoogle = () => {
    Dialog.show({
      type: ALERT_TYPE.DANGER,
      title: "Error",
      textBody:
        "La función de inicio de sesión con Google estará disponible próximamente.",
      button: "Aceptar",
    });
  };

  return (
    <AlertNotificationRoot>
      {mostrandoInputCelular ? (
        <View style={styles.container}>
          <StatusBar style="light" />
          <TextInput
            style={styles.input}
            onChangeText={setCelular}
            value={celular}
            placeholder="Ingresa tu número de celular"
            placeholderTextColor="#888"
            keyboardType="phone-pad"
            maxLength={8}
          />
          <TouchableHighlight
            underlayColor="#6a0dad"
            onShowUnderlay={() => setIsPressed(true)}
            onHideUnderlay={() => setIsPressed(false)}
            onPress={handleEnviarCodigo}
            style={styles.botonInicio}
          >
            <Text
              style={[
                styles.textoBoton,
                { color: isPressed ? "#fff" : "#fff" },
              ]}
            >
              Enviar código
            </Text>
          </TouchableHighlight>
          <TouchableHighlight
            underlayColor="#6a0dad"
            onShowUnderlay={() => setIsPressedG(true)}
            onHideUnderlay={() => setIsPressedG(false)}
            onPress={iniciarGoogle}
            style={styles.botonInicioG}
          >
            <Text
              style={[
                styles.textoBoton,
                { color: isPressedG ? "#fff" : "#fff" },
              ]}
            >
              Iniciar con Google
            </Text>
          </TouchableHighlight>
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>
              ¿No tienes cuenta?{" "}
              <Text
                style={styles.registerLink}
                onPress={() => navigation.navigate("Register")}
              >
                Regístrate
              </Text>
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.container}>
          <TextInput
            style={styles.input}
            onChangeText={setCodigo}
            value={codigo}
            placeholder="Ingresa el código de verificación"
            placeholderTextColor="#888"
            keyboardType="numeric"
            maxLength={6}
          />
          <TouchableHighlight
            underlayColor="#6a0dad"
            onShowUnderlay={() => setIsPressed(true)}
            onHideUnderlay={() => setIsPressed(false)}
            onPress={handleVerificarCodigo}
            style={styles.botonInicio}
          >
            <Text
              style={[
                styles.textoBoton,
                { color: isPressed ? "#fff" : "#fff" },
              ]}
            >
              Verificar código
            </Text>
          </TouchableHighlight>
        </View>
      )}
    </AlertNotificationRoot>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: "#f0f2f5", // Fondo más suave
  },
  input: {
    height: 50,
    borderColor: "#d1d5db", // Borde más claro
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 15, // Más padding
    borderRadius: 10, // Bordes más redondeados
    fontSize: 16,
    color: "#333",
    backgroundColor: "#fff", // Fondo blanco
  },
  botonInicio: {
    backgroundColor: "#6a0dad", // Un púrpura vibrante
    padding: 15,
    borderRadius: 30, // Más redondeado
    borderWidth: 0, // Quitamos el borde para un look más moderno
    elevation: 3, // Sombra para Android
    shadowColor: "#000", // Sombra para iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  botonInicioG: {
    backgroundColor: "#4285F4", // Azul de Google
    padding: 15,
    borderRadius: 30,
    borderWidth: 0,
    marginTop: 15, // Espacio entre botones
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  textoBoton: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 18, // Texto más grande
  },
  registerContainer: {
    marginTop: 30,
    alignItems: "center",
  },
  registerText: {
    fontSize: 15, // Un poco más grande
    color: "#6b7280", // Color de texto más suave
  },
  registerLink: {
    color: "#6a0dad", // Mismo púrpura que el botón principal
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});
