// Login.js
import React, { useState, useContext, useEffect } from "react"; // Importa useEffect
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
import {
  useNavigation,
  useFocusEffect,
  useRoute,
} from "@react-navigation/native"; // Importa useRoute
import {
  ALERT_TYPE,
  Dialog,
  AlertNotificationRoot,
} from "react-native-alert-notification";

import { AuthContext } from "../context/AuthContext";

export function Login() {
  const [celular, setCelular] = useState("");
  const [isPressed, setIsPressed] = useState(false);
  const [isPressedG, setIsPressedG] = useState(false);
  const [telefono, setTelefono] = useState(true); // Controla si se muestra input de teléfono o código
  const [codigo, setCodigo] = useState("");

  const { signIn } = useContext(AuthContext);
  const navigation = useNavigation();
  const route = useRoute(); // <-- Usa el hook useRoute para acceder a los parámetros de la ruta

  // Efecto para verificar si se necesita verificación de teléfono al enfocar la pantalla
  useFocusEffect(
    React.useCallback(() => {
      const needsVerification = route.params?.needsPhoneVerification;
      const phoneNumberFromRoute = route.params?.phoneNumber;

      if (needsVerification && phoneNumberFromRoute) {
        // Si se necesita verificación, cambia la vista
        setTelefono(false);
        setCelular(phoneNumberFromRoute); // Establece el número recibido
        // Opcional: Limpiar los parámetros para que no se dispare de nuevo si vuelves
        navigation.setParams({
          needsPhoneVerification: undefined,
          phoneNumber: undefined,
        });
      } else {
        // Si no se necesita verificación, asegura que se muestre la vista de teléfono al enfocar
        setTelefono(true); // Esto también lo manejas con el BackHandler, pero refuerza el estado inicial
      }

      // Lógica existente del BackHandler
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
    }, [
      telefono,
      route.params?.needsPhoneVerification,
      route.params?.phoneNumber,
    ]) // Asegúrate de incluir los parámetros en las dependencias
  );

  // Efecto para inicializar el estado 'telefono' cuando el componente se monta
  useEffect(() => {
    const needsVerification = route.params?.needsPhoneVerification;
    if (needsVerification) {
      setTelefono(false);
      setCelular(route.params?.phoneNumber || ""); // Usa el número pasado o cadena vacía
      navigation.setParams({
        needsPhoneVerification: undefined,
        phoneNumber: undefined,
      }); // Limpiar parámetros
    } else {
      setTelefono(true);
    }
  }, []); // Se ejecuta solo al montar el componente

  const enviarCodigo = async () => {
    // ... tu lógica existente ...
    if (!celular.trim()) {
      /* ... */ return;
    }
    if (!/^\d{8}$/.test(celular)) {
      /* ... */ return;
    }
    try {
      /* await axios.post(...) */
      Dialog.show({
        type: ALERT_TYPE.SUCCESS,
        title: "Código Enviado",
        textBody: "Se envió correctamente al número",
        button: "Aceptar",
        onPressButton: () => {
          setTelefono(false); // Cambia a la vista de código
          Dialog.hide();
        },
      });
      // Simulación:
      setTimeout(() => {
        setTelefono(false); // Cambia a la vista de código después de 2 segundos
        Dialog.hide();
      }, 2000);
    } catch (error) {
      /* ... manejo de error ... */
    }
  };

  const verificarCodigo = async () => {
    // ... tu lógica existente ...
    if (!codigo.trim()) {
      /* ... */ return;
    }
    try {
      /* const response = await axios.post(...) */

      // **** LÓGICA CLAVE: Llamar a signIn del contexto después de verificar ****
      await signIn("dummy-token"); // Llama a la función signIn del contexto

      Dialog.show({
        type: ALERT_TYPE.SUCCESS,
        title: "Código Verificado",
        textBody: "Código correcto",
        button: "Continuar",
        onPressButton: () => {
          Dialog.hide();
          // La navegación al Home ocurre automáticamente via RootNavigator
        },
      });

      setCodigo("");
    } catch (error) {
      /* ... manejo de error ... */
      setCodigo("");
    }
  };

  // Lógica para iniciar Google SSO (en la pantalla de Login inicial)
  const iniciarGoogle = () => {
    Dialog.show({
      type: ALERT_TYPE.DANGER,
      title: "Error",
      textBody: "Proximamente",
      button: "Aceptar",
    });
    // Cuando implementes esto:
    // 1. Autenticación con Google.
    // 2. Verificar si el usuario de Google ya existe en tu DB.
    // 3. Si no existe: Navegar a una pantalla para recolectar el número de celular
    //    y luego proceder con la verificación del teléfono y el perfil.
    //    (Similar al flujo de registro normal, pero pre-llenando datos si es posible)
    // 4. Si existe pero necesita verificar teléfono: Navegar a la verificación (quizás pasando el número).
    // 5. Si existe y está completo: Llamar a signIn() directamente.
  };

  return (
    <AlertNotificationRoot>
      {telefono ? (
        // Tu UI para ingresar número de teléfono (vista inicial de Login)
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
          {/* Enlace para ir al Registro */}
          <TouchableOpacity
            style={styles.registerLink} // Puedes reutilizar o crear un nuevo estilo
            onPress={() => navigation.navigate("Registration")}
          >
            <Text style={styles.registerLinkText}>
              ¿No tienes cuenta? Regístrate
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        // Tu UI para ingresar código de verificación (vista de código)
        <View style={styles.container}>
          <Text style={styles.verificationPrompt}>
            Ingresa el código enviado a {celular}
          </Text>
          <TextInput
            style={styles.input}
            onChangeText={setCodigo}
            value={codigo}
            placeholder="Ingresa el código"
            placeholderTextColor="#888"
            keyboardType="numeric"
            maxLength={6} // Asumiendo un código de 6 dígitos
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
          {/* Puedes añadir un botón para reenviar código si es necesario */}
        </View>
      )}
    </AlertNotificationRoot>
  );
}

// Tus estilos existentes
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
    fontSize: 16,
  },
  botonInicio: {
    backgroundColor: "#000",
    padding: 15,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#000",
    alignItems: "center", // Centra el texto del botón
  },
  botonInicioG: {
    backgroundColor: "#000", // Puedes cambiar a un color de Google más adelante si quieres mantener el tuyo
    padding: 15,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#000",
    marginTop: 20,
    alignItems: "center", // Centra el texto del botón
  },
  textoBoton: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 18,
  },
  registerLink: {
    // Nuevo estilo para el enlace de registro
    marginTop: 20,
    alignItems: "center",
  },
  registerLinkText: {
    // Nuevo estilo para el texto del enlace de registro
    color: "#007BFF",
    fontSize: 16,
  },
  verificationPrompt: {
    // Nuevo estilo para el texto sobre el código
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
});
