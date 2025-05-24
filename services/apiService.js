// src/services/apiService.js
import { urlBackend } from "../Components/VariablesEntorno";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = urlBackend;

const generateArticleCode = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  return `ART-${timestamp}-${random}`.toUpperCase();
};

export const createNewArticle = async (articleData, photosUris, codUsuario) => {
  const codarticulo = generateArticleCode();

  const formData = new FormData();
  formData.append("codarticulo", codarticulo);
  formData.append("codusuario", codUsuario);
  formData.append("nombrearticulo", articleData.nombrearticulo);
  formData.append("detallearticulo", articleData.detallearticulo);
  formData.append("estadoarticulo", articleData.estadoarticulo);

  const categoriasArray = Array.isArray(articleData.categorias)
    ? articleData.categorias
    : articleData.categorias.split(",").map((c) => c.trim());
  formData.append("categorias", JSON.stringify(categoriasArray));

  photosUris.forEach((uri) => {
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
      `${BASE_URL}articulo/createArticulo`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error al crear el artículo en el servicio:", error);
    throw error;
  }
};

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const errorMessage =
      errorBody?.message ||
      `Error en la solicitud: ${response.status} ${response.statusText}`;
    throw new Error(errorMessage);
  }
  return response.json();
};

export const getUserDataWithToken = async (codUsuario, token) => {
  try {
    const response = await axios.get(`${BASE_URL}user/getUser/${codUsuario}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error al obtener datos del usuario ${codUsuario}:`, error);
    throw error;
  }
};

export const updateProfile = async (formData) => {
  try {
    const response = await axios.put(`${BASE_URL}user/updateUser`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.usuario;
  } catch (error) {
    console.error("Error al actualizar el perfil:", error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("codUsuario");
    console.log("Sesión cerrada exitosamente.");
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    throw error;
  }
};

export const fetchUserData = async (userId) => {
  try {
    const response = await fetch(`${BASE_URL}/users/${userId}`);
    return handleResponse(response);
  } catch (error) {
    console.error(`Error al obtener datos del usuario ${userId}:`, error);
    throw error;
  }
};

export const updateArticle = async (articleId, updatedData) => {
  try {
    const response = await fetch(`${BASE_URL}/articles/${articleId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedData),
    });
    return handleResponse(response);
  } catch (error) {
    console.error(`Error al actualizar el artículo ${articleId}:`, error);
    throw error;
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${BASE_URL}user/createUser`, userData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    const { usuario, token } = response.data;
    await AsyncStorage.setItem("token", token);
    await AsyncStorage.setItem("codUsuario", usuario.codusuario);
    return { usuario, token };
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    throw error;
  }
};

export const sendVerificationCode = async (phoneNumber) => {
  try {
    const fullPhoneNumber = `+591${phoneNumber}`;
    await axios.post(`${BASE_URL}auth/enviarCodigo/${fullPhoneNumber}`);
  } catch (error) {
    throw error;
  }
};

export const verifyLoginCode = async (phoneNumber, code) => {
  try {
    const fullPhoneNumber = `+591${phoneNumber}`;
    const response = await axios.post(`${BASE_URL}auth/verificarCodigo`, {
      phone: fullPhoneNumber,
      code: code,
    });

    const { usuario, token } = response.data;

    if (!usuario) {
      throw new Error("No se encontró el usuario después de la verificación.");
    }

    await AsyncStorage.setItem("token", token);
    await AsyncStorage.setItem("codUsuario", usuario.codusuario);

    return { usuario, token };
  } catch (error) {
    throw error;
  }
};

export const getUserChats = async (codUsuario) => {
  try {
    const response = await axios.get(`${BASE_URL}chat/mensajes/${codUsuario}`);
    return response.data;
  } catch (error) {
    console.error(
      `Error al obtener chats para el usuario ${codUsuario}:`,
      error
    );
    throw error;
  }
};

export const getConversationMessages = async (
  codArticulo,
  codRemitente,
  codReceptor
) => {
  try {
    const response = await axios.get(
      `${BASE_URL}chat/mensajes/${codArticulo}/${codRemitente}/${codReceptor}`
    );

    return response.data;
  } catch (error) {
    console.error(
      "Error al obtener mensajes de la conversación en el servicio:",
      error
    );
    throw error;
  }
};

export const sendMessage = async (messageData) => {
  try {
    const response = await axios.post(`${BASE_URL}chat/mensajes`, messageData);
    return response.data;
  } catch (error) {
    console.error("Error al enviar el mensaje en el servicio:", error);
    throw error;
  }
};

export const getArticles = async (codUsuario, offset, limit) => {
  try {
    const response = await axios.get(
      `${BASE_URL}articulo/getArticulo/${codUsuario}?offset=${offset}&limit=${limit}`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error al obtener artículos 'Todo' para el usuario ${codUsuario}:`,
      error
    );
    throw error;
  }
};

export const getNearbyArticles = async (
  lat,
  lon,
  codUsuario,
  offset,
  limit
) => {
  try {
    const response = await axios.get(`${BASE_URL}articulo/getArticuloCerca`, {
      params: {
        lat,
        lon,
        codusuario: codUsuario,
        offset,
        limit,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error al obtener artículos 'Cerca':", error);
    throw error;
  }
};

export const getRecommendedArticles = async (codArticulo) => {
  try {
    const response = await axios.get(
      `${BASE_URL}articulo/getArticuloRecomendado/${codArticulo}`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error al obtener artículos 'Recomendado' para el artículo ${codArticulo}:`,
      error
    );
    throw error;
  }
};
