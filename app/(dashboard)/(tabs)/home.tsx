import React, { useEffect, useMemo, useState } from "react"
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StatusBar
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import * as WebBrowser from "expo-web-browser"
import { collection, getDocs, query, where } from "firebase/firestore"
import { auth, db } from "@/services/firebase"
import { useRouter } from "expo-router"

type Trip = {
  id: string
  title: string
  startDate: string
  endDate: string
}

export default function HomeScreen() {
  const router = useRouter()
  const user = auth.currentUser

  const [search, setSearch] = useState("")
  const [trips, setTrips] = useState<Trip[]>([])
  const [loadingTrips, setLoadingTrips] = useState(true)

  const isSearching = search.trim().length > 0

  const openLink = async (url: string) => {
    await WebBrowser.openBrowserAsync(url)
  }

  const loadTrips = async () => {
    try {
      if (!user) return
      const q = query(collection(db, "trips"), where("userId", "==", user.uid))
      const snap = await getDocs(q)
      const list: Trip[] = snap.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as any)
      }))
      setTrips(list)
    } catch (err) {
      console.log("Error loading trips", err)
    } finally {
      setLoadingTrips(false)
    }
  }

  useEffect(() => { loadTrips() }, [])

  const filteredTrips = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return trips
    return trips.filter(t => (t.title || "").toLowerCase().includes(q))
  }, [search, trips])

  const today = new Date()
  const upcomingTrips = filteredTrips.filter(trip => new Date(trip.endDate) >= today)
  const completedTrips = filteredTrips.filter(trip => new Date(trip.endDate) < today)

  // ---------------- IMPROVED TRIP CARD ----------------
  const TripCard = ({ trip }: { trip: Trip }) => {
    const isUpcoming = new Date(trip.endDate) >= today

    return (
      <TouchableOpacity
        onPress={() => router.push({ pathname: "/trips/details", params: { tripId: trip.id } })}
        activeOpacity={0.8}
        className="bg-white p-5 rounded-[32px] mr-4 mb-2 w-64 shadow-sm shadow-black/5 border border-gray-50"
      >
        <View className={`w-10 h-10 rounded-2xl items-center justify-center mb-4 ${isUpcoming ? 'bg-[#FF6D4D]/10' : 'bg-[#10B981]/10'}`}>
            <Ionicons 
              name={isUpcoming ? "airplane" : "checkmark-circle"} 
              size={20} 
              color={isUpcoming ? "#FF6D4D" : "#10B981"} 
            />
        </View>
        
        <Text className="font-black text-[#1A2B48] text-lg mb-1" numberOfLines={1}>
          {trip.title}
        </Text>

        <Text className="text-[#94A3B8] text-xs font-bold mb-4">
          {new Date(trip.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
        </Text>

        <View className="flex-row items-center">
          <View className={`w-2 h-2 rounded-full ${isUpcoming ? 'bg-[#F59E0B]' : 'bg-[#10B981]'}`} />
          <Text className="ml-2 text-[10px] font-black uppercase tracking-tighter text-[#64748B]">
            {isUpcoming ? "Upcoming" : "Completed"}
          </Text>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      <StatusBar barStyle="dark-content" />
      
      <ScrollView 
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 60, paddingBottom: 120 }}
      >
        {/* HEADER */}
        <View className="flex-row justify-between items-center mb-8">
          <View>
            <Text className="text-[#94A3B8] font-bold uppercase tracking-[2px] text-[10px] mb-1">Explore</Text>
            <Text className="text-3xl font-black text-[#1A2B48]">VagaRoute</Text>
          </View>
          <View className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
            <Image
              source={require("@/assets/images/vagaRoute_logo.png")}
              className="w-10 h-10 rounded-xl"
              resizeMode="contain"
            />
          </View>
        </View>

        {/* SEARCH BAR (MINIMAL) */}
        <View className="flex-row items-center bg-white h-14 px-5 rounded-2xl shadow-sm border border-gray-50 mb-8">
          <Ionicons name="search" size={20} color="#CBD5E1" />
          <TextInput
            placeholder="Search adventures..."
            placeholderTextColor="#CBD5E1"
            value={search}
            onChangeText={setSearch}
            editable={!loadingTrips}
            className="flex-1 ml-3 font-semibold text-[#1A2B48]"
          />
          {isSearching && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={20} color="#E2E8F0" />
            </TouchableOpacity>
          )}
        </View>

        {isSearching ? (
          <View>
            <Text className="text-xl font-black text-[#1A2B48] mb-4">Results</Text>
            {loadingTrips ? (
              <ActivityIndicator color="#FF6D4D" />
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="overflow-visible">
                {filteredTrips.map(trip => <TripCard key={trip.id} trip={trip} />)}
              </ScrollView>
            )}
          </View>
        ) : (
          <>
            {/* QUICK BOOKING BOXES */}
            <View className="flex-row justify-between mb-10">
              <TouchableOpacity
                onPress={() => openLink("https://www.booking.com")}
                className="bg-[#1A2B48] w-[48%] p-6 rounded-[32px] shadow-lg shadow-navy-900/20"
              >
                <Ionicons name="bed" size={24} color="#FF6D4D" />
                <Text className="text-white font-black text-lg mt-3">Hotels</Text>
                <Text className="text-white/50 text-[10px] font-bold uppercase tracking-tighter">Book a Stay</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => openLink("https://www.skyscanner.com")}
                className="bg-white w-[48%] p-6 rounded-[32px] border border-gray-100 shadow-sm"
              >
                <Ionicons name="airplane" size={24} color="#FF6D4D" />
                <Text className="text-[#1A2B48] font-black text-lg mt-3">Flights</Text>
                <Text className="text-[#94A3B8] text-[10px] font-bold uppercase tracking-tighter">Sky Scanner</Text>
              </TouchableOpacity>
            </View>

            {/* PARTNERS (HORIZONTAL LIST) */}
            <Text className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[3px] mb-4 ml-1">Partners</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-10">
              {[
                { name: "Booking", url: "https://www.booking.com", img: "https://tse2.mm.bing.net/th/id/OIP.dFe-8ErBa9iL4iO0suQzOgHaHa?rs=1&pid=ImgDetMain&o=7&rm=3" },
                { name: "Agoda", url: "https://www.agoda.com", img: "https://tse1.mm.bing.net/th/id/OIP.i8tdTxifd0azaU6fH9roJQHaEH?rs=1&pid=ImgDetMain&o=7&rm=3" },
                { name: "Google", url: "https://www.google.com/flights", img: "https://logowik.com/content/uploads/images/t_google-flight1670.jpg" }
              ].map((item, idx) => (
                <TouchableOpacity 
                  key={idx} 
                  onPress={() => openLink(item.url)}
                  className="bg-white flex-row items-center px-4 py-3 rounded-2xl mr-3 border border-gray-50 shadow-sm"
                >
                  <Image source={{ uri: item.img }} className="w-6 h-6 rounded-md" />
                  <Text className="ml-2 font-bold text-[#1A2B48] text-xs">{item.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* UPCOMING SECTION */}
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-black text-[#1A2B48]">Next Adventures</Text>
              <TouchableOpacity onPress={() => router.push("/(dashboard)/(tabs)/trip")}>
                <Ionicons name="arrow-forward" size={20} color="#FF6D4D" />
              </TouchableOpacity>
            </View>

            {loadingTrips ? (
              <ActivityIndicator color="#FF6D4D" />
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-10 overflow-visible">
                {upcomingTrips.length === 0 ? (
                  <Text className="text-[#94A3B8] font-medium py-4">No plans yet...</Text>
                ) : (
                  upcomingTrips.slice(0, 5).map(trip => <TripCard key={trip.id} trip={trip} />)
                )}
              </ScrollView>
            )}

            {/* COMPLETED SECTION */}
            <Text className="text-xl font-black text-[#1A2B48] mb-4">Memories</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="overflow-visible">
              {completedTrips.length === 0 ? (
                <Text className="text-[#94A3B8] font-medium py-4">Safe travels!</Text>
              ) : (
                completedTrips.slice(0, 5).map(trip => <TripCard key={trip.id} trip={trip} />)
              )}
            </ScrollView>
          </>
        )}
      </ScrollView>

      {/* FLOATING ACTION BUTTON */}
      {/* {!isSearching && (
        <TouchableOpacity 
            onPress={() => router.push("/(dashboard)/(tabs)/trip")}
            className="absolute bottom-10 right-6 bg-[#FF6D4D] w-14 h-14 rounded-2xl items-center justify-center shadow-xl shadow-orange-500/40"
        >
            <Ionicons name="add" size={30} color="white" />
        </TouchableOpacity>
      )} */}
    </View>
  )
}