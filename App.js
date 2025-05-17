import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Login from "./Components/Login";
import Home from "./Components/Home";
import Register from "./Components/Register";
import Profile from "./Components/Profile";
import SplashScreen from "./Components/SplashScreen"; 
import VerArticulos from "./Components/VerArticulos";
import AnadirProducto from "./Components/AnadirProducto";
import Chat from "./Components/Chat";
import ListaMensajes from "./Components/ListaMensajes";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash"> 
        <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
        <Stack.Screen name="Add" component={AnadirProducto} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={Register} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
        <Stack.Screen name="Profile" component={Profile} options={{ headerShown: false }} />
        <Stack.Screen name="VerArticulos" component={VerArticulos} options={{ headerShown: false }} />
        <Stack.Screen name="Chat" component={Chat} options={{ headerShown: false }} />
        <Stack.Screen name="ListaMensajes" component={ListaMensajes} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
