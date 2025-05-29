import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import {
  useIsFocused,
  useRoute,
  useNavigation,
} from "@react-navigation/native";
import axios from "axios";
import { urlBackend } from "./VariablesEntorno";
import * as Location from "expo-location";

export default function Home() {
  const route = useRoute();
  const { usuario, token } = route.params;
  const [filtroSeleccionado, setFiltroSeleccionado] = useState("Todo");
  const navigation = useNavigation();
  const [imageTimestamp, setImageTimestamp] = useState(Date.now());
  const [imageSelectTimestamp, setImageSelectTimestamp] = useState(Date.now());
  const [imageA, setImageA] = useState(Date.now());

  const isFocused = useIsFocused();
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedArticulo, setSelectedArticulo] = useState(null);
  const [articulos, setArticulos] = useState([]);
  const [indiceArticulo, setIndiceArticulo] = useState(0);
  const [imagenIndex, setImagenIndex] = useState(0);

  const handleProfilePress = () => {
    navigation.replace("Profile", { usuario, token });
  };

  const handleRecomendado = () => {
    if (selectedArticulo) {
      setFiltroSeleccionado("Recomendado");
    }
  };

  const handleTodo = () => setFiltroSeleccionado("Todo");
  const handleCerca = () => setFiltroSeleccionado("Cerca");
  const handleOpciones = () => {};

  const getImagenesArticulo = (fotoBase, cantidadImagenes) => {
    return Array.from(
      { length: cantidadImagenes },
      (_, i) => `${fotoBase}/${i + 1}.jpeg`
    );
  };
  const limit = 10;

  const [offset, setOffset] = useState(0);
  const [offsetCerca, setOffsetCerca] = useState(0);

  const [loadingMas, setLoadingMas] = useState(false);

  const cargarMasArticulos = async () => {
    if (loadingMas) return;
    setLoadingMas(true);
    try {
      if (filtroSeleccionado === "Todo") {
        const response = await axios.get(
          `${urlBackend}articulo/getArticulo/${usuario.codusuario}?offset=${offset}&limit=${limit}`
        );
        if (response.data.length > 0) {
          setArticulos((prev) => [...prev, ...response.data]);
          setOffset((prev) => prev + limit);
        }
      } else if (filtroSeleccionado === "Cerca") {
        const { coords } = await Location.getCurrentPositionAsync({});
        const response = await axios.get(
          `${urlBackend}articulo/getArticuloCerca`,
          {
            params: {
              lat: coords.latitude,
              lon: coords.longitude,
              codusuario: usuario.codusuario,
              offset: offsetCerca,
              limit: limit,
            },
          }
        );
        console.log(response.data.length);
        if (response.data.length > 0) {
          setArticulos((prev) => [...prev, ...response.data]);
          setOffsetCerca((prev) => prev + limit);
        }
      }
    } catch (error) {
      console.error("Error al cargar más artículos:", error);
    } finally {
      setLoadingMas(false);
    }
  };

  useEffect(() => {
    const fetchArticulos = async () => {
      if (isFocused && route.params?.selectedImagen) {
        setSelectedImage(route.params?.selectedImagen);
      }
      if (isFocused && route.params?.selectedArticulo) {
        setSelectedArticulo(route.params?.selectedArticulo);
      }
      if (isFocused && filtroSeleccionado === "Todo") {
        setArticulos([]);
        try {
          console.log("entra cuando carga");
          const response = await axios.get(
            `${urlBackend}articulo/getArticulo/${usuario.codusuario}?offset=0&limit=${limit}`
          );
          setArticulos(response.data);
          console.log(response.data);

          setOffset(limit);
          setIndiceArticulo(0);
        } catch (error) {
          console.error("Error al obtener artículos 'Todo':", error);
        }
      }
      if (isFocused && filtroSeleccionado === "Cerca") {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== "granted") {
            alert("Permiso de ubicación denegado");
            return;
          }
          const { coords } = await Location.getCurrentPositionAsync({});
          console.log(coords);
          const response = await axios.get(
            urlBackend + "articulo/getArticuloCerca",
            {
              params: {
                lat: coords.latitude,
                lon: coords.longitude,
                codusuario: usuario.codusuario,
                offset: 0,
                limit: limit,
              },
            }
          );
          setArticulos(response.data);
          setOffsetCerca(limit);
          setIndiceArticulo(0);
          console.table("obtiene" + articulos);
          console.log("obtiene " + response.data.length);
        } catch (error) {
          console.error("Error al obtener artículos 'Cerca':", error);
        }
      }
      if (isFocused && filtroSeleccionado === "Recomendado") {
        try {
          const response = await axios.get(
            urlBackend +
              "articulo/getArticuloRecomendado/" +
              selectedArticulo.codarticulo +
              "?codusuario=" +
              usuario.codusuario
          );
          console.log(response.data)
          setArticulos(response.data);
          setIndiceArticulo(0);
        } catch (error) {
          console.error("Error al obtener artículos 'Recomendado':", error);
        }
      }
    };
    fetchArticulos();
  }, [isFocused, route.params?.selectedImagen, filtroSeleccionado]);

  return (
    <View style={styles.container}>
      {/* Encabezado */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleProfilePress}>
          <Image
            source={{ uri: `${usuario.fotoperfil}?t=${imageTimestamp}` }}
            style={styles.profileImage}
          />
        </TouchableOpacity>
        <Text style={styles.title}>TRUEQUEO</Text>
        <Icon
          onPress={() =>
            navigation.navigate("ListaMensajes", { usuario, token })
          }
          name="notifications-off-outline"
          size={45}
          color="black"
        />
      </View>
      {/* Filtros */}
      <View style={styles.filters}>
        <TouchableOpacity onPress={handleRecomendado}>
          <Text
            style={[
              styles.filterText,
              filtroSeleccionado === "Recomendado" && styles.selectedFilter,
            ]}
          >
            Recomendado
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleTodo}>
          <Text
            style={[
              styles.filterText,
              filtroSeleccionado === "Todo" && styles.selectedFilter,
            ]}
          >
            Todo
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleCerca}>
          <Text
            style={[
              styles.filterText,
              filtroSeleccionado === "Cerca" && styles.selectedFilter,
            ]}
          >
            Cerca
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleOpciones}>
          <Icon name="options-outline" size={20} />
        </TouchableOpacity>
      </View>
      {/* Tarjeta de producto */}
      {articulos.length > 0 && (
        <View style={styles.card}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const index = Math.round(
                e.nativeEvent.contentOffset.x /
                  e.nativeEvent.layoutMeasurement.width
              );
              setImagenIndex(index);
            }}
            scrollEventThrottle={16}
            contentContainerStyle={{
              alignItems: "center",
            }}
            style={{
              width: 350,
              alignSelf: "center",
            }}
          >
            {getImagenesArticulo(
              articulos[indiceArticulo].fotoarticulo,
              articulos[indiceArticulo].cantidadImagenes
            ).map((img, index) => (
              <View
                key={index}
                style={{
                  marginTop: 15,
                  width: 350,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Image
                  source={{ uri: `${img}?t=${imageA}` }}
                  style={styles.productImage}
                />
              </View>
            ))}
          </ScrollView>
          <View style={styles.dotsContainer}>
            {Array.from(
              { length: articulos[indiceArticulo].cantidadImagenes },
              (_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    { backgroundColor: i === imagenIndex ? "#000" : "#ccc" },
                  ]}
                />
              )
            )}
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.productTitle}>
              {articulos[indiceArticulo].nombrearticulo}
            </Text>
            <Text style={styles.productCategory}>
              {articulos[indiceArticulo].detallearticulo}
            </Text>
          </View>
        </View>
      )}
      {/* Botones */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.smallButton}
          onPress={() => {
            const nuevoIndice = (indiceArticulo + 1) % articulos.length;
            setIndiceArticulo(nuevoIndice);
            setImagenIndex(0);
            if (nuevoIndice >= articulos.length - 3) {
              cargarMasArticulos();
            }
          }}
        >
          <Icon name="close-outline" size={30} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            navigation.replace("VerArticulos", {
              usuario,
              token,
              selectedImage,
            });
          }}
          style={styles.bigButton}
        >
          {selectedImage ? (
            <Image
              source={{
                uri: `${selectedImage}/1.jpeg?t=${imageSelectTimestamp}`,
              }}
              style={styles.imageIcon}
            />
          ) : (
            <Icon name="download-outline" size={30} color="#fff" />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            if (selectedArticulo) {
              navigation.navigate("Chat", {
                usuario,
                token,
                articulo: articulos[indiceArticulo],
              });
            }
          }}
          style={styles.smallButton}
        >
          <Icon name="shuffle-outline" size={30} color="#000" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Estilos
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
  filters: {
    height: 50,
    backgroundColor: "#dedede",
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 20,
    alignItems: "center",
    borderRadius: 50,
  },
  filterText: {
    fontSize: 16,
    color: "black",
  },
  selectedFilter: {
    backgroundColor: "#b4b4b4",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    color: "#000",
  },
  card: {
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 20,
    elevation: 4,
  },
  productImage: {
    width: 350,
    height: 350,
    resizeMode: "cover",
    borderRadius: 10,
  },
  textContainer: {
    padding: 10,
  },
  productTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  productCategory: {
    fontSize: 14,
    color: "#555",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 30,
    alignItems: "center",
  },
  smallButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
  },
  bigButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#444",
    justifyContent: "center",
    alignItems: "center",
  },
  imageIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 4,
  },
});
