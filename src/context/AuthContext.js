// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useMemo } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Necesitas instalar esta librería

// 1. Crear el Contexto
export const AuthContext = createContext();

// 2. Crear el Proveedor del Contexto
export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(false); // Aquí guardaremos un token o indicador de que el usuario está logueado

  // Efecto para cargar el token al iniciar la app
  useEffect(() => {
    const loadToken = async () => {
      try {
        // Intentar obtener el token del almacenamiento local
        const token = await AsyncStorage.getItem("userToken");
        if (token) {
          // Aquí podrías añadir lógica para validar si el token es válido/no expirado
          setUserToken(token);
        }
        setIsLoading(false); // La carga inicial ha terminado
      } catch (error) {
        console.error("Error loading auth token", error);
        setIsLoading(false);
      }
    };
    loadToken();
  }, []); // Se ejecuta solo una vez al montar el componente

  // Funciones para iniciar y cerrar sesión (las usaremos luego)
  const authContext = useMemo(
    () => ({
      signIn: async (token) => {
        // Lógica para iniciar sesión
        setIsLoading(true);
        await AsyncStorage.setItem("userToken", token);
        setUserToken(token);
        setIsLoading(false);
      },
      signOut: async () => {
        // Lógica para cerrar sesión
        setIsLoading(true);
        await AsyncStorage.removeItem("userToken");
        setUserToken(null);
        setIsLoading(false);
      },
      userToken,
      isLoading,
    }),
    [userToken, isLoading]
  ); // Recalcula solo si userToken o isLoading cambian

  // 3. Proveer el estado y las funciones a los componentes hijos
  return (
    <AuthContext.Provider value={authContext}>{children}</AuthContext.Provider>
  );
};
