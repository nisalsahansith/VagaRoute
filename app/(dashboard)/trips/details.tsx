import React, { useEffect, useState } from "react"
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  ScrollView,
  Linking
} from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { db } from "@/services/firebase"
import { doc, getDoc, deleteDoc } from "firebase/firestore"
import { Ionicons } from "@expo/vector-icons"

export default function TripDetailsScreen() {
  const { tripId } = useLocalSearchParams()
  const router = useRouter()

  const [trip, setTrip] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // ---------------- FETCH TRIP ----------------
  const fetchTrip = async () => {
    try {
      if (!tripId) return

      const tripRef = doc(db, "trips", tripId as string)
      const snapshot = await getDoc(tripRef)

      if (snapshot.exists()) {
        setTrip({ id: snapshot.id, ...snapshot.data() })
      }
    } catch (error) {
      console.error("Error loading trip:", error)
    } finally {
      setLoading(false)
    }
  }

  // ---------------- DELETE ----------------
  const deleteTrip = async () => {
    Alert.alert("Delete Trip", "Are you sure you want to delete this trip?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteDoc(doc(db, "trips", tripId as string))
          router.push("/(dashboard)/(tabs)/trip")
        }
      }
    ])
  }

  // ---------------- MAP OPEN ----------------
  const openMap = (location: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      location
    )}`
    Linking.openURL(url)
  }

  // ---------------- EDIT ----------------
  const editTrip = () => {
    router.push({
      pathname: "/trips/create",
      params: {
        tripId: trip.id
      }
    })
  }

  useEffect(() => {
    fetchTrip()
  }, [])

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#F8FAFC]">
        <ActivityIndicator size="large" color="#FF6D4D" />
      </View>
    )
  }

  if (!trip) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Trip not found</Text>
      </View>
    )
  }

  const isUpcoming = trip.status === "Upcoming"

  // ---------------- ROUTE TRACKER ITEM ----------------
  const RouteItem = ({
    label,
    value,
    isLast
  }: {
    label: string
    value: string
    isLast?: boolean
  }) => (
    <TouchableOpacity
      onPress={() => openMap(value)}
      className="flex-row items-start mb-4"
    >
      <View className="items-center mr-4">
        <View className="w-3 h-3 bg-[#FF6D4D] rounded-full mt-1" />
        {!isLast && (
          <View className="w-[2px] h-10 bg-[#CBD5E1] mt-1" />
        )}
      </View>

      <View className="flex-1">
        <Text className="text-xs text-[#94A3B8]">{label}</Text>
        <Text className="text-[#1A2B48] font-semibold">
          {value}
        </Text>
      </View>

      <Ionicons name="map-outline" size={18} color="#94A3B8" />
    </TouchableOpacity>
  )

  return (
    <ScrollView className="flex-1 bg-[#F8FAFC] px-5 pt-14">
      {/* HEADER */}
      <View className="flex-row items-center mb-6 justify-between">
        <TouchableOpacity onPress={() => router.push("/(dashboard)/(tabs)/trip")}>
          <Ionicons name="arrow-back" size={26} color="#1A2B48" />
        </TouchableOpacity>

        <Text className="text-xl font-bold text-[#1A2B48]">
          Trip Details
        </Text>

        <View className="w-6" />
      </View>

      {/* TITLE CARD */}
      <View className="bg-white p-5 rounded-3xl border border-[#E2E8F0] mb-6">
        <Text className="text-2xl font-bold text-[#1A2B48]">
          {trip.title}
        </Text>

        <Text className="text-[#94A3B8] mt-2">
          {new Date(trip.startDate).toDateString()} -{" "}
          {new Date(trip.endDate).toDateString()}
        </Text>
      </View>

      {/* ROUTE TRACKER */}
      <View className="bg-white p-5 rounded-3xl border border-[#E2E8F0] mb-8">
        <Text className="font-bold text-[#1A2B48] mb-4">
          Route Timeline
        </Text>

        <RouteItem label="Start Point" value={trip.startPoint} />

        {trip.stops?.map((stop: string, index: number) => (
          <RouteItem
            key={index}
            label={`Stop ${index + 1}`}
            value={stop}
          />
        ))}

        <RouteItem
          label="Destination"
          value={trip.endPoint}
          isLast
        />
      </View>

      {/* ACTION BUTTONS */}
      <View className="flex-row gap-4 mb-12">
        <TouchableOpacity
          onPress={editTrip}
          className="flex-1 bg-[#1A2B48] p-4 rounded-2xl items-center"
        >
          <Text className="text-white font-bold">Edit Trip</Text>
        </TouchableOpacity>

        {isUpcoming && (
          <TouchableOpacity
            onPress={deleteTrip}
            className="flex-1 bg-red-500 p-4 rounded-2xl items-center"
          >
            <Text className="text-white font-bold">Delete</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  )
}
