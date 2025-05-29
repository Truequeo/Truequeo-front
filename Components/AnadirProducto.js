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
  TouchableOpacity,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import {
  useRoute,
  useNavigation,
  useFocusEffect,
} from "@react-navigation/native";
import {
  ALERT_TYPE,
  Dialog,
  AlertNotificationRoot,
} from "react-native-alert-notification";
import { BackHandler } from "react-native";
import { Picker } from "@react-native-picker/picker";
import Icon from "react-native-vector-icons/Ionicons";
import { createNewArticle } from "../services/apiService";

export default function AnadirProducto() {
  const route = useRoute();
  const { usuario, token } = route.params;
  const codusuario = usuario.codusuario;
  const navigation = useNavigation();

  const [nombrearticulo, setNombreArticulo] = useState("");
  const [detallearticulo, setDetalleArticulo] = useState("");
  const [estadoarticulo, setEstadoArticulo] = useState("");
  const [categorias, setCategorias] = useState("");

  const [fotosArticulo, setFotosArticulo] = useState([]);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        Alert.alert(
          "Salir sin guardar",
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
    }, [navigation, usuario, token])
  );

  const seleccionarImagen = async () => {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permiso.status !== "granted") {
      Alert.alert(
        "Permiso requerido",
        "Se necesita acceso a tus fotos para seleccionar imágenes del artículo."
      );
      return;
    }
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
      selectionLimit: 4,
    });
    if (!resultado.canceled) {
      const nuevasImagenes = resultado.assets
        .map((asset) => asset.uri)
        .slice(0, 4);
      setFotosArticulo(nuevasImagenes);
    }
  };
  const handleEnviarProducto = async () => {
    if (fotosArticulo.length === 0) {
      Alert.alert(
        "Imágenes requeridas",
        "Por favor selecciona al menos una imagen para tu artículo."
      );
      return;
    }
    if (
      !nombrearticulo.trim() ||
      !detallearticulo.trim() ||
      !estadoarticulo.trim() ||
      !categorias.trim()
    ) {
      Alert.alert(
        "Campos vacíos",
        "Por favor, completa todos los campos del artículo."
      );
      return;
    }
    setLoading(true);
    const articleData = {
      nombrearticulo,
      detallearticulo,
      estadoarticulo,
      categorias,
    };
    try {
      const updatedUser = await createNewArticle(
        articleData,
        fotosArticulo,
        codusuario
      );
      Dialog.show({
        type: ALERT_TYPE.SUCCESS,
        title: "Artículo Creado",
        textBody: "Tu artículo se registró correctamente.",
        button: "Aceptar",
        onPressButton: () => {
          Dialog.hide();
          navigation.replace("Home", { usuario: updatedUser, token });
        },
      });
      setNombreArticulo("");
      setDetalleArticulo("");
      setEstadoArticulo("");
      setCategorias("");
      setFotosArticulo([]);
    } catch (error) {
      console.error("Error al registrar artículo desde el componente:", error);
      const errorMessage =
        error.response?.data?.error ||
        "No se pudo registrar el artículo. Intenta de nuevo.";
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: "Error",
        textBody: errorMessage,
        button: "Aceptar",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertNotificationRoot>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.replace("Home", { usuario, token })}
            style={styles.backButton}
          >
            <Icon name="arrow-back" size={30} color="#000" />
          </TouchableOpacity>
          <Text style={styles.textoTitulo}>Añadir producto</Text>
          <View style={{ width: 30 }} />
        </View>

        <TextInput
          style={styles.input}
          placeholder="Nombre del artículo"
          placeholderTextColor="#888"
          value={nombrearticulo}
          onChangeText={setNombreArticulo}
        />
        <TextInput
          style={styles.inputMultiline}
          placeholder="Detalle del artículo"
          placeholderTextColor="#888"
          value={detallearticulo}
          onChangeText={setDetalleArticulo}
          multiline
          numberOfLines={4}
        />
        <TextInput
          style={styles.input}
          placeholder="Categorías (separadas por coma)"
          placeholderTextColor="#888"
          value={categorias}
          onChangeText={setCategorias}
        />
        <Text style={styles.label}>Estado del artículo:</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={estadoarticulo}
            onValueChange={(itemValue) => setEstadoArticulo(itemValue)}
            mode="dropdown"
            itemStyle={styles.pickerItem}
          >
            <Picker.Item
              label="Seleccionar estado"
              value=""
              style={styles.pickerPlaceholder}
            />
            <Picker.Item label="Nuevo" value="Nuevo" />
            <Picker.Item label="Seminuevo" value="Seminuevo" />
            <Picker.Item label="Usado" value="Usado" />{" "}
          </Picker>
        </View>

        <TouchableOpacity
          style={styles.selectImageButton}
          onPress={seleccionarImagen}
        >
          <Text style={styles.selectImageButtonText}>
            Seleccionar Fotos ({fotosArticulo.length}/4)
          </Text>
          <Icon
            name="image-outline"
            size={20}
            color="#fff"
            style={styles.selectImageIcon}
          />
        </TouchableOpacity>

        <View style={styles.containerImagen}>
          {fotosArticulo.length > 0 ? (
            <View style={styles.imagenGrid}>
              {fotosArticulo.map((uri, index) => (
                <Image key={index} source={{ uri }} style={styles.imagen} />
              ))}
            </View>
          ) : (
            <Text style={styles.placeholderText}>
              No hay imágenes seleccionadas.
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleEnviarProducto}
          disabled={loading}
        >
          {loading ? (
            <Text style={styles.submitButtonText}>Cargando...</Text>
          ) : (
            <Text style={styles.submitButtonText}>Publicar Artículo</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </AlertNotificationRoot>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 20,
    backgroundColor: "#f5f5f5",
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 25,
    paddingTop: 10, // Espacio superior para el safe area
  },
  backButton: {
    padding: 5,
  },
  textoTitulo: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  input: {
    height: 50,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: "#fff",
    fontSize: 16,
    color: "#333",
  },
  inputMultiline: {
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10, // Padding vertical para multilínea
    marginBottom: 15,
    backgroundColor: "#fff",
    fontSize: 16,
    color: "#333",
    minHeight: 100, // Altura mínima para el área de texto
    textAlignVertical: "top", // Para que el texto comience desde arriba
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "600",
    color: "#555",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    backgroundColor: "#fff",
    marginBottom: 20,
    overflow: "hidden", // Para que el borde redondeado se aplique al contenido
  },
  pickerItem: {
    fontSize: 16,
    color: "#333",
  },
  pickerPlaceholder: {
    color: "#888", // Color para el texto del placeholder
  },
  selectImageButton: {
    backgroundColor: "#a864ff",
    padding: 15,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  selectImageButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 10,
  },
  selectImageIcon: {
    color: "#fff",
  },
  containerImagen: {
    backgroundColor: "#e0e0e0",
    minHeight: 180, // Altura mínima un poco menor
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
    gap: 10, // Espacio entre imágenes
  },
  imagen: {
    width: 80, // Imágenes un poco más pequeñas para que quepan más en la fila
    height: 80,
    borderRadius: 8, // Bordes un poco menos redondeados
    margin: 5, // Margen alrededor de cada imagen
  },
  placeholderText: {
    color: "#666",
    fontSize: 16,
    textAlign: "center",
  },
  submitButton: {
    backgroundColor: "#6a0dad", // Color de botón principal
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
