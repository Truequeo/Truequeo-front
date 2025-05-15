import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { urlBackend } from "./VariablesEntorno";
import axios from "axios";

const SplashScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const codUsuario = await AsyncStorage.getItem("codUsuario");

        if (token && codUsuario) {
          const response = await axios.get(
            `${urlBackend}user/getUser/${codUsuario}`
          );
          const usuario = response.data;
          console.log(usuario)
          navigation.replace("Home", { usuario, token });
        } else {
          navigation.replace("Login");
        }
      } catch (error) {
        console.error("Error autenticando:", error);
        navigation.replace("Login");
      }
    };

    checkAuth();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ActivityIndicator size="large" />
    </View>
  );
};

export default SplashScreen;
