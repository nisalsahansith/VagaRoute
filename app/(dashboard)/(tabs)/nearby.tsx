import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Dimensions, Alert, TouchableOpacity } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

export default function NearbyScreen() {
  const [region, setRegion] = useState({
    latitude: 7.8731,
    longitude: 80.7718,
    latitudeDelta: 0.5,
    longitudeDelta: 0.5,
  });

  const [pois, setPois] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Enable location permission to see nearby places."
        );
        return;
      }

      // Get user location
      const location = await Location.getCurrentPositionAsync({});
      const userLat = location.coords.latitude;
      const userLon = location.coords.longitude;

      setRegion({
        ...region,
        latitude: userLat,
        longitude: userLon,
      });

      // Fetch nearby POIs from Overpass API
      fetchNearbyPOIs(userLat, userLon);
    })();
  }, []);

  const fetchNearbyPOIs = async (lat: number, lon: number) => {
    setLoading(true);
    try {
      // Overpass QL query for ATMs, fuel stations, hotels within 2km radius
      const query = `
        [out:json];
        (
          node["amenity"="atm"](around:2000,${lat},${lon});
          node["amenity"="fuel"](around:2000,${lat},${lon});
          node["tourism"="hotel"](around:2000,${lat},${lon});
        );
        out center;
      `;
      const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(
        query
      )}`;

      const response = await fetch(url);
      const data = await response.json();

      const results = data.elements.map((el: any) => ({
        id: el.id,
        lat: el.lat,
        lon: el.lon,
        type: el.tags.amenity || el.tags.tourism,
        name: el.tags.name || el.tags.amenity || el.tags.tourism,
      }));

      setPois(results);
    } catch (err) {
      console.error("Error fetching POIs:", err);
      Alert.alert("Error", "Failed to load nearby places.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        showsUserLocation
        onRegionChangeComplete={(r: React.SetStateAction<{ latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number; }>) => setRegion(r)}
      >
        {pois.map((poi) => (
          <Marker
            key={poi.id}
            coordinate={{ latitude: poi.lat, longitude: poi.lon }}
            title={poi.name}
            description={poi.type}
          />
        ))}
      </MapView>

      <TouchableOpacity
        style={styles.recenterButton}
        onPress={() =>
          setRegion({
            ...region,
            latitude: region.latitude,
            longitude: region.longitude,
          })
        }
      >
        <Ionicons name="locate" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {loading && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>Loading nearby places...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width, height },
  recenterButton: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: "#FF6D4D",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#1A2B48",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    width,
    padding: 10,
    backgroundColor: "#FFFFFFAA",
    alignItems: "center",
  },
  loadingText: { color: "#1A2B48", fontWeight: "bold" },
});
