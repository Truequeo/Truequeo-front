import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useState, useRef } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

import { getConversationMessages, sendMessage } from "../services/apiService";
import io from "socket.io-client";
import { urlBackend } from "./VariablesEntorno";
import axios from "axios";

export default function Chat() {
  const socketRef = useRef();

  const route = useRoute();
  const navigation = useNavigation();
  const {
    codusuario,
    token,
    codarticulo,
    codarticulodueño,
    nombrearticulodueño,
    coddueño,
    fotoarticulodueño,
  } = route.params;

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const flatListRef = useRef(null);
  const [mostrarBanner, setMostrarBanner] = useState({
    estado: null,
    texto: "",
  });
  const fetchMessages = async () => {
    if (!codarticulodueño || !codarticulo || !codusuario || !coddueño) {
      setError("Faltan datos esenciales para cargar la conversación.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await getConversationMessages(
        codarticulo,
        codarticulodueño,
        codusuario,
        coddueño
      );
      const formattedMessages = data.map((msg, index) => ({
        id: msg.idmensaje
          ? msg.idmensaje.toString()
          : `temp_${index}_${Date.now()}`,
        texto: msg.texto,
        sender: msg.codremitente === codusuario ? "me" : "other",
      }));
      setMessages(formattedMessages);
      setMostrarBanner(
        !data[0]?.estadofinal || data[0].estadofinal === "Pendiente"
          ? { estado: true, texto: "" }
          : { estado: false, texto: data[0].estadofinal }
      );
    } catch (err) {
      const displayError =
        err.response?.data?.error ||
        "No se pudieron cargar los mensajes. Verifica tu conexión.";
      setError(displayError);
      Alert.alert("Error", displayError);
    } finally {
      setLoading(false);
    }
  };
useEffect(() => {
  fetchMessages();
  socketRef.current = io(urlBackend);
  socketRef.current.on("connect", () => {
    console.log("🟢 Conectado al socket server");
  });
  socketRef.current.on("cambioEstado", ({ codarticulo, codarticulo2, estado, quienCambio }) => {
  const soyInvolucrado =
    (codarticulo === route.params.codarticulo &&
      codarticulo2 === route.params.codarticulodueño) ||
    (codarticulo2 === route.params.codarticulo &&
      codarticulo === route.params.codarticulodueño);

  if (!soyInvolucrado) return;

  const soyQuienCambio = quienCambio === codusuario;

  const estadoFinalizado =
    estado === "Rechazado" || estado === "Truequeado";

  setMostrarBanner({
    estado: !estadoFinalizado,
    texto: estado,
  });

  if (!soyQuienCambio) {
    Alert.alert(
      estadoFinalizado ? "Trueque finalizado" : "Estado actualizado",
      `Nuevo estado: ${estado}`
    );
  }
});

socketRef.current.on("informarOtro", ({ codarticulo, codarticulo2, estado, quienCambio }) => {
  const soyInvolucrado =
    (codarticulo === route.params.codarticulo &&
      codarticulo2 === route.params.codarticulodueño) ||
    (codarticulo2 === route.params.codarticulo &&
      codarticulo === route.params.codarticulodueño);

  if (!soyInvolucrado) return;

  const soyQuienCambio = quienCambio === codusuario;

  setMostrarBanner({
    estado: true,
    texto: `El otro usuario ha puesto su estado en: ${estado}`,
  });

  if (!soyQuienCambio) {
    Alert.alert("Estado del otro usuario", `Ha elegido: ${estado}`);
  }
});



  socketRef.current.on("nuevoMensaje", (mensaje) => {
    console.log("📥 Mensaje recibido:", mensaje);
    setMessages((prev) => [
      ...prev,
      {
        id: mensaje.idmensaje?.toString() || Date.now().toString(),
        texto: mensaje.texto,
        sender: mensaje.codremitente === codusuario ? "me" : "other",
      },
    ]);
  });

  return () => {
    socketRef.current.disconnect();
    console.log("🔴 Socket desconectado");
  };
}, [codarticulo, codarticulodueño, codusuario, coddueño]);


  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const newMessageData = {
      codarticulo: codarticulo,
      codarticulo2: codarticulodueño,
      codremitente: codusuario,
      codreceptor: coddueño,
      texto: inputText,
    };

    try {
      await sendMessage(newMessageData);
      setInputText("");
      socketRef.current.emit("enviarMensaje", newMessageData);
    } catch (err) {
      const displayError =
        err.response?.data?.error || "No se pudo enviar el mensaje.";
      Alert.alert("Error", displayError);
    }
  };

  const renderItem = ({ item }) => (
    <View
      style={[
        styles.messageBubble,
        item.sender === "me" ? styles.myMessage : styles.otherMessage,
      ]}
    >
      <Text
        style={[
          styles.messageText,
          item.sender === "me" ? styles.myMessageText : {},
        ]}
      >
        {item.texto}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#a864ff" />
        <Text style={styles.loadingText}>Cargando conversación...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Icon name="chatbox-outline" size={50} color="#a864ff" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchMessages}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }
  const modificarEstado = async (codarticulo, codarticulo2, nuevoEstado) => {
    try {
      const response = await axios.post(`${urlBackend}match`, {
        codarticulo,
        codarticulo2,
        estado: nuevoEstado,
      });

      const final = response.data.estado_final;

      if (final === "Truequeado") {
        Alert.alert("Trueque exitoso", "Ambas partes aceptaron el trueque.");
      } else if (final === "Rechazado") {
        Alert.alert(
          "Trueque rechazado",
          "Una de las partes rechazó el trueque."
        );
      } else {
        Alert.alert(
          "Esperando respuesta",
          "Aún falta que la otra parte responda."
        );
      }
      setMostrarBanner({ estado: false, texto: final });
    } catch (error) {
      if (error.response?.data?.estado_final === "Rechazado") {
        Alert.alert(
          "Trueque cancelado",
          "El otro usuario ya rechazó el trueque. No se puede continuar."
        );
        setMostrarBanner({ estado: false, texto: "Rechazado" });
      } else {
        console.error("Error al modificar estado:", error);
        Alert.alert(
          "Error",
          "Ocurrió un problema al intentar modificar el estado."
        );
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={30} color="#000" />
        </TouchableOpacity>
        <Image
          source={{ uri: fotoarticulodueño + "/1.jpeg" }}
          style={styles.profileImage}
        />
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
          {nombrearticulodueño}
        </Text>
        <View style={{ width: 30 }} />
      </View>
      {mostrarBanner.estado && (
        <View style={styles.bannerContainer}>
          <Text style={styles.bannerTitle}>¿Se realizará el trueque?</Text>
          <View style={styles.bannerButtons}>
            <TouchableOpacity
              style={[styles.bannerButton, { backgroundColor: "#4CAF50" }]}
              onPress={() => {
                modificarEstado(codarticulo, codarticulodueño, "Truequeado");
              }}
            >
              <Text style={styles.bannerButtonText}>Truequeado</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.bannerButton, { backgroundColor: "#FF9800" }]}
              onPress={() => {
                modificarEstado(codarticulo, codarticulodueño, "En proceso");
              }}
            >
              <Text style={styles.bannerButtonText}>En proceso</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.bannerButton, { backgroundColor: "#F44336" }]}
              onPress={() => {
                modificarEstado(codarticulo, codarticulodueño, "Rechazado");
              }}
            >
              <Text style={styles.bannerButtonText}>Rechazado</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {!mostrarBanner.estado && (
        <View style={styles.bannerContainer}>
          <Text style={styles.bannerTitle}>{mostrarBanner.texto}</Text>
        </View>
      )}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.messagesListContainer}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Escribe un mensaje..."
          placeholderTextColor="#888"
          value={inputText}
          onChangeText={setInputText}
        />
        <TouchableOpacity onPress={handleSendMessage} style={styles.sendButton}>
          <Icon name="send" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f2f5",
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: "#d9534f",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: "#a864ff",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 15,
    paddingVertical: 10,
    paddingTop: Platform.OS === "android" ? 40 : 50,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    marginRight: 15,
  },
  profileImage: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    borderWidth: 1,
    borderColor: "#a864ff",
    marginRight: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
  },
  messagesListContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  messageBubble: {
    maxWidth: "75%",
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginVertical: 4,
    borderRadius: 18,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  myMessage: {
    backgroundColor: "#a864ff",
    alignSelf: "flex-end",
    borderBottomRightRadius: 5,
  },
  otherMessage: {
    backgroundColor: "#e4e6eb",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 5,
  },
  messageText: {
    fontSize: 16,
    color: "#333",
  },
  myMessageText: {
    color: "#fff",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#e0e0e0",
    backgroundColor: "#fff",
    alignItems: "center",
    paddingBottom: Platform.OS === "ios" ? 20 : 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  sendButton: {
    backgroundColor: "#a864ff",
    padding: 12,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  bannerContainer: {
    backgroundColor: "#fff",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    alignItems: "center",
    zIndex: 10,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  bannerButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  bannerButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  bannerButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
