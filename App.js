// App.js
import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { ActivityIndicator, View, StyleSheet } from "react-native"; // Para el indicador de carga

import { AuthContext, AuthProvider } from "./src/context/AuthContext"; // Importa el contexto
import { AuthStackScreen, AppTabsScreen } from "./src/navigator/AppNavigator"; // Importa los navegadores placeholders

export default function App() {
  return (
    // Envuelve toda la aplicación con el Proveedor de Autenticación
    <AuthProvider>
      <RootNavigator /> {/* Un componente que decidirá qué navegador mostrar */}
    </AuthProvider>
  );
}

function RootNavigator() {
  // Accede al estado de autenticación desde el contexto
  const { userToken, isLoading } = useContext(AuthContext);

  // Si está cargando, muestra un indicador de carga
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Basado en userToken, decide qué navegador mostrar
  return (
    <NavigationContainer>
      {userToken == null ? (
        // Si no hay token, muestra el flujo de autenticación
        <AuthStackScreen />
      ) : (
        // Si hay token, muestra el flujo principal de la app
        <AppTabsScreen />
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
