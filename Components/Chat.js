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

export default function Chat() {
  const route = useRoute();
  const navigation = useNavigation();
  const { usuario, token, articulo } = route.params;

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const flatListRef = useRef(null);
  const otherParticipantId = articulo.codusuario || articulo.codreceptor;
  const otherParticipantProfilePic =
    articulo.fotoarticulo+"/1.jpeg" ||
    "https://via.placeholder.com/55";
  const otherParticipantName =
    articulo.nombrearticulo ||
    "Usuario Desconocido";

  const fetchMessages = async () => {
    if (!articulo?.codarticulo || !usuario?.codusuario || !otherParticipantId) {
      setError("Faltan datos esenciales para cargar la conversación.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getConversationMessages(
        articulo.codarticulo,
        usuario.codusuario,
        otherParticipantId
      );
      const formattedMessages = data.map((msg, index) => ({
        id: msg.idmensaje
          ? msg.idmensaje.toString()
          : `temp_${index}_${Date.now()}`,
        texto: msg.texto,
        sender: msg.codremitente === usuario.codusuario ? "me" : "other",
      }));
      setMessages(formattedMessages);
      console.log("Mensajes cargados:", formattedMessages);
    } catch (err) {
      console.error("❌ Error al obtener mensajes:", err);
      const displayError =
        err.response?.data?.error ||
        "No se pudieron cargar los mensajes de chat. Por favor, verifica tu conexión o intenta de nuevo más tarde.";
      setError(displayError);
      Alert.alert("Error", displayError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [articulo, usuario, otherParticipantId]);

  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const newMessageData = {
      codarticulo: articulo.codarticulo,
      codremitente: usuario.codusuario,
      codreceptor: otherParticipantId,
      texto: inputText,
    };

    try {
      const response = await sendMessage(newMessageData);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: response.idmensaje
            ? response.idmensaje.toString()
            : Date.now().toString(),
          texto: inputText,
          sender: "me",
        },
      ]);
      setInputText("");
    } catch (err) {
      console.error("Error al enviar mensaje:", err);
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
          source={{ uri: otherParticipantProfilePic }}
          style={styles.profileImage}
        />
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
          {otherParticipantName}
        </Text>
        <View style={{ width: 30 }} />
      </View>

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
    justifyContent: "flex-start", // Alinea al inicio para el botón de atrás
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
    marginRight: 15, // Más espacio para el botón de atrás
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
});
