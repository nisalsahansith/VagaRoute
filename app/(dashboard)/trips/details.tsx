import React, { useEffect, useState } from "react"
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  ScrollView,
  StatusBar
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

  const deleteTrip = async () => {
    Alert.alert("Delete Trip", "This action cannot be undone. Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete Journey",
        style: "destructive",
        onPress: async () => {
          await deleteDoc(doc(db, "trips", tripId as string))
          router.push("/(dashboard)/(tabs)/trip")
        }
      }
    ])
  }

  const editTrip = () => {
    router.push({
      pathname: "/trips/create",
      params: { tripId: trip.id }
    })
  }

  const startTripNavigation = () => {
    const routePoints = [trip.startPoint, ...(trip.stops || []), trip.endPoint]
    router.push({
      pathname: "/(dashboard)/(tabs)/nearby",
      params: { route: JSON.stringify(routePoints), tripTitle: trip.title }
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
      <View className="flex-1 justify-center items-center bg-[#F8FAFC]">
        <Ionicons name="alert-circle-outline" size={60} color="#CBD5E1" />
        <Text className="text-[#94A3B8] mt-4 text-lg">Trip not found</Text>
      </View>
    )
  }

  const isUpcoming = trip.status === "Upcoming"

  // ---------------- IMPROVED ROUTE TRACKER ITEM ----------------
  const RouteItem = ({ label, value, isLast, isFirst }: any) => (
    <View className="flex-row items-start">
      <View className="items-center mr-6">
        <View className={`w-5 h-5 rounded-full border-4 border-white shadow-sm items-center justify-center ${isFirst || isLast ? 'bg-[#FF6D4D]' : 'bg-[#1A2B48]'}`}>
            {isFirst && <View className="w-2 h-2 bg-white rounded-full" />}
        </View>
        {!isLast && (
          <View className="w-[2px] h-16 bg-[#E2E8F0]" />
        )}
      </View>

      <View className="flex-1 pb-8">
        <Text className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-1">{label}</Text>
        <Text className="text-[#1A2B48] text-lg font-bold leading-6">
          {value}
        </Text>
      </View>
    </View>
  )

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      <StatusBar barStyle="dark-content" />
      
      {/* HEADER NAVIGATION */}
      <View className="pt-14 px-5 pb-4 flex-row items-center justify-between bg-white border-b border-[#F1F5F9]">
        <TouchableOpacity 
          onPress={() => router.push("/(dashboard)/(tabs)/trip")}
          className="bg-[#F8FAFC] p-2 rounded-xl border border-[#E2E8F0]"
        >
          <Ionicons name="chevron-back" size={24} color="#1A2B48" />
        </TouchableOpacity>
        <Text className="text-lg font-black text-[#1A2B48]">Journey Details</Text>
        <TouchableOpacity onPress={editTrip} className="p-2">
            <Ionicons name="create-outline" size={24} color="#1A2B48" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140, paddingHorizontal: 20, paddingTop: 24 }}
      >
        {/* HERO CARD */}
        <View className="bg-white p-6 rounded-[32px] shadow-sm border border-[#F1F5F9] mb-8">
          <View className="flex-row justify-between items-start mb-4">
            <View className="bg-[#FF6D4D]/10 px-3 py-1 rounded-lg">
                <Text className="text-[#FF6D4D] font-bold text-[10px] uppercase tracking-tighter">{trip.status}</Text>
            </View>
            <Ionicons name="airplane" size={20} color="#E2E8F0" />
          </View>
          
          <Text className="text-3xl font-black text-[#1A2B48] mb-2">
            {trip.title}
          </Text>

          <View className="flex-row items-center">
            <Ionicons name="calendar-outline" size={16} color="#94A3B8" />
            <Text className="text-[#94A3B8] ml-2 font-medium">
              {new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — {new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </Text>
          </View>
        </View>

        {/* ROUTE SECTION */}
        <View className="flex-row justify-between items-center mb-6 px-1">
          <Text className="font-black text-[#1A2B48] text-xl">The Route</Text>
          <TouchableOpacity 
            onPress={startTripNavigation}
            className="flex-row items-center bg-[#FF6D4D] px-4 py-2 rounded-full"
          >
            <Ionicons name="map-outline" size={18} color="white" />
            <Text className="text-white font-bold ml-2 text-xs">View Map</Text>
          </TouchableOpacity>
        </View>

        <View className="bg-white p-8 rounded-[40px] border border-[#F1F5F9] mb-8">
          <RouteItem label="Starting Point" value={trip.startPoint} isFirst />

          {trip.stops?.map((stop: string, index: number) => (
            <RouteItem
              key={index}
              label={`Waypoint ${index + 1}`}
              value={stop}
            />
          ))}

          <RouteItem
            label="Final Destination"
            value={trip.endPoint}
            isLast
          />
        </View>

        {/* DANGER ZONE */}
        {isUpcoming && (
            <TouchableOpacity 
                onPress={deleteTrip}
                className="flex-row items-center justify-center p-4"
            >
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
                <Text className="text-[#EF4444] font-bold ml-2">Delete this itinerary</Text>
            </TouchableOpacity>
        )}
      </ScrollView>

      {/* FLOATING ACTION DOCK */}
      <View className="absolute bottom-10 left-6 right-6 flex-row gap-3">
        <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/(dashboard)/activities/activities",
                params: { tripId: trip.id, tripTitle: trip.title }
              })
            }
            activeOpacity={0.9}
            className="flex-1 bg-[#1A2B48] h-16 rounded-2xl flex-row items-center justify-center shadow-xl shadow-[#1A2B48]/20"
          >
            <Ionicons name="list" size={20} color="white" />
            <Text className="text-white font-bold text-lg ml-2">Activities</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}