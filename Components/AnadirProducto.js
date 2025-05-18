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

export default function AnadirProducto() {
  const route = useRoute();
  const { usuario, token } = route.params;
  const codusuario = usuario.codusuario;
  const navigation = useNavigation();
  const [nombrearticulo, setNombreArticulo] = useState("");
  const [detallearticulo, setDetalleArticulo] = useState("");
  const [estadoarticulo, setEstadoArticulo] = useState("activo");
  const [fotoarticulo, setFotoArticulo] = useState(null); 
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

  const seleccionarImagen = async () => {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permiso.status !== "granted") {
      Alert.alert("Permiso requerido", "Se necesita acceso a tus fotos");
      return;
    }
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });
    if (!resultado.cancelled) {
      setFotoArticulo(resultado.assets[0].uri);
    }
  };

  const enviarProducto = async () => {
    if (!fotoarticulo) {
      Alert.alert("Imagen faltante", "Por favor selecciona una imagen");
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
    const fileName = fotoarticulo.split("/").pop();
    const fileType = fileName.split(".").pop();
    formData.append("fotoarticulo", {
      uri: fotoarticulo,
      name: fileName,
      type: `image/${fileType}`,
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
      console.log(usuarioActualizado)
      navigation.navigate("Home", { usuario: usuarioActualizado, token });
      Dialog.show({
        type: ALERT_TYPE.SUCCESS,
        title: "Artículo creado",
        textBody: "Se creó el artículo correctamente",
        button: "Aceptar",
        onPressButton: () => {
          Dialog.hide();
        },
      });
    } catch (error) {
      console.error("Error al registrar artículo:", error.stack);
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
      <View style={styles.containerImagen}>
        {fotoarticulo ? (
          <Image
            source={{ uri: fotoarticulo }}
            style={styles.imagen}
            resizeMode="cover"
          />
        ) : (
          <Text>No se ha seleccionado imagen</Text>
        )}
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
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e0e0e0",
    height: 200,
    borderRadius: 10,
    marginBottom: 30,
  },
  imagen: {
    width: 150,
    height: 150,
    borderRadius: 10,
  },
  containerBotones: {
    justifyContent: "center",
  },
});
