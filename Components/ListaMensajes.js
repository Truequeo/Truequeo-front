import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";

import { getUserChats } from "../services/apiService";

export default function ListaMensajes() {
  const route = useRoute();
  const navigation = useNavigation();
  const { usuario } = route.params;

  const [mensajes, setMensajes] = useState([]);
  const [loading, setLoading] = useState(true); // Estado de carga
  const [error, setError] = useState(null); // Estado para manejar errores

  useEffect(() => {
    const fetchMensajes = async () => {
      if (!usuario?.codusuario) {
        setError("ID de usuario no disponible.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getUserChats(usuario.codusuario); // Llama al servicio
        setMensajes(data);
        console.log("Mensajes cargados:", data);
      } catch (err) {
        console.error("❌ Error al obtener chats:", err);
        setError("No se pudieron cargar los chats. Intenta de nuevo.");
        Alert.alert(
          "Error",
          "No se pudieron cargar los chats. Por favor, intenta de nuevo más tarde."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMensajes();
  }, [usuario?.codusuario]);

  const renderItem = ({ item }) => {
    if (!item) return null;

    const interlocutorNombre =
      item.codremitente === usuario?.codusuario
        ? item.nombrearticulo || "Destinatario Desconocido"
        : item.nombrearticulo || "Remitente Desconocido";

    const interlocutorFoto =
      item.codremitente === usuario?.codusuario
        ? item.fotoarticulo + "/1.jpeg"
        : item.fotoperfil;

    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() =>
          navigation.navigate("Chat", {
            usuario,
            articulo: item,
          })
        }
      >
        <Image
          source={{ uri: interlocutorFoto || "https://via.placeholder.com/48" }} // Fallback de imagen
          style={styles.avatar}
        />
        <View style={styles.chatContent}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatName}>{interlocutorNombre}</Text>
            {item.fecha && ( // Asegúrate de que `fecha` exista
              <Text style={styles.chatTime}>
                {new Date(item.fecha).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            )}
          </View>
          <Text numberOfLines={1} style={styles.chatMessage}>
            {item.texto || "No hay mensajes."}{" "}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };
  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#a864ff" />
        <Text style={styles.loadingText}>Cargando tus mensajes...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Icon name="sad-outline" size={50} color="#a864ff" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => fetchMensajes()}
        >
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (mensajes.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Icon name="chatbubbles-outline" size={80} color="#ccc" />
        <Text style={styles.noMessagesText}>Aún no tienes chats.</Text>
        <Text style={styles.noMessagesSubText}>
          ¡Empieza a interactuar con otros usuarios!
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate("Profile", { usuario })}
        >
          <Image
            source={{
              uri: usuario.fotoperfil || "https://via.placeholder.com/65",
            }}
            style={styles.profileImage}
          />
        </TouchableOpacity>
        <Text style={styles.title}>TRUEQUEO</Text>
        <TouchableOpacity
          onPress={() => navigation.replace("Home", { usuario })}
        >
          <Icon name="home-outline" size={45} color="#000" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={mensajes}
        keyExtractor={(item, index) => item.idmensaje || index.toString()} // Usa un ID único si existe
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: "#f9f9f9", // Fondo más claro
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: "#d9534f", // Rojo para errores
    textAlign: "center",
  },
  noMessagesText: {
    marginTop: 20,
    fontSize: 20,
    fontWeight: "bold",
    color: "#888",
  },
  noMessagesSubText: {
    fontSize: 16,
    color: "#aaa",
    marginTop: 5,
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
    height: 80,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10, // Un poco de espacio debajo del header
  },
  profileImage: {
    width: 65,
    height: 65,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: "#a864ff",
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#333", // Color de texto más oscuro
  },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15, // Más padding
    marginBottom: 10, // Espacio entre items
    backgroundColor: "#fff", // Fondo blanco para cada item
    borderRadius: 10, // Bordes redondeados
    shadowColor: "#000", // Sombra para un efecto elevado
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  avatar: {
    width: 55, // Un poco más grande
    height: 55,
    borderRadius: 27.5, // Ajustar radio
    marginRight: 15,
    borderWidth: 1,
    borderColor: "#e0e0e0", // Borde suave
  },
  chatContent: {
    flex: 1,
    justifyContent: "center",
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4, // Un poco más de espacio
  },
  chatName: {
    fontWeight: "bold",
    fontSize: 17, // Un poco más grande
    color: "#333",
  },
  chatTime: {
    fontSize: 13, // Un poco más grande
    color: "#888",
  },
  chatMessage: {
    color: "#666",
    fontSize: 15, // Un poco más grande
  },
});
