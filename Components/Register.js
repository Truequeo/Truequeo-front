import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Image,
  ScrollView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import {
  ALERT_TYPE,
  Dialog,
  AlertNotificationRoot,
} from "react-native-alert-notification";
import { registerUser } from "../services/apiService";
import { generateUserCode, getCurrentLocation } from "../utils/appUtils";

export default function Register() {
  const [nombreusuario, setNombreUsuario] = useState("");
  const [celularusuario, setCelularUsuario] = useState("");
  const [ubicacionarticulo, setUbicacionArticulo] = useState("");
  const [fechanacimientousuario, setFechaNacimientoUsuario] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [fotoperfil, setFotoPerfil] = useState(null);
  const navigation = useNavigation();

  const [intereses, setIntereses] = useState(false);
  const [seleccionados, setSeleccionados] = useState([]);

  const handleSeleccionarFoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Se necesita permiso para acceder a la galería");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      setFotoPerfil(result.assets[0].uri);
    }
  };

  const onChangeFecha = (event, selectedDate) => {
    const currentDate = selectedDate || fechanacimientousuario;
    setShowDatePicker(Platform.OS === "ios");
    setFechaNacimientoUsuario(currentDate);
  };

  const handleObtenerUbicacionActual = async () => {
    const locationString = await getCurrentLocation(); // Llama a la función de utilidad
    if (locationString) {
      setUbicacionArticulo(locationString);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "";
    const dia = fecha.getDate().toString().padStart(2, "0");
    const mes = (fecha.getMonth() + 1).toString().padStart(2, "0");
    const año = fecha.getFullYear();
    return `${dia}/${mes}/${año}`;
  };

  const handleSiguienteRegistro = () => {
    if (
      !nombreusuario.trim() ||
      !celularusuario.trim() ||
      !ubicacionarticulo.trim() ||
      !fechanacimientousuario ||
      !fotoperfil
    ) {
      Dialog.show({
        type: ALERT_TYPE.WARNING,
        title: "Campos vacíos",
        textBody: "Por favor, llena todos los campos antes de continuar.",
        button: "Aceptar",
      });
      return;
    }
    setIntereses(true);
  };

  const handleRegistrarUsuario = async () => {
    if (seleccionados.length === 0) {
      Dialog.show({
        type: ALERT_TYPE.WARNING,
        title: "Intereses",
        textBody: "Por favor, selecciona al menos un interés.",
        button: "Aceptar",
      });
      return;
    }

    const codusuario = generateUserCode();

    const formData = new FormData();
    formData.append("codusuario", codusuario);
    formData.append("nombreusuario", nombreusuario);
    formData.append("celularusuario", celularusuario);
    formData.append("ubicacionarticulo", ubicacionarticulo);
    formData.append(
      "fechanacimientousuario",
      fechanacimientousuario.toISOString()
    );
    formData.append("intereses", JSON.stringify(seleccionados));

    const fileName = fotoperfil.split("/").pop();
    const fileType = fileName.split(".").pop();
    formData.append("fotoperfil", {
      uri: fotoperfil,
      name: fileName,
      type: `image/${fileType}`,
    });

    try {
      const { usuario: nuevoUsuario, token: nuevoToken } = await registerUser(
        formData
      );

      Dialog.show({
        type: ALERT_TYPE.SUCCESS,
        title: "Usuario creado",
        textBody: "Se creó el usuario correctamente.",
        button: "Aceptar",
        onPressButton: () => {
          Dialog.hide();
          navigation.replace("Add", {
            usuario: nuevoUsuario,
            token: nuevoToken,
          });
        },
      });
    } catch (error) {
      console.error("Error al registrar usuario:", error);
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: "Error",
        textBody: "No se pudo registrar el usuario. Intenta de nuevo.",
        button: "Aceptar",
      });
    }
  };

  const toggleCategoria = (categoria) => {
    setSeleccionados((prev) =>
      prev.includes(categoria)
        ? prev.filter((item) => item !== categoria)
        : [...prev, categoria]
    );
  };

  const categorias = [
    "Ropa y accesorios",
    "Tecnología",
    "Celulares y tablets",
    "Computadoras y laptops",
    "Libros y revistas",
    "Juguetes",
    "Videojuegos y consolas",
    "Electrodomésticos",
    "Herramientas y bricolaje",
    "Muebles",
    "Decoración y hogar",
    "Bicicletas y transporte",
    "Arte y manualidades",
    "Instrumentos musicales",
    "Cocina y utensilios",
    "Jardinería y plantas",
    "Ropa de bebé y maternidad",
    "Productos para mascotas",
    "Deportes y ejercicio",
    "Servicios para intercambiar",
  ];

  return (
    <AlertNotificationRoot>
      {!intereses && (
        <ScrollView contentContainerStyle={styles.scrollContentContainer}>
          <View style={styles.container}>
            <Text style={styles.title}>Registro</Text>
            <TextInput
              placeholder="Nombre de usuario"
              value={nombreusuario}
              onChangeText={setNombreUsuario}
              style={styles.input}
            />
            <TextInput
              placeholder="Celular"
              keyboardType="numeric"
              value={celularusuario}
              onChangeText={setCelularUsuario}
              style={styles.input}
            />
            <TouchableOpacity
              onPress={handleObtenerUbicacionActual}
              style={styles.locationButton}
            >
              <Text style={styles.locationButtonText}>
                Obtener ubicación actual
              </Text>
            </TouchableOpacity>
            {ubicacionarticulo ? (
              <Text style={styles.locationText}>
                Ubicación: {ubicacionarticulo}
              </Text>
            ) : null}

            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={styles.datePickerButton}
            >
              <Text style={styles.datePickerText}>
                Fecha de nacimiento: {formatearFecha(fechanacimientousuario)}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={fechanacimientousuario || new Date()}
                mode="date"
                display="default"
                onChange={onChangeFecha}
              />
            )}
            <TouchableOpacity
              onPress={handleSeleccionarFoto}
              style={styles.imageButton}
            >
              <Text style={styles.imageButtonText}>
                Seleccionar Foto de Perfil
              </Text>
            </TouchableOpacity>
            {fotoperfil && (
              <Image source={{ uri: fotoperfil }} style={styles.image} />
            )}
            <TouchableOpacity
              style={styles.boton}
              onPress={handleSiguienteRegistro}
            >
              <Text style={styles.botonTexto}>Siguiente</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
      {intereses && (
        <View style={styles.container}>
          <Text style={styles.title}>Elige tus intereses</Text>
          <Text style={styles.subtitle}>
            Recibe mejores sugerencias de trueques
          </Text>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.tagsContainer}>
              {categorias.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => toggleCategoria(cat)}
                  style={[
                    styles.tag,
                    seleccionados.includes(cat) && styles.tagSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.tagText,
                      seleccionados.includes(cat) && styles.tagTextSelected,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={handleRegistrarUsuario}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Registrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </AlertNotificationRoot>
  );
}

const styles = StyleSheet.create({
  scrollContentContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 20,
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center", // Esto puede entrar en conflicto con scrollContentContainer. Considerar si quieres centrar o desplazar.
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28, // Un poco más grande
    marginBottom: 30, // Más espacio
    textAlign: "center",
    fontWeight: "bold",
    color: "#333", // Un color más suave que el negro puro
  },
  input: {
    height: 50,
    borderColor: "#ddd", // Borde más suave
    borderWidth: 1,
    borderRadius: 8, // Bordes más redondeados
    paddingHorizontal: 15, // Más padding
    marginBottom: 15,
    fontSize: 16,
  },
  datePickerButton: {
    padding: 15, // Más padding
    backgroundColor: "#f0f0f0", // Fondo más claro
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1, // Borde para que se vea como input
    borderColor: "#ddd",
  },
  datePickerText: {
    color: "#555", // Color de texto para que se vea
    fontSize: 16,
  },
  imageButton: {
    backgroundColor: "#4a90e2", // Un azul más amigable
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  imageButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold", // Negrita
    fontSize: 16,
  },
  image: {
    width: 120, // Más grande
    height: 120, // Más grande
    borderRadius: 60,
    alignSelf: "center",
    marginBottom: 20, // Más espacio
    borderWidth: 2, // Borde para la foto
    borderColor: "#4a90e2", // Color de borde
  },
  boton: {
    backgroundColor: "#6a0dad", // Un púrpura vibrante
    padding: 18, // Más padding
    borderRadius: 30, // Más redondeado
    marginTop: 20,
    elevation: 3, // Sombra para Android
    shadowColor: "#000", // Sombra para iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  botonTexto: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 18, // Más grande
  },
  locationButton: {
    backgroundColor: "#28a745", // Un verde para la ubicación
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  locationButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  locationText: {
    textAlign: "center",
    marginBottom: 15,
    color: "#666",
    fontSize: 14,
  },
  subtitle: {
    fontSize: 18, // Más grande
    color: "#6b7280",
    marginBottom: 25, // Más espacio
    textAlign: "center",
  },
  scrollContainer: {
    paddingBottom: 20,
    // flexGrow: 1, // Esto es si la ScrollView es la principal, aquí es contenido
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center", // Centra los tags
    gap: 10, // Espacio entre tags
  },
  tag: {
    paddingHorizontal: 18, // Más padding
    paddingVertical: 12, // Más padding
    borderRadius: 30,
    backgroundColor: "#f0f8ff", // Un azul muy claro
    borderWidth: 1,
    borderColor: "#a8d8ff", // Borde azul claro
    marginBottom: 10,
  },
  tagSelected: {
    backgroundColor: "#4a90e2", // Azul seleccionado
    borderColor: "#4a90e2",
  },
  tagText: {
    color: "#333", // Texto oscuro
    fontSize: 15, // Un poco más grande
    fontWeight: "500", // Semi-bold
  },
  tagTextSelected: {
    color: "#fff",
    fontWeight: "bold", // Más negrita cuando seleccionado
  },
  buttonContainer: {
    marginTop: 30, // Más espacio
    width: "100%", // Ocupa todo el ancho
  },
  button: {
    backgroundColor: "#6a0dad", // Mismo púrpura que el botón de registro
    borderRadius: 8,
    paddingVertical: 16, // Más padding
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold", // Más negrita
    textAlign: "center",
    fontSize: 18, // Más grande
  },
});
