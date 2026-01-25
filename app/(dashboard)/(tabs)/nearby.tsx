import React, { useEffect, useRef, useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Alert,
  TouchableOpacity,
  FlatList
} from "react-native"
import MapView, { Marker, Polyline } from "react-native-maps"
import * as Location from "expo-location"
import * as Speech from "expo-speech"
import { Ionicons } from "@expo/vector-icons"

const { width, height } = Dimensions.get("window")
const ORS_API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImJjZTU1ODllMmQ3YTQ5ZDI5NzQwZjI4N2ZlZWZhYWQ3IiwiaCI6Im11cm11cjY0In0="

export default function GPSNavigationScreen() {
  const mapRef = useRef<MapView>(null)

  const [region, setRegion] = useState<any>(null)
  const [userLocation, setUserLocation] = useState<any>(null)
  const [destination, setDestination] = useState<any>(null)

  const [routeCoords, setRouteCoords] = useState<any[]>([])
  const [steps, setSteps] = useState<any[]>([])
  const [currentStepIndex, setCurrentStepIndex] = useState(0)

  const [routeInfo, setRouteInfo] = useState<any>(null)
  const [isNavigating, setIsNavigating] = useState(false)

  // ---------------- GPS TRACKING ----------------
  useEffect(() => {
    startTracking()
  }, [])

  const startTracking = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync()
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Location permission required")
      return
    }

    await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        distanceInterval: 3
      },
      location => {
        const { latitude, longitude, heading } = location.coords

        const newRegion = {
          latitude,
          longitude,
          latitudeDelta: isNavigating ? 0.005 : 0.01,
          longitudeDelta: isNavigating ? 0.005 : 0.01
        }

        setUserLocation(newRegion)
        setRegion(newRegion)

        if (mapRef.current && isNavigating) {
          mapRef.current.animateCamera({
            center: { latitude, longitude },
            pitch: 60,
            heading: heading || 0,
            zoom: 18
          })
        }
      }
    )
  }

  // ---------------- SELECT DESTINATION ----------------
  const selectDestination = async (e: any) => {
    if (isNavigating || !userLocation) return

    const { latitude, longitude } = e.nativeEvent.coordinate
    const dest = { latitude, longitude }

    setDestination(dest)
    setSteps([])
    setCurrentStepIndex(0)
    setRouteCoords([])
    setRouteInfo(null)

    await fetchRoute(userLocation, dest)
  }

  // ---------------- FETCH ROUTE ----------------
  const fetchRoute = async (start: any, end: any) => {
    try {
      console.log("Fetching route...")

      const url = `https://api.openrouteservice.org/v2/directions/driving-car/geojson`
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: ORS_API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          coordinates: [
            [start.longitude, start.latitude],
            [end.longitude, end.latitude]
          ],
          instructions: true
        })
      })

      const data = await res.json()
      console.log("Route data:", data)

      const feature = data.features[0]
      const coords = feature.geometry.coordinates.map(
        (p: number[]) => ({
          latitude: p[1],
          longitude: p[0]
        })
      )

      const summary = feature.properties.summary
      const instructions = feature.properties.segments[0].steps

      setRouteCoords(coords)
      setSteps(instructions)
      setRouteInfo({
        distance: summary.distance / 1000,
        duration: summary.duration / 60
      })

      Speech.speak("Route ready. Press start to begin navigation.")
    } catch (err) {
      console.log("Route error:", err)
      Alert.alert("Error", "Failed to fetch route")
    }
  }

  // ---------------- START NAVIGATION ----------------
  const startNavigation = () => {
    if (!routeCoords.length) return

    setIsNavigating(true)
    setCurrentStepIndex(0)
    Speech.speak("Navigation started")
  }

  // ---------------- STOP NAVIGATION ----------------
  const stopNavigation = () => {
    setIsNavigating(false)
    setDestination(null)
    setRouteCoords([])
    setSteps([])
    setRouteInfo(null)
    Speech.speak("Navigation ended")
  }

  // ---------------- UI ----------------
  if (!region) {
    return (
      <View style={styles.center}>
        <Text>Starting GPS...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        region={region}
        showsUserLocation
        onPress={selectDestination}
      >
        {destination && <Marker coordinate={destination} />}

        {routeCoords.length > 0 && (
          <Polyline
            coordinates={routeCoords}
            strokeWidth={5}
            strokeColor="#FF6D4D"
          />
        )}
      </MapView>

      {/* ROUTE INFO */}
      {routeInfo && !isNavigating && (
        <View style={styles.infoPanel}>
          <Text style={styles.infoText}>
            {routeInfo.distance.toFixed(1)} km
          </Text>
          <Text style={styles.infoText}>
            {Math.ceil(routeInfo.duration)} min
          </Text>
        </View>
      )}

      {/* START BUTTON */}
      {routeCoords.length > 0 && !isNavigating && (
        <TouchableOpacity
          style={styles.startButton}
          onPress={startNavigation}
        >
          <Ionicons name="navigate" size={22} color="white" />
          <Text style={styles.startText}>Start Navigation</Text>
        </TouchableOpacity>
      )}

      {/* CURRENT INSTRUCTION */}
      {isNavigating && steps[currentStepIndex] && (
        <View style={styles.instructionBox}>
          <Ionicons name="navigate" size={20} color="#FF6D4D" />
          <Text style={styles.instructionText}>
            {steps[currentStepIndex].instruction}
          </Text>
        </View>
      )}

      {/* STOP */}
      {isNavigating && (
        <TouchableOpacity
          style={styles.stopButton}
          onPress={stopNavigation}
        >
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width, height },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },

  startButton: {
    position: "absolute",
    bottom: 30,
    alignSelf: "center",
    backgroundColor: "#FF6D4D",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    elevation: 6
  },

  startText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16
  },

  stopButton: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "#DC2626",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6
  },

  instructionBox: {
    position: "absolute",
    top: 40,
    left: 20,
    right: 80,
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    elevation: 5
  },

  instructionText: {
    fontWeight: "bold",
    color: "#1A2B48",
    flex: 1
  },

  infoPanel: {
    position: "absolute",
    top: 40,
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 14,
    flexDirection: "row",
    gap: 20,
    elevation: 4
  },

  infoText: {
    fontWeight: "bold",
    color: "#1A2B48"
  }
})
