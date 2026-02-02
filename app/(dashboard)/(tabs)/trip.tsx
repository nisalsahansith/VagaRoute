import React, { useEffect, useState } from "react"
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
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
        const startDate = data.startDate ? new Date(data.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ""
        const endDate = data.endDate ? new Date(data.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ""

        const today = new Date()
        const status = new Date(data.startDate) >= today ? "Upcoming" : "Completed"

        return {
          id: doc.id,
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

  const renderTrip = ({ item }: { item: Trip }) => {
    const isUpcoming = item.status === "Upcoming"

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => router.push({ pathname: "/trips/details", params: { tripId: item.id } })}
        className="mb-5"
      >
        <View className="bg-white p-6 rounded-[32px] border border-[#F1F5F9] shadow-sm shadow-[#1A2B48]/5 flex-row items-center">
          {/* Status Icon Indicator */}
          <View className={`w-12 h-12 rounded-2xl items-center justify-center ${isUpcoming ? 'bg-[#FF6D4D]/10' : 'bg-[#1A2B48]/5'}`}>
            <Ionicons 
              name={isUpcoming ? "airplane" : "archive-outline"} 
              size={24} 
              color={isUpcoming ? "#FF6D4D" : "#1A2B48"} 
            />
          </View>

          <View className="flex-1 ml-4">
            <Text className="text-lg font-black text-[#1A2B48] mb-1" numberOfLines={1}>
              {item.title}
            </Text>
            
            <View className="flex-row items-center">
              <Ionicons name="calendar-clear-outline" size={14} color="#94A3B8" />
              <Text className="text-[#94A3B8] text-xs font-medium ml-1">
                {item.startDate} — {item.endDate}
              </Text>
            </View>
          </View>

          {/* Minimal Status Tag */}
          <View className={`px-3 py-1.5 rounded-xl ${isUpcoming ? 'bg-[#FF6D4D]' : 'bg-[#E2E8F0]'}`}>
             <Text className={`text-[10px] font-bold uppercase ${isUpcoming ? 'text-white' : 'text-[#64748B]'}`}>
                {item.status}
             </Text>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      <StatusBar barStyle="dark-content" />
      
      {/* Header Section */}
      <View className="pt-16 px-6 pb-6 bg-white rounded-b-[40px] shadow-sm shadow-black/5">
        <Text className="text-[#94A3B8] font-bold text-xs uppercase tracking-[2px] mb-1">
          Your Collection
        </Text>
        <View className="flex-row justify-between items-end">
          <Text className="text-3xl font-black text-[#1A2B48]">
            My Journeys
          </Text>
          <View className="bg-[#1A2B48] px-4 py-2 rounded-2xl">
            <Text className="text-white font-bold text-xs">
              {trips.length} {trips.length === 1 ? 'Trip' : 'Trips'}
            </Text>
          </View>
        </View>
      </View>

      {/* Main Content */}
      <View className="flex-1 px-5 pt-6">
        {loading ? (
          <View className="mt-20">
            <ActivityIndicator size="large" color="#FF6D4D" />
          </View>
        ) : trips.length > 0 ? (
          <FlatList
            data={trips}
            keyExtractor={item => item.id}
            renderItem={renderTrip}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 150 }}
          />
        ) : (
          <View className="mt-20 items-center px-10">
            <View className="w-24 h-24 bg-[#E2E8F0]/50 rounded-full items-center justify-center mb-6">
               <Ionicons name="map-outline" size={40} color="#CBD5E1" />
            </View>
            <Text className="text-xl font-bold text-[#1A2B48] text-center">No adventures found</Text>
            <Text className="text-center text-[#94A3B8] mt-2 leading-5">
              Every great story begins with a single step. Start planning your next destination.
            </Text>
          </View>
        )}
      </View>

      {/* Modern Add Trip Button */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => router.push("/trips/create")}
        className="absolute bottom-28 right-8 bg-[#FF6D4D] w-16 h-16 rounded-2xl items-center justify-center shadow-2xl shadow-[#FF6D4D]/50"
        style={{ transform: [{ rotate: '45deg' }] }}
      >
        <View style={{ transform: [{ rotate: '-45deg' }] }}>
          <Ionicons name="add" size={32} color="white" />
        </View>
      </TouchableOpacity>
    </View>
  )
}