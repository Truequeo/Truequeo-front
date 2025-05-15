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

export default function AñadirProducto() {
  const route = useRoute();
  const { usuario, token } = route.params;
  const codusuario = usuario.codusuario;
  const navigation = useNavigation();

  const [codarticulo, setCodArticulo] = useState("");
  const [nombrearticulo, setNombreArticulo] = useState("");
  const [detallearticulo, setDetalleArticulo] = useState("");
  const [estadoarticulo, setEstadoArticulo] = useState("activo");
  const [fotoarticulo, setFotoArticulo] = useState(null); // URL local
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

  const enviarProducto = () => {
    if (!fotoarticulo) {
      Alert.alert("Imagen faltante", "Por favor selecciona una imagen");
      return;
    }
    const datos = {
      codarticulo,
      codusuario,
      nombrearticulo,
      detallearticulo,
      estadoarticulo,
      fotoarticulo,
      categorias: categorias.split(",").map((c) => c.trim()),
    };
    axios
      .post(urlBackend + "articulo/createArticulo", datos)
      .then((response) => {
        Dialog.show({
          type: ALERT_TYPE.SUCCESS,
          title: "Articulo creado",
          textBody: "Se creo articulo",
          button: "Aceptar",
          onPressButton: () => {
            Dialog.hide();
            navigation.replace("Home", { usuario, token });
          },
        });
      })
      .catch((error) => {
        console.error("Error al registrar el usuario:", error);
        Dialog.show({
          type: ALERT_TYPE.DANGER,
          title: "Error",
          textBody: "Error",
          button: "Aceptar",
        });
      });
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.containerTitulo}>
        <Text style={styles.textoTitulo}>Añadir producto</Text>
      </View>
      <TextInput
        style={styles.input}
        placeholder="Código del artículo"
        value={codarticulo}
        onChangeText={setCodArticulo}
      />
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
