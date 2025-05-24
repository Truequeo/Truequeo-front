import React, { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

import { getUserDataWithToken } from "../services/apiService";

const SplashScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const codUsuario = await AsyncStorage.getItem("codUsuario");

        if (token && codUsuario) {
          const usuario = await getUserDataWithToken(codUsuario, token);
          console.log("Usuario autenticado:", usuario);
          navigation.replace("Home", { usuario, token });
        } else {
          navigation.replace("Login");
        }
      } catch (error) {
        console.error(
          "Error en la autenticación o al obtener datos del usuario:",
          error
        );
        navigation.replace("Login");
      }
    };

    checkAuth();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0000ff" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});

export default SplashScreen;
