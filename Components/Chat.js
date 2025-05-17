import { useRoute } from "@react-navigation/native";
import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { urlBackend } from "./VariablesEntorno";

export default function Chat() {
  const route = useRoute();
  const { usuario, token, articulo } = route.params;
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");

  const enviarMensaje = () => {
    if (!inputText.trim()) return;
    const nuevoMensaje = {
      codarticulo: articulo.codarticulo,
      codremitente: usuario.codusuario,
      codreceptor: articulo.codusuario || articulo.codreceptor,
      texto: inputText,
    };
    axios.post(urlBackend + "chat/mensajes", nuevoMensaje).then((response) => {
      setMessages([...messages, { ...response.data, sender: "me" }]);
      setInputText("");
    });
  };

  useEffect(() => {
    if (articulo && usuario) {
     console.log("entra")
      obtenerMensajes();
    }
  }, [articulo, usuario]);

  const obtenerMensajes = () => {
  axios
    .get(
      `${urlBackend}chat/mensajes/${articulo.codarticulo}/${usuario.codusuario}/${articulo.codusuario || articulo.codreceptor}`
    )
    .then((response) => {
      console.log("aca");
      console.log(response.data);
      const mensajesRecibidos = response.data.map((mensaje) => ({
        id: mensaje.id.toString(),
        texto: mensaje.texto,
        sender: mensaje.codremitente === usuario.codusuario ? "me" : "other",
      }));
      setMessages(mensajesRecibidos);
    })
    .catch((error) => {
      console.error("❌ Error al obtener mensajes:", error.message);
      console.log("🔎 URL utilizada:", `${urlBackend}/chat/mensajes/${articulo.codarticulo}/${usuario.codusuario}/${articulo.codusuario}`);
    });
};

  const renderItem = ({ item }) => (
    <View
      style={[
        styles.messageBubble,
        item.sender === "me" ? styles.myMessage : styles.otherMessage,
      ]}
    >
      <Text style={styles.messageText}>{item.texto}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity>
          <Image
            source={{ uri: usuario.fotoperfil }}
            style={styles.profileImage}
          />
        </TouchableOpacity>
        <Text style={styles.title}>TRUEQUEO</Text>
        <Icon name="notifications-off-outline" size={40} color="black" />
      </View>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.messagesContainer}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Escribe un mensaje..."
          value={inputText}
          onChangeText={setInputText}
        />
        <TouchableOpacity onPress={enviarMensaje} style={styles.sendButton}>
          <Icon name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    height: 80,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  profileImage: {
    width: 55,
    height: 55,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#a864ff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  messagesContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  messageBubble: {
    maxWidth: "70%",
    padding: 10,
    marginVertical: 5,
    borderRadius: 12,
  },
  myMessage: {
    backgroundColor: "#d1e7dd",
    alignSelf: "flex-end",
  },
  otherMessage: {
    backgroundColor: "#e2e3e5",
    alignSelf: "flex-start",
  },
  messageText: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#f9f9f9",
    alignItems: "center",
  },
  textInput: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  sendButton: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 20,
  },
});
