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

export function Login() {
  const [celular, setCelular] = useState("");
  const [isPressed, setIsPressed] = useState(false);
  const [isPressedG, setIsPressedG] = useState(false);
  const [telefono, setTelefono] = useState(true);
  const [codigo, setCodigo] = useState("");
  const navigation = useNavigation();

  useFocusEffect(
    React.useCallback(() => {
      const backAction = () => {
        if (!telefono) {
          setTelefono(true);
          return true;
        }
        return false;
      };
      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        backAction
      );
      return () => backHandler.remove();
    }, [telefono])
  );

  const enviarCodigo = async () => {
    if (!celular.trim()) {
      Dialog.show({
        type: ALERT_TYPE.WARNING,
        title: "Campo vacío",
        textBody: "Por favor ingresa un número de celular",
        button: "Aceptar",
      });
      return;
    }
    if (!/^\d{8}$/.test(celular)) {
      Dialog.show({
        type: ALERT_TYPE.WARNING,
        title: "Número inválido",
        textBody: "El número debe tener 8 dígitos",
        button: "Aceptar",
      });
      return;
    }
    try {
     /* await axios.post(
        `https://truequedo-back-r9ah.onrender.com/auth/enviarCodigo/+591${celular}`
      );*/
      Dialog.show({
        type: ALERT_TYPE.SUCCESS,
        title: "Código Enviado",
        textBody: "Se envió correctamente al número",
        button: "Aceptar",
        onPressButton: () => {
          setTelefono(false);
          Dialog.hide();
        },
      });
      setTimeout(() => {
        setTelefono(false);
        Dialog.hide();
      }, 5000);
    } catch (error) {
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: "Error",
        textBody: "Error al enviar el código",
        button: "Aceptar",
      });
      console.error(error);
    }
  };

  const verificarCodigo = async () => {
    if (!codigo.trim()) {
      Dialog.show({
        type: ALERT_TYPE.WARNING,
        title: "Campo vacío",
        textBody: "Por favor ingresa el código",
        button: "Aceptar",
      });
      return;
    }
    try {
      /*const response = await axios.post(
        "https://truequedo-back-r9ah.onrender.com/auth/verificarCodigo",
        {
          phone: `+591${celular}`,
          code: codigo,
        }
      );*/
      Dialog.show({
        type: ALERT_TYPE.SUCCESS,
        title: "Código Verificado",
        textBody:  "Código correcto",
        button: "Continuar",
        onPressButton: () => {
          Dialog.hide();
          navigation.navigate("Home");
        },
      });
      setCodigo("");
    } catch (error) {
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: "Error",
        textBody:
          error.response?.data?.message || "Error al verificar el código",
        button: "Aceptar",
      });
      console.error(error);
    }
  };
  const iniciarGoogle = () => {
    Dialog.show({
      type: ALERT_TYPE.DANGER,
      title: "Error",
      textBody: "Proximamente",
      button: "Aceptar",
      
    });
  };
  return (
    <AlertNotificationRoot>
      {telefono ? (
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
              Inicio con google
            </Text>
          </TouchableHighlight>
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
});
