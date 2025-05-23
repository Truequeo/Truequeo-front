import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  BackHandler,
} from "react-native";
import {
  useRoute,
  useNavigation,
  useFocusEffect,
} from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";

export default function VerArticulos() {
  const route = useRoute();
  const { usuario, token, selectedImage } = route.params;
  const navigation = useNavigation();

  useFocusEffect(
    React.useCallback(() => {
      const backAction = () => {
        console.log(selectedImage);
        navigation.replace("Home", {
          usuario,
          token,
          selectedImagen: selectedImage,
        });
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        backAction
      );
      return () => backHandler.remove();
    }, [navigation])
  );
  const renderItem = ({ item }) => {
    if (item.isAddButton) {
      return (
        <TouchableOpacity
          onPress={() => navigation.navigate("Add", { usuario, token })}
          style={styles.addNew}
        >
          <Text style={styles.plus}>+</Text>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        style={styles.itemContainer}
        onPress={() => {
          console.log(item);
          navigation.replace("Home", {
            usuario,
            token,
            selectedArticulo: item,
            selectedImagen: item.fotoarticulo,
          });
        }}
      >
        <Image
          source={{ uri: `${item.fotoarticulo}/1.jpeg` }}
          style={styles.image}
        />
        {item.etiquetas && item.etiquetas.length > 1 && (
          <View style={styles.overlay}>
            <Text style={styles.overlayText}>+{item.etiquetas.length - 1}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity>
          <Image
            source={{ uri: `${usuario.fotoperfil}?t=${new Date().getTime()} ` }}
            style={styles.profileImage}
          />
        </TouchableOpacity>
        <Text style={styles.title}>TRUEQUEO</Text>
        <Icon name="notifications-off-outline" size={45} color="black" />
      </View>

      <FlatList
        data={[...usuario.articulos, { isAddButton: true }]}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        numColumns={2}
        contentContainerStyle={styles.grid}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  header: {
    height: 80,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  profileImage: {
    width: 65,
    height: 65,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: "#a864ff",
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
  },
  grid: {
    paddingTop: 20,
    paddingBottom: 40,
  },
  itemContainer: {
    width: "48%",
    aspectRatio: 1,
    margin: "1%",
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#000",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 6,
    paddingVertical: 2,
    flexDirection: "row",
    alignItems: "center",
  },
  overlayText: {
    fontSize: 12,
    color: "#000",
  },
  addNew: {
    width: "48%",
    aspectRatio: 1,
    margin: "1%",
    backgroundColor: "#e0e0e0",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  plus: {
    fontSize: 40,
    color: "#aaa",
  },
});
