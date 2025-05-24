// src/utils/appUtils.js
import * as Location from "expo-location";
import { ALERT_TYPE, Dialog } from "react-native-alert-notification";

/**
 * Genera un código de usuario único basado en la marca de tiempo y un número aleatorio.
 * @returns {string} El código de usuario generado.
 */
export const generateUserCode = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  return `USR-${timestamp}-${random}`.toUpperCase();
};

/**
 * Obtiene la ubicación actual del dispositivo y la devuelve como un objeto de coordenadas.
 * Muestra una alerta si los permisos no son concedidos o si la ubicación no se puede obtener.
 * @returns {Promise<{latitude: number, longitude: number}|null>} Una promesa que resuelve con un objeto {latitude, longitude} o null si hay un error.
 */
export const getCurrentLocation = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    Dialog.show({
      type: ALERT_TYPE.WARNING,
      title: "Permiso denegado",
      textBody:
        "Se requiere permiso para acceder a la ubicación para utilizar la función 'Cerca'.",
      button: "Aceptar",
    });
    return null;
  }

  try {
    // Usamos mayor precisión ya que es para buscar artículos cercanos
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    const { latitude, longitude } = location.coords;
    return { latitude, longitude }; // Devolvemos un objeto con latitud y longitud
  } catch (error) {
    console.error("Error al obtener la ubicación actual:", error);
    Dialog.show({
      type: ALERT_TYPE.DANGER,
      title: "Error de ubicación",
      textBody:
        "No se pudo obtener la ubicación actual. Por favor, verifica la configuración de tu dispositivo.",
      button: "Aceptar",
    });
    return null;
  }
};
