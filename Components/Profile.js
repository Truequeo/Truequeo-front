import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  BackHandler,
  FlatList,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import {
  useFocusEffect,
  useRoute,
  useNavigation,
} from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { updateProfile, logoutUser } from "../services/apiService";

export default function Profile() {
  const route = useRoute();
  const { usuario, token } = route.params;
  const navigation = useNavigation();

  const [editando, setEditando] = useState(false);
  const [nombre, setNombre] = useState(usuario?.nombreusuario || "");
  const [celular] = useState(usuario?.celularusuario || ""); // Celular no se edita, por eso no tiene setCelular
  const [ubicacion, setUbicacion] = useState(usuario?.ubicacionarticulo || "");
  const [fotoperfil, setFotoperfil] = useState(null);
  const [actualizarUser, setActualizarUser] = useState(null); // Para almacenar el usuario actualizado
  const [verComentarios, setVercomentarios] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      const backAction = () => {
        if (!verComentarios) {
          const usuarioFinal = actualizarUser ?? usuario; // Usa el usuario actualizado si existe
          navigation.reset({
            index: 0,
            routes: [
              { name: "Home", params: { usuario: usuarioFinal, token } },
            ],
          });
          return true;
        } else {
          setVercomentarios(false); // Si estamos viendo comentarios, solo ocultarlos
          return true;
        }
      };
      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        backAction
      );
      return () => backHandler.remove();
    }, [verComentarios, actualizarUser, usuario, token, navigation]) // Dependencias completas
  );

  useEffect(() => {
    if (usuario?.fotoperfil) {
      console.log(usuario?.fotoperfil);
      setFotoperfil(`${usuario.fotoperfil}?t=${Date.now()}`); // Añade timestamp para evitar caché
    }
  }, [usuario?.fotoperfil]);

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigation.replace("Login"); // Redirige después de cerrar sesión
    } catch (error) {
      Alert.alert("Error", "No se pudo cerrar la sesión. Intenta de nuevo.");
      console.error("Error al cerrar sesión desde Profile:", error);
    }
  };
  // Función para seleccionar imagen de la galería
  const seleccionarImagen = async () => {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) {
      Alert.alert(
        "Permiso requerido",
        "Necesitas permitir acceso a tus fotos para seleccionar una nueva foto de perfil."
      );
      return;
    }
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!resultado.canceled) {
      setFotoperfil(resultado.assets[0].uri);
    }
  };

  const handleGuardarCambios = async () => {
    setEditando(false); // Sale del modo edición inmediatamente
    console.log("entra")
    const formData = new FormData();
    formData.append("codusuario", usuario?.codusuario);
    formData.append("nombreusuario", nombre);
    formData.append("ubicacionarticulo", ubicacion);

    if (fotoperfil.startsWith("file://")) {
      const fileName = fotoperfil.split("/").pop();
      const fileType = fileName.split(".").pop();
      formData.append("fotoperfil", {
        uri: fotoperfil,
        name: fileName,
        type: `image/${fileType}`,
      });
    } else {
      formData.append("fotoperfil", fotoperfil);
    }

    try {
      const updatedUser = await updateProfile(formData);
      setActualizarUser(updatedUser);
      Alert.alert("Éxito", "Perfil actualizado correctamente.");
    } catch (error) {
      Alert.alert(
        "Error",
        "No se pudo actualizar el perfil. Intenta de nuevo."
      );
      console.error("Error al guardar cambios del perfil:", error);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "";
    const meses = [
      "enero",
      "febrero",
      "marzo",
      "abril",
      "mayo",
      "junio",
      "julio",
      "agosto",
      "septiembre",
      "octubre",
      "noviembre",
      "diciembre",
    ];
    const fechaObj = new Date(fecha);
    const dia = fechaObj.getDate().toString().padStart(2, "0");
    const mes = meses[fechaObj.getMonth()];
    const año = fechaObj.getFullYear();
    return `${dia} de ${mes} de ${año}`;
  };

  const renderItem = ({ item }) => {
    if (item.isAddButton) {
      return (
        <TouchableOpacity
          onPress={() => navigation.navigate("Add", { usuario, token })}
          style={styles.addNew}
        >
          <Text style={styles.plus}>+</Text>
        </TouchableOpacity>
      );
    }
    return (
      <TouchableOpacity
        style={styles.itemContainer}
        onPress={() => {
          console.log(item);
          navigation.replace("Home", {
            usuario,
            token,
            selectedArticulo: item,
            selectedImagen: item.fotoarticulo,
          });
        }}
      >
        <Image
          source={{ uri: item.fotoarticulo + "/1.jpeg" }}
          style={styles.image}
        />
        {item.etiquetas && item.etiquetas.length > 1 && (
          <View style={styles.overlay}>
            <Text style={styles.overlayText}>+{item.etiquetas.length - 1}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <>
      {!verComentarios && (
        <FlatList
          ListHeaderComponent={
            <View style={styles.container}>
              <TouchableOpacity
                onPress={editando ? seleccionarImagen : null}
                activeOpacity={editando ? 0.7 : 1}
              >
                <Image
                  source={{
                    uri: fotoperfil || "https://via.placeholder.com/120",
                  }}
                  style={styles.profileImage}
                />
              </TouchableOpacity>
              {editando ? (
                <TextInput
                  style={styles.input}
                  value={nombre}
                  onChangeText={setNombre}
                  placeholder="Nombre"
                />
              ) : (
                <Text style={styles.name}>{nombre}</Text>
              )}
              <View style={styles.infoRow}>
                <Icon name="call-outline" size={20} />
                <Text style={styles.infoText}>{celular}</Text>
              </View>
              <View style={styles.infoRow}>
                <View style={styles.infoRow}>
                  <Icon name="location-outline" size={20} />
                  {editando ? (
                    <TextInput
                      style={styles.inputInline}
                      value={ubicacion}
                      onChangeText={setUbicacion}
                      placeholder="Ubicación"
                    />
                  ) : (
                    <Text style={styles.infoText}>{ubicacion}</Text>
                  )}
                </View>
              </View>
              {usuario?.fechanacimiento && !editando && (
                <View style={styles.infoRow}>
                  <Icon name="calendar-outline" size={20} />
                  <Text style={styles.infoText}>
                    {formatearFecha(usuario.fechanacimiento)}
                  </Text>
                </View>
              )}
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => {
                  if (!editando) {
                    setEditando(true);
                  } else {
                    (handleGuardarCambios());
                  }
                }}
              >
                <Icon
                  name={editando ? "save-outline" : "create-outline"}
                  size={20}
                  color="#fff"
                />
                <Text style={styles.editButtonText}>
                  {editando ? "Guardar" : "Editar Perfil"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.editButton}
                onPress={handleLogout}
              >
                <Icon name={"log-out-outline"} size={20} color="#fff" />
                <Text style={styles.editButtonText}>Cerrar Sesión</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setVercomentarios(true)}
                style={styles.ratingWrapper}
              >
                <Text style={styles.ratingValue}>
                  {Number.isInteger(parseFloat(usuario.ratingusuario))
                    ? parseInt(usuario.ratingusuario)
                    : parseFloat(usuario.ratingusuario).toFixed(1)}{" "}
                  / 10
                </Text>
                <View style={styles.ratingContainer}>
                  {[...Array(10)].map((_, index) => {
                    const rating = parseFloat(usuario.ratingusuario || "0");
                    const filled = index + 1 <= Math.floor(rating);
                    const half =
                      index + 1 > Math.floor(rating) &&
                      rating - Math.floor(rating) >= 0.25 &&
                      rating - Math.floor(rating) < 0.75;
                    const iconName = filled
                      ? "star"
                      : half
                      ? "star-half"
                      : "star-outline";
                    return (
                      <Icon
                        key={index}
                        name={iconName}
                        size={20}
                        color="#FFD700"
                      />
                    );
                  })}
                </View>
              </TouchableOpacity>
              <Text style={styles.sectionTitle}>Tus Artículos </Text>
            </View>
          }
          data={[...(usuario.articulos || []), { isAddButton: true }]}
          renderItem={renderItem}
          keyExtractor={(item, index) =>
            item.idarticulo ? item.idarticulo.toString() : `add-button-${index}`
          }
          numColumns={2}
          contentContainerStyle={styles.grid}
        />
      )}
      {verComentarios && (
        <View style={styles.commentsContainer}>
          <Text style={styles.commentsTitle}>Comentarios del usuario</Text>
          <Text>📢 Aquí irán los comentarios...</Text>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 20, // Ajuste para el espacio superior
    paddingBottom: 20, // Ajuste para espacio inferior antes de la FlatList
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#a864ff",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    width: "100%", // Ocupa todo el ancho
  },
  infoText: {
    fontSize: 16,
    marginLeft: 10,
    flex: 1, // Para que el texto ocupe el espacio restante
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10, // Un poco más de padding
    width: "100%",
    fontSize: 16,
    marginBottom: 10,
  },
  inputInline: {
    borderBottomWidth: 1,
    borderColor: "#ccc",
    marginLeft: 10,
    flex: 1,
    fontSize: 16,
    paddingVertical: 2,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#a864ff", // Usar un color más distintivo
    paddingVertical: 12, // Más padding vertical
    paddingHorizontal: 25, // Más padding horizontal
    borderRadius: 30,
    marginTop: 15, // Menos espacio entre botones
    // marginBottom: 30, // Eliminado para más control con el marginTop
  },
  editButtonText: {
    color: "#fff",
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "bold", // Texto en negrita
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 30,
    marginBottom: 15,
    alignSelf: "flex-start", // Alineado a la izquierda
    width: "100%",
  },
  grid: {
    // paddingHorizontal: 16, // Ya está en el container principal, pero puede ser necesario aquí
    justifyContent: "space-between", // Distribuye los items uniformemente
  },
  itemContainer: {
    width: "48%", // 2 items por fila con 1% de margen a cada lado
    aspectRatio: 1,
    margin: "1%",
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#000",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 6,
    paddingVertical: 2,
    flexDirection: "row",
    alignItems: "center",
  },
  overlayText: {
    fontSize: 12,
    color: "#000",
  },
  addNew: {
    width: "48%",
    aspectRatio: 1,
    margin: "1%",
    backgroundColor: "#e0e0e0",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  plus: {
    fontSize: 40,
    color: "#aaa",
  },
  ratingWrapper: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 15,
  },
  ratingValue: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  ratingContainer: {
    flexDirection: "row",
  },
  commentsContainer: {
    flex: 1, // Para que ocupe el espacio disponible
    padding: 20,
    backgroundColor: "#fff",
  },
  commentsTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
  },
});
