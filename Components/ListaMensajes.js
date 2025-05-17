import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { urlBackend } from "./VariablesEntorno";
import { useRoute, useNavigation } from "@react-navigation/native";
import axios from "axios";

export default function ListaMensajes() {
  const route = useRoute();
  const navigation = useNavigation();
  const { usuario } = route.params;

  const [mensajes, setMensajes] = useState([]);

  useEffect(() => {
    axios
      .get(`${urlBackend}chat/mensajes/${usuario?.codusuario}`)
      .then((response) => {
        setMensajes(response.data);
        console.log(mensajes);
      })
      .catch((error) => {
        console.error("❌ Error al obtener chats:", error);
      });
  }, []);

  const renderItem = ({ item }) => {
    const esMio = item.codremitente === usuario?.codusuario;
    const nombreInterlocutor = esMio
      ? item.nombreusuario || "Destinatario"
      : item.nombreusuario || "Remitente";

    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() =>navigation.navigate("Chat", {
            usuario,
            articulo: item,
          })
        }
      >
        <Image source={{ uri: item.fotoperfil }} style={styles.avatar} />
        <View style={styles.chatContent}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatName}>{nombreInterlocutor}</Text>
            <Text style={styles.chatTime}>
              {new Date(item.fecha).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
          <Text numberOfLines={1} style={styles.chatMessage}>
            {item.texto}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={mensajes}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  chatContent: {
    flex: 1,
    justifyContent: "center",
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  chatName: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#333",
  },
  chatTime: {
    fontSize: 12,
    color: "#888",
  },
  chatMessage: {
    color: "#666",
    fontSize: 14,
  },
});
