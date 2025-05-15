import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useRoute } from "@react-navigation/native";
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function Home() {
  const route = useRoute();
  const { usuario, token } = route.params;
  const [filtroSeleccionado, setFiltroSeleccionado] = useState("Todo");
  const navigation = useNavigation();

  const handleProfilePress = () => {
    navigation.replace("Profile", { usuario, token });
  };

  const handleRecomendado = () => {
    setFiltroSeleccionado("Recomendado");
    Alert.alert("Filtro", "Filtro: Recomendado");
  };

  const handleTodo = () => {
    setFiltroSeleccionado("Todo");
    Alert.alert("Filtro", "Filtro: Todo");
  };

  const handleCerca = () => {
    setFiltroSeleccionado("Cerca");
    Alert.alert("Filtro", "Filtro: Cerca");
  };

  const handleOpciones = () => {
    Alert.alert("Opciones", "Abrir opciones avanzadas");
  };

  return (
    <View style={styles.container}>
      {/* Encabezado */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleProfilePress}>
          <Text>{usuario?.nombreusuario}</Text>
          <Image
            source={{ uri: `${usuario.fotoperfil}?t=${new Date().getTime()}` }}
            style={styles.profileImage}
          />
        </TouchableOpacity>

        <Text style={styles.title}>TRUEQUEO</Text>
        <Icon name="notifications-off-outline" size={45} color="black" />
      </View>

      {/* Filtros */}
      <View style={styles.filters}>
        <TouchableOpacity onPress={handleRecomendado}>
          <Text
            style={[
              styles.filterText,
              filtroSeleccionado === "Recomendado" && styles.selectedFilter,
            ]}
          >
            Recomendado
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleTodo}>
          <Text
            style={[
              styles.filterText,
              filtroSeleccionado === "Todo" && styles.selectedFilter,
            ]}
          >
            Todo
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleCerca}>
          <Text
            style={[
              styles.filterText,
              filtroSeleccionado === "Cerca" && styles.selectedFilter,
            ]}
          >
            Cerca
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleOpciones}>
          <Icon name="options-outline" size={20} />
        </TouchableOpacity>
      </View>

      {/* Tarjeta de producto */}
      <View style={styles.card}>
        <Image style={styles.productImage} />
        <View style={styles.textContainer}>
          <Text style={styles.productTitle}>Guitarra acústica</Text>
          <Text style={styles.productCategory}>Instrumentos Musicales</Text>
        </View>
      </View>

      {/* Botones */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.smallButton}>
          <Icon name="close-outline" size={30} color="#000" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.bigButton}>
          <Icon name="download-outline" size={30} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.smallButton}>
          <Icon name="shuffle-outline" size={30} color="#000" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  header: {
    height: 80,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  },
  filters: {
    height: 50,
    backgroundColor: "#dedede",
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 20,
    alignItems: "center",
    borderRadius: 50,
  },
  filterText: {
    fontSize: 16,
    color: "black",
  },
  selectedFilter: {
    backgroundColor: "#b4b4b4",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    color: "#000",
  },
  card: {
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#f9f9f9",
    elevation: 4,
  },
  productImage: {
    width: "100%",
    height: 300,
    resizeMode: "cover",
  },
  textContainer: {
    padding: 10,
  },
  productTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  productCategory: {
    fontSize: 14,
    color: "#555",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 30,
    alignItems: "center",
  },
  smallButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
  },
  bigButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#444",
    justifyContent: "center",
    alignItems: "center",
  },
});
