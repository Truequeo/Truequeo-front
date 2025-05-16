import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  BackHandler,
  FlatList,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { urlBackend } from "./VariablesEntorno";
import { useNavigation } from "@react-navigation/native";

export default function Profile() {
  const route = useRoute();
  const { usuario, token } = route.params;
  const [editando, setEditando] = useState(false);
  const [nombre, setNombre] = useState(usuario?.nombreusuario || "");
  const [celular] = useState(usuario?.celularusuario || "");
  const [ubicacion, setUbicacion] = useState(usuario?.ubicacionarticulo || "");
  const [fotoperfil, setFotoperfil] = useState(null);
  const navigation = useNavigation();
  const [actualizarUser, setActualizarUser] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      const backAction = () => {
        const usuarioFinal = actualizarUser ?? usuario;
        navigation.reset({
          index: 0,
          routes: [{ name: "Home", params: { usuario: usuarioFinal, token } }],
        });
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        backAction
      );
      return () => backHandler.remove();
    }, [actualizarUser])
  );

  useEffect(() => {
    if (usuario?.fotoperfil) {
      setFotoperfil(`${usuario.fotoperfil}?t=${Date.now()}`);
    }
  }, [usuario?.fotoperfil]);

  const seleccionarImagen = async () => {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) {
      Alert.alert(
        "Permiso requerido",
        "Necesitas permitir acceso a tus fotos."
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
  const guardarCambios = () => {
    setEditando(false);
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
    axios
      .put(urlBackend + "user/updateUser", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        setActualizarUser(response.data.usuario);
      })
      .catch((error) => {
        console.error("Error al actualizar:", error);
      });
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
        <Image source={{ uri: item.fotoarticulo }} style={styles.image} />
        {item.etiquetas && item.etiquetas.length > 1 && (
          <View style={styles.overlay}>
            <Text style={styles.overlayText}>+{item.etiquetas.length - 1}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };
  return (
    <FlatList
      ListHeaderComponent={
        <View style= {styles.container}>
          {/* Foto de perfil */}
          <TouchableOpacity
            onPress={editando ? seleccionarImagen : null}
            activeOpacity={editando ? 0.7 : 1}
          >
            <Image
              source={{ uri: fotoperfil || "https://via.placeholder.com/120" }}
              style={styles.profileImage}
            />
          </TouchableOpacity>

          {/* Nombre de usuario */}
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

          {/* Celular */}
          <View style={styles.infoRow}>
            <Icon name="call-outline" size={20} />
            <Text style={styles.infoText}>{celular}</Text>
          </View>

          {/* Ubicación */}
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

          {/* Fecha de nacimiento */}
          {usuario?.fechanacimiento && !editando && (
            <View style={styles.infoRow}>
              <Icon name="calendar-outline" size={20} />
              <Text style={styles.infoText}>
                {formatearFecha(usuario.fechanacimiento)}
              </Text>
            </View>
          )}

          {/* Botón Editar/Guardar */}
          <TouchableOpacity
            style={styles.editButton}
            onPress={async () => {
              if (editando) {
                await new Promise((resolve) => setTimeout(resolve, 3100));
                guardarCambios();
              } else {
                setEditando(true);
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
        </View>
      }
      data={[...usuario.articulos, { isAddButton: true }]}
      renderItem={renderItem}
      keyExtractor={(item, index) => index.toString()}
      numColumns={2}
      contentContainerStyle={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: {
  marginTop: 20,
  alignItems: "center",
  paddingHorizontal: 16, 
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
    width: "100%",
  },
  infoText: {
    fontSize: 16,
    marginLeft: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 8,
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
    backgroundColor: "#444",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginTop: 30,
    marginBottom: 30, 
  },
  editButtonText: {
    color: "#fff",
    marginLeft: 10,
    fontSize: 16,
  },
  itemContainer: {
    width: "48%",
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
});
