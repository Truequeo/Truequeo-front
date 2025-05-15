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
import axios from "axios";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import {
  ALERT_TYPE,
  Dialog,
  AlertNotificationRoot,
} from "react-native-alert-notification";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { urlBackend } from "./VariablesEntorno";

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

  const enviarCodigo = () => {
    if (!celular.trim()) {
      return Dialog.show({
        type: ALERT_TYPE.WARNING,
        title: "Campo vacío",
        textBody: "Por favor ingresa un número de celular",
        button: "Aceptar",
      });
    }
    if (!/^\d{8}$/.test(celular)) {
      return Dialog.show({
        type: ALERT_TYPE.WARNING,
        title: "Número inválido",
        textBody: "El número debe tener 8 dígitos",
        button: "Aceptar",
      });
    }
    axios
      .post(urlBackend`auth/enviarCodigo/+591${celular}`)
      .then(() => {
        setMostrandoInputCelular(false);
        Dialog.show({
          type: ALERT_TYPE.SUCCESS,
          title: "Código Enviado",
          textBody: "Se envió correctamente al número",
          button: "Aceptar",
        });
      })
      .catch((error) => {
        const errorMsg =
          error.response?.data?.error ||
          "Error desconocido al enviar el código";
        Dialog.show({
          type: ALERT_TYPE.DANGER,
          title: "Error",
          textBody: errorMsg,
          button: "Aceptar",
        });
        console.error("Error al enviar código:", error);
      });
  };

  const verificarCodigo = () => {
    if (!codigo.trim()) {
      return Dialog.show({
        type: ALERT_TYPE.WARNING,
        title: "Campo vacío",
        textBody: "Por favor ingresa el código",
        button: "Aceptar",
      });
    }
    axios
      .post(urlBackend + "auth/verificarCodigo", {
        phone: `+591${celular}`,
        code: codigo,
      })
      .then(async (response) => {
        const { usuario, token } = response.data;
        if (!usuario) {
          return Dialog.show({
            type: ALERT_TYPE.DANGER,
            title: "Error",
            textBody: "No se encontró el usuario",
            button: "Aceptar",
          });
        }
        try {
          await AsyncStorage.setItem("token", token);
          await AsyncStorage.setItem("codUsuario", usuario.codUsuario);
        } catch (err) {
          console.error("Error guardando token:", err);
        }
        navigation.navigate("Home", { usuario, token });
        Dialog.show({
          type: ALERT_TYPE.SUCCESS,
          title: "Código Verificado",
          textBody: "Código correcto",
          button: "Continuar",
        });
        setCodigo("");
      })
      .catch((error) => {
        Dialog.show({
          type: ALERT_TYPE.DANGER,
          title: "Error",
          textBody:
            error.response?.data?.error || "Error al verificar el código",
          button: "Aceptar",
        });
        console.error("Error en verificación:", error);
      });
  };

  const iniciarGoogle = () => {
    Dialog.show({
      type: ALERT_TYPE.DANGER,
      title: "Error",
      textBody: "Próximamente",
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
            placeholder="Ingresa tu número"
            placeholderTextColor="#888"
            keyboardType="phone-pad"
          />
          <TouchableHighlight
            underlayColor="#fff"
            onShowUnderlay={() => setIsPressed(true)}
            onHideUnderlay={() => setIsPressed(false)}
            onPress={enviarCodigo}
            style={styles.botonInicio}
          >
            <Text
              style={[
                styles.textoBoton,
                { color: isPressed ? "#000" : "#fff" },
              ]}
            >
              Iniciar sesión
            </Text>
          </TouchableHighlight>
          <TouchableHighlight
            underlayColor="#fff"
            onShowUnderlay={() => setIsPressedG(true)}
            onHideUnderlay={() => setIsPressedG(false)}
            onPress={iniciarGoogle}
            style={styles.botonInicioG}
          >
            <Text
              style={[
                styles.textoBoton,
                { color: isPressedG ? "#000" : "#fff" },
              ]}
            >
              Inicio con Google
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
            placeholder="Ingresa el código"
            placeholderTextColor="#888"
            keyboardType="numeric"
          />
          <TouchableHighlight
            underlayColor="#fff"
            onShowUnderlay={() => setIsPressed(true)}
            onHideUnderlay={() => setIsPressed(false)}
            onPress={verificarCodigo}
            style={styles.botonInicio}
          >
            <Text
              style={[
                styles.textoBoton,
                { color: isPressed ? "#000" : "#fff" },
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
    backgroundColor: "#fff",
  },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  botonInicio: {
    backgroundColor: "#000",
    padding: 15,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#000",
  },
  botonInicioG: {
    backgroundColor: "#000",
    padding: 15,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#000",
    marginTop: 20,
  },
  textoBoton: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
  registerContainer: {
    marginTop: 30,
    alignItems: "center",
  },
  registerText: {
    fontSize: 14,
    color: "#444",
  },
  registerLink: {
    color: "#007BFF",
    fontWeight: "bold",
  },
});
