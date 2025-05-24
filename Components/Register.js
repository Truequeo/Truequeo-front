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
import axios from "axios";
import {
  ALERT_TYPE,
  Dialog,
  AlertNotificationRoot,
} from "react-native-alert-notification";
import { urlBackend } from "./VariablesEntorno";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { Button } from "react-native";

export default function Register() {
  const [nombreusuario, setNombreUsuario] = useState("");
  const [celularusuario, setCelularUsuario] = useState("");
  const [ubicacionarticulo, setUbicacionArticulo] = useState("");
  const [fechanacimientousuario, setFechaNacimientoUsuario] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [fotoperfil, setFotoPerfil] = useState(null);
  const navigation = useNavigation();

  const seleccionarFoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Se necesita permiso para acceder a la galería");
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
  const obtenerUbicacionActual = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Dialog.show({
        type: ALERT_TYPE.WARNING,
        title: "Permiso denegado",
        textBody: "Se requiere permiso para acceder a la ubicación",
        button: "Aceptar",
      });
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;
    setUbicacionArticulo(`${latitude},${longitude}`);
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "";
    const dia = fecha.getDate().toString().padStart(2, "0");
    const mes = (fecha.getMonth() + 1).toString().padStart(2, "0");
    const año = fecha.getFullYear();
    return `${dia}/${mes}/${año}`;
  };

  const siguiente = () => {
    if (
      !nombreusuario.trim() ||
      !celularusuario.trim() ||
      !ubicacionarticulo.trim() ||
      !fechanacimientousuario ||
      !fotoperfil
    ) {
      Dialog.show({
        type: ALERT_TYPE.WARNING,
        title: "Llenar campo",
        textBody: "Llenar los campos vacíos",
        button: "Aceptar",
      });
      return;
    }
    setIntereses(true);
  };

  const registrarUsuario = async () => {
    const generarCodigoUsuario = () => {
      const timestamp = Date.now().toString(36);
      const random = Math.random().toString(36).substring(2, 6);
      return `USR-${timestamp}-${random}`.toUpperCase();
    };

    const codusuario = generarCodigoUsuario();

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
    console.log(seleccionados)

    try {
      const response = await axios.post(
        urlBackend + "user/createUser",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log(response.data)
      const { usuario, token } = response.data;
      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("codUsuario", usuario.codusuario);
      Dialog.show({
        type: ALERT_TYPE.SUCCESS,
        title: "Usuario creado",
        textBody: "Se creó el usuario correctamente",
        button: "Aceptar",
        onPressButton: () => {
          Dialog.hide();
          navigation.replace("Add", { usuario, token });
        },
      });
    } catch (error) {
      console.error("Error al registrar usuario:", error);
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: "Error",
        textBody: "Error al registrar el usuario",
        button: "Aceptar",
      });
    }
  };
  const [intereses, setIntereses] = useState(false);
  const [seleccionados, setSeleccionados] = useState([]);

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
    <>
      {!intereses && (
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
            onPress={obtenerUbicacionActual}
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

          <TextInput
            onPress={() => setShowDatePicker(true)}
            style={styles.datePickerButton}
          >
            <Text style={styles.datePickerText}>
              Fecha de nacimiento: {formatearFecha(fechanacimientousuario)}
            </Text>
          </TextInput>
          {showDatePicker && (
            <DateTimePicker
              value={fechanacimientousuario || new Date()}
              mode="date"
              display="default"
              onChange={onChangeFecha}
            />
          )}
          <TouchableOpacity
            onPress={seleccionarFoto}
            style={styles.imageButton}
          >
            <Text style={styles.imageButtonText}>
              Seleccionar Foto de Perfil
            </Text>
          </TouchableOpacity>
          {fotoperfil && (
            <Image source={{ uri: fotoperfil }} style={styles.image} />
          )}
          <TouchableOpacity style={styles.boton} onPress={siguiente}>
            <Text style={styles.botonTexto}>Registrarse</Text>
          </TouchableOpacity>
        </View>
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
          <View  style={styles.buttonContainer}>
            <TouchableOpacity onPress={registrarUsuario} style={styles.button}>
              <Text style={styles.buttonText}>Siguiente</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    marginBottom: 25,
    textAlign: "center",
    fontWeight: "bold",
    color: "#000",
  },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  datePickerButton: {
    padding: 12,
    backgroundColor: "#eee",
    borderRadius: 5,
    marginBottom: 15,
  },
  datePickerText: {
    color: "#333",
  },
  imageButton: {
    backgroundColor: "#000",
    padding: 12,
    borderRadius: 5,
    marginBottom: 15,
  },
  imageButtonText: {
    color: "#fff",
    textAlign: "center",
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: "center",
    marginBottom: 15,
  },
  boton: {
    backgroundColor: "#000",
    padding: 15,
    borderRadius: 25,
  },
  botonTexto: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
  locationButton: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 5,
    marginBottom: 15,
  },
  locationButtonText: {
    color: "#fff",
    textAlign: "center",
  },
  locationText: {
    textAlign: "center",
    marginBottom: 15,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 20,
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  tag: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 30,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#d1d5db",
    marginBottom: 10,
  },
  tagSelected: {
    backgroundColor: "#ec4899",
    borderColor: "#ec4899",
  },
  tagText: {
    color: "#111827",
    fontSize: 14,
  },
  tagTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
  buttonContainer: {
    marginTop: 20,
  },
  button: {
    backgroundColor: "#ec4899",
    borderRadius: 8,
    paddingVertical: 14,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
    fontSize: 16,
  },
});
