import React, { useEffect, useState } from "react"
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { db, auth } from "@/services/firebase"
import { collection, query, where, getDocs, orderBy } from "firebase/firestore"

interface Trip {
  id: string
  title: string
  startDate: string
  endDate: string
  status: "Upcoming" | "Completed"
}

export default function TripsScreen() {
  const router = useRouter()
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTrips = async () => {
    try {
      setLoading(true)
      const user = auth.currentUser
      if (!user) return

      const tripsRef = collection(db, "trips")

      const q = query(
        tripsRef,
        where("userId", "==", user.uid),
        orderBy("startDate", "desc")
      )

      const snapshot = await getDocs(q)

      const fetchedTrips: Trip[] = snapshot.docs.map(doc => {
        const data = doc.data()
        const startDate = data.startDate
          ? new Date(data.startDate).toLocaleDateString()
          : ""

        const endDate = data.endDate
          ? new Date(data.endDate).toLocaleDateString()
          : ""

        const today = new Date()
        const status =
          new Date(data.startDate) >= today ? "Upcoming" : "Completed"

        return {
          id: doc.id, // 🔥 Hidden trip ID stored here
          title: data.title,
          startDate,
          endDate,
          status
        }
      })

      setTrips(fetchedTrips)
    } catch (error) {
      console.error("Error fetching trips:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTrips()
  }, [])

  const renderTrip = ({ item }: { item: Trip }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() =>
        router.push({
          pathname: "/trips/details",
          params: { tripId: item.id } // 🔐 Hidden trip ID passed here
        })
      }
    >
      <View className="bg-white p-5 rounded-3xl mb-4 shadow-sm border border-[#E2E8F0] flex-row items-center justify-between">
        <View>
          <Text className="text-lg font-bold text-[#1A2B48]">
            {item.title}
          </Text>
          <Text className="text-[#94A3B8]">
            {item.startDate} - {item.endDate}
          </Text>
        </View>

        <View
          className={`px-3 py-1 rounded-full ${
            item.status === "Upcoming"
              ? "bg-[#FF6D4D]/20"
              : "bg-[#1A2B48]/10"
          }`}
        >
          <Text
            className="font-bold text-xs"
            style={{
              color: item.status === "Upcoming" ? "#FF6D4D" : "#1A2B48"
            }}
          >
            {item.status}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  )

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F8FAFC]">
        <ActivityIndicator size="large" color="#FF6D4D" />
      </View>
    )
  }

  return (
    <View className="flex-1 bg-[#F8FAFC] pt-14 px-5">
      {/* Header */}
      <Text className="text-2xl font-bold text-[#1A2B48] mb-6">
        My Journeys
      </Text>

      {/* Trips List */}
      {trips.length > 0 ? (
        <FlatList
          data={trips}
          keyExtractor={item => item.id}
          renderItem={renderTrip}
          contentContainerStyle={{ paddingBottom: 120 }}
        />
      ) : (
        <Text className="text-center text-[#94A3B8] mt-20">
          No trips found. Create your first trip!
        </Text>
      )}

      {/* Add Trip Button */}
      <TouchableOpacity
        onPress={() => router.push("/trips/create")}
        className="absolute bottom-6 right-6 bg-[#FF6D4D] w-16 h-16 rounded-full items-center justify-center shadow-xl"
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>
    </View>
  )
}
