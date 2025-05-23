import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Button,
  Image,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { useRoute } from "@react-navigation/native";
import { urlBackend } from "./VariablesEntorno";
import {
  ALERT_TYPE,
  Dialog,
  AlertNotificationRoot,
} from "react-native-alert-notification";
import { useNavigation } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";
import { BackHandler } from "react-native";
import { Picker } from "@react-native-picker/picker";

export default function AnadirProducto() {
  const route = useRoute();
  const { usuario, token } = route.params;
  const codusuario = usuario.codusuario;
  const navigation = useNavigation();
  const [nombrearticulo, setNombreArticulo] = useState("");
  const [detallearticulo, setDetalleArticulo] = useState("");
  const [estadoarticulo, setEstadoArticulo] = useState("");
  const [categorias, setCategorias] = useState("");

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        Alert.alert(
          "Confirmación",
          "¿Estás seguro de que deseas salir sin registrar el artículo?",
          [
            {
              text: "Cancelar",
              onPress: () => null,
              style: "cancel",
            },
            {
              text: "Sí, salir",
              onPress: () => navigation.replace("Home", { usuario, token }),
            },
          ]
        );
        return true;
      };
      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );
      return () => backHandler.remove();
    }, [navigation])
  );

  const [fotosArticulo, setFotosArticulo] = useState([]);

  const seleccionarImagen = async () => {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permiso.status !== "granted") {
      Alert.alert("Permiso requerido", "Se necesita acceso a tus fotos");
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
      selectionLimit: 3,
    });

    if (!resultado.canceled) {
      const nuevasImagenes = resultado.assets.map((asset) => asset.uri);
      setFotosArticulo(nuevasImagenes.slice(0, 3));
    }
  };

  const enviarProducto = async () => {
    if (fotosArticulo.length === 0) {
      Alert.alert(
        "Imagen faltante",
        "Por favor selecciona al menos una imagen"
      );
      return;
    }

    const generarCodigoArticulo = () => {
      const timestamp = Date.now().toString(36);
      const random = Math.random().toString(36).substring(2, 6);
      return `ART-${timestamp}-${random}`.toUpperCase();
    };

    const codarticulo = generarCodigoArticulo();
    const formData = new FormData();

    formData.append("codarticulo", codarticulo);
    formData.append("codusuario", codusuario);
    formData.append("nombrearticulo", nombrearticulo);
    formData.append("detallearticulo", detallearticulo);
    formData.append("estadoarticulo", estadoarticulo);
    formData.append(
      "categorias",
      categorias.split(",").map((c) => c.trim())
    );

    fotosArticulo.forEach((uri, index) => {
      const fileName = uri.split("/").pop();
      const fileType = fileName.split(".").pop();
      formData.append("fotoarticulo", {
        uri,
        name: fileName,
        type: `image/${fileType}`,
      });
    });

    try {
      const response = await axios.post(
        urlBackend + "articulo/createArticulo",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      const usuarioActualizado = response.data;
      navigation.navigate("Home", { usuario: usuarioActualizado, token });
      Dialog.show({
        type: ALERT_TYPE.SUCCESS,
        title: "Artículo creado",
        textBody: "Se creó el artículo correctamente",
        button: "Aceptar",
      });
    } catch (error) {
      console.error("Error al registrar artículo:", error);
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: "Error",
        textBody: "Error al registrar el artículo",
        button: "Aceptar",
      });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.containerTitulo}>
        <Text style={styles.textoTitulo}>Añadir producto</Text>
      </View>
      <TextInput
        style={styles.input}
        placeholder="Nombre del artículo"
        value={nombrearticulo}
        onChangeText={setNombreArticulo}
      />
      <TextInput
        style={styles.input}
        placeholder="Detalle del artículo"
        value={detallearticulo}
        onChangeText={setDetalleArticulo}
      />
      <TextInput
        style={styles.input}
        placeholder="Categorías (separadas por coma)"
        value={categorias}
        onChangeText={setCategorias}
      />
      <Text style={styles.label}>Estado del artículo</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={estadoarticulo}
          onValueChange={(itemValue) => setEstadoArticulo(itemValue)}
          mode="dropdown"
        >
          <Picker.Item label="Seleccionar" value="" />
          <Picker.Item label="Nuevo" value="Nuevo" />
          <Picker.Item label="Seminuevo" value="Seminuevo" />
          <Picker.Item label="Viejo" value="Viejo" />
        </Picker>
      </View>
      <View style={styles.containerImagen}>
        <View style={styles.imagenGrid}>
          {fotosArticulo.map((uri, index) => (
            <Image key={index} source={{ uri }} style={styles.imagen} />
          ))}
        </View>
      </View>

      <View style={styles.containerBotones}>
        <Button title="Seleccionar imagen" onPress={seleccionarImagen} />
        <View style={{ height: 10 }} />
        <Button title="Cargar producto" onPress={enviarProducto} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 20,
    backgroundColor: "#f5f5f5",
    flexGrow: 1,
  },
  containerTitulo: {
    alignItems: "center",
    marginBottom: 20,
  },
  textoTitulo: {
    fontSize: 28,
    fontWeight: "bold",
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  containerImagen: {
    backgroundColor: "#e0e0e0",
    minHeight: 200,
    borderRadius: 10,
    marginBottom: 30,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  imagenGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10, 
  },
  imagen: {
    width: 100,
    height: 100,
    borderRadius: 10,
    margin: 5,
  },

  containerBotones: {
    justifyContent: "center",
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: "bold",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
    marginBottom: 15,
  },
});
