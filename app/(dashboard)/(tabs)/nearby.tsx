import React, { useEffect, useRef, useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Alert,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Platform,
  ActivityIndicator
} from "react-native"
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps"
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
          latitudeDelta: isNavigating ? 0.002 : 0.01, // Tighter zoom when moving
          longitudeDelta: isNavigating ? 0.002 : 0.01
        }

        setUserLocation(newRegion)
        if (!isNavigating) setRegion(newRegion)

        if (mapRef.current && isNavigating) {
          mapRef.current.animateCamera({
            center: { latitude, longitude },
            pitch: 65, // More aggressive tilt for 3D feel
            heading: heading || 0,
            zoom: 19
          }, { duration: 1000 })
        }
      }
    )
  }

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

  const fetchRoute = async (start: any, end: any) => {
    try {
      const url = `https://api.openrouteservice.org/v2/directions/driving-car/geojson`
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: ORS_API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          coordinates: [[start.longitude, start.latitude], [end.longitude, end.latitude]],
          instructions: true
        })
      })

      const data = await res.json()
      const feature = data.features[0]
      const coords = feature.geometry.coordinates.map((p: number[]) => ({
        latitude: p[1],
        longitude: p[0]
      }))

      setRouteCoords(coords)
      setSteps(feature.properties.segments[0].steps)
      setRouteInfo({
        distance: (feature.properties.summary.distance / 1000).toFixed(1),
        duration: Math.ceil(feature.properties.summary.duration / 60)
      })

      // Auto-fit the route on the screen
      mapRef.current?.fitToCoordinates(coords, {
        edgePadding: { top: 100, right: 50, bottom: 250, left: 50 },
        animated: true,
      })

      Speech.speak("Route ready. Ready to start?")
    } catch (err) {
      Alert.alert("Error", "Failed to fetch route")
    }
  }

  const startNavigation = () => {
    if (!routeCoords.length) return
    setIsNavigating(true)
    setCurrentStepIndex(0)
    Speech.speak("Navigation started. Follow the orange path.")
  }

  const stopNavigation = () => {
    setIsNavigating(false)
    setDestination(null)
    setRouteCoords([])
    setSteps([])
    setRouteInfo(null)
    Speech.speak("Navigation ended")
  }

  if (!region) return <View style={styles.center}><ActivityIndicator color="#FF6D4D" size="large" /></View>

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        showsUserLocation
        showsMyLocationButton={false}
        onPress={selectDestination}
      >
        {destination && (
          <Marker coordinate={destination}>
            <View style={styles.destMarker}>
              <Ionicons name="location" size={34} color="#FF6D4D" />
            </View>
          </Marker>
        )}

        {routeCoords.length > 0 && (
          <Polyline
            coordinates={routeCoords}
            strokeWidth={6}
            strokeColor="#FF6D4D"
            lineJoin="round"
          />
        )}
      </MapView>

      {/* TOP INSTRUCTION OVERLAY */}
      <SafeAreaView style={styles.topContainer}>
        {isNavigating && steps[currentStepIndex] ? (
          <View style={styles.instructionCard}>
            <View style={styles.directionIcon}>
              <Ionicons name="navigate-circle" size={32} color="#FF6D4D" />
            </View>
            <Text style={styles.instructionText}>{steps[currentStepIndex].instruction}</Text>
            <TouchableOpacity onPress={stopNavigation} style={styles.miniStop}>
              <Ionicons name="close" size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        ) : (
          !isNavigating && (
            <View style={styles.headerTitle}>
              <Text style={styles.appName}>VagaRoute GPS</Text>
            </View>
          )
        )}
      </SafeAreaView>

      {/* BOTTOM INFO SHEET */}
      {routeInfo && (
        <View style={styles.bottomSheet}>
          <View style={styles.dragHandle} />
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>DISTANCE</Text>
              <Text style={styles.statValue}>{routeInfo.distance} km</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>EST. TIME</Text>
              <Text style={styles.statValue}>{routeInfo.duration} min</Text>
            </View>
          </View>

          {!isNavigating ? (
            <TouchableOpacity style={styles.primaryBtn} onPress={startNavigation}>
              <Text style={styles.primaryBtnText}>Start Journey</Text>
              <Ionicons name="arrow-forward" size={20} color="white" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: '#1A2B48' }]} onPress={stopNavigation}>
              <Text style={styles.primaryBtnText}>End Navigation</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  map: { width, height },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  // Top Overlay
  topContainer: {
    position: 'absolute',
    top: 10,
    left: 20,
    right: 20,
  },
  headerTitle: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 12,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOpacity: 0.1,
    elevation: 4
  },
  appName: { fontWeight: '900', color: '#1A2B48', fontSize: 16, letterSpacing: 1 },
  instructionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  directionIcon: { marginRight: 12 },
  instructionText: { flex: 1, fontWeight: '700', color: '#1A2B48', fontSize: 15 },
  miniStop: { padding: 5 },

  // Bottom Sheet
  bottomSheet: {
    position: 'absolute',
    bottom: 60,
    width: '100%',
    backgroundColor: '#FFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    alignSelf: 'center',
    marginBottom: 15,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  statItem: { alignItems: 'center', flex: 1 },
  statLabel: { fontSize: 10, fontWeight: '800', color: '#94A3B8', marginBottom: 4 },
  statValue: { fontSize: 22, fontWeight: '900', color: '#1A2B48' },
  statDivider: { width: 1, height: '100%', backgroundColor: '#F1F5F9' },

  primaryBtn: {
    backgroundColor: '#FF6D4D',
    borderRadius: 18,
    height: 60,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  primaryBtnText: { color: 'white', fontWeight: '900', fontSize: 18 },
  destMarker: {
    shadowColor: '#FF6D4D',
    shadowOpacity: 0.5,
    shadowRadius: 10,
  }
})