// src/navigation/AppNavigator.js
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"; // Si quieres usar pestañas

import { Login } from "../components/Login";
import { Home } from "../components/Home";
import { ProfileSetupScreen } from "../components/ProfileSetupScreen";
import { RegistrationScreen } from "../components/RegistrationScreen";
import { RegisterItemScreen } from "../components/RegisterItemScreen";
// Importa aquí tus otras pantallas a medida que las crees

// Placeholders para los navegadores
const AuthStack = createNativeStackNavigator();
const AppTabs = createBottomTabNavigator(); // O const AppStack = createNativeStackNavigator(); si prefieres un stack principal

// Navegador de Autenticación
function AuthStackScreen() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={Login} />
      <AuthStack.Screen name="Registration" component={RegistrationScreen} />
      {/* <AuthStack.Screen name="PhoneVerification" component={PhoneVerificationScreen} /> */}
      <AuthStack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
      <AuthStack.Screen name="RegisterItem" component={RegisterItemScreen} />
    </AuthStack.Navigator>
  );
}

// Navegador Principal de la App (ejemplo con pestañas)
function AppTabsScreen() {
  return (
    <AppTabs.Navigator screenOptions={{ headerShown: true }}>
      <AppTabs.Screen name="Home" component={Home} />
      {/* Esta será tu MatchingScreen */}
      {/* Agrega aquí Chat, Notifications, Profile, MyMatchingList cuando los crees */}
      {/* <AppTabs.Screen name="Chat" component={ChatScreen} /> */}
      {/* <AppTabs.Screen name="Notifications" component={NotificationsScreen} /> */}
      {/* <AppTabs.Screen name="Profile" component={ProfileScreen} /> */}
      {/* <AppTabs.Screen name="MyMatches" component={MyMatchingListScreen} /> */}
    </AppTabs.Navigator>
  );
}

// Puedes exportar ambos si quieres usarlos directamente,
// pero en App.js decidiremos cuál mostrar.
export { AuthStackScreen, AppTabsScreen };
