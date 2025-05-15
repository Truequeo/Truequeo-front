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
  const [celular] = useState(usuario?.celularusuario || ""); // Celular no editable
  const [ubicacion, setUbicacion] = useState(usuario?.ubicacionarticulo || "");
  const [fotoperfil, setFotoperfil] = useState(usuario?.fotoperfil || null);
  const navigation = useNavigation();
  const [actualizarUser, setActualizarUser] = useState(null);
  useFocusEffect(
    React.useCallback(() => {
      const backAction = () => {
        if (actualizarUser !== null) {
          navigation.replace("Home", { usuario: actualizarUser, token });
          return true; 
        }
        return false; 
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
    const fileName = fotoperfil.split("/").pop();
    const fileType = fileName.split(".").pop();
    formData.append("fotoperfil", {
      uri: fotoperfil,
      name: fileName,
      type: `image/${fileType}`,
    });
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Foto de perfil */}
      <TouchableOpacity
        onPress={editando ? seleccionarImagen : null}
        activeOpacity={editando ? 0.7 : 1}
      >
        <Image source={{ uri: fotoperfil }} style={styles.profileImage} />
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

      {/* Fecha de nacimiento si existe */}
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
        onPress={editando ? guardarCambios : () => setEditando(true)}
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 60,
    paddingHorizontal: 20,
    alignItems: "center",
    backgroundColor: "#fff",
    flexGrow: 1,
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
  },
  editButtonText: {
    color: "#fff",
    marginLeft: 10,
    fontSize: 16,
  },
});
