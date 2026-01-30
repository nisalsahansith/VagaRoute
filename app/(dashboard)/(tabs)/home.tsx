import React, { useEffect, useMemo, useState } from "react"
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator
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

  // ---------------- LOAD TRIPS ----------------
  const loadTrips = async () => {
    try {
      if (!user) return

      const q = query(
        collection(db, "trips"),
        where("userId", "==", user.uid)
      )

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

  useEffect(() => {
    loadTrips()
  }, [])

  // ---------------- FILTERED TRIPS ----------------
  const filteredTrips = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return trips

    return trips.filter(t =>
      (t.title || "").toLowerCase().includes(q)
    )
  }, [search, trips])

  // ---------------- STATUS LOGIC ----------------
  const today = new Date()

  const upcomingTrips = filteredTrips.filter(trip => {
    const end = new Date(trip.endDate)
    return end >= today
  })

  const completedTrips = filteredTrips.filter(trip => {
    const end = new Date(trip.endDate)
    return end < today
  })

  // ---------------- TRIP CARD ----------------
  const TripCard = ({ trip }: { trip: Trip }) => {
    const isUpcoming = new Date(trip.endDate) >= today

    return (
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/trips/details",
            params: { tripId: trip.id }
          })
        }
        className="bg-white p-4 rounded-2xl border border-[#E2E8F0] mr-4 mb-4 w-56"
      >
        <Text className="font-bold text-[#1A2B48] mb-1">
          {trip.title}
        </Text>

        <Text className="text-[#94A3B8] text-sm">
          {new Date(trip.startDate).toDateString()}
        </Text>

        <View className="flex-row items-center mt-2">
          <Ionicons
            name={isUpcoming ? "time-outline" : "checkmark-circle-outline"}
            size={16}
            color={isUpcoming ? "#F59E0B" : "#10B981"}
          />
          <Text className="ml-2 text-sm text-[#64748B]">
            {isUpcoming ? "Upcoming" : "Completed"}
          </Text>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <ScrollView
      className="flex-1 bg-[#F8FAFC] pt-14 px-5"
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      {/* HEADER */}
      <View className="flex-row justify-between items-center mb-6">
        <View>
          <Text className="text-[#94A3B8] font-medium">Explore</Text>
          <Text className="text-2xl font-bold text-[#1A2B48]">
            VagaRoute
          </Text>
        </View>

        <View className="bg-white p-2 rounded-2xl shadow-sm border border-[#E2E8F0]">
          <Image
            source={require("@/assets/images/vagaRoute_logo.png")}
            className="w-16 h-16 rounded-xl"
            resizeMode="contain"
          />
        </View>

      </View>

      {/* SEARCH BAR */}
      <View className="flex-row items-center bg-white p-4 rounded-2xl shadow-sm border border-[#E2E8F0] mb-6">
        <Ionicons name="search" size={20} color="#94A3B8" />

        <TextInput
          placeholder="Search your trips..."
          placeholderTextColor="#94A3B8"
          value={search}
          onChangeText={setSearch}
          editable={!loadingTrips}
          className="flex-1 ml-3 text-[#1A2B48]"
        />

        {isSearching && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={20} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>

      {/* SEARCH RESULTS */}
      {isSearching && (
        <View className="mb-8">
          <Text className="text-lg font-bold text-[#1A2B48] mb-3">
            Search Results
          </Text>

          {loadingTrips ? (
            <ActivityIndicator color="#FF6D4D" />
          ) : filteredTrips.length === 0 ? (
            <Text className="text-[#94A3B8]">
              No trips found
            </Text>
          ) : (
            filteredTrips.map(trip => (
              <TripCard key={trip.id} trip={trip} />
            ))
          )}
        </View>
      )}

      {/* NORMAL HOME CONTENT */}
      {!isSearching && (
        <>
          {/* BOOKING OPTIONS */}
          <Text className="text-lg font-bold text-[#1A2B48] mb-4">
            Book Your Journey
          </Text>

          <View className="flex-row justify-between mb-8">
            <TouchableOpacity
              onPress={() => openLink("https://www.booking.com")}
              className="bg-white w-[48%] p-5 rounded-3xl border border-[#E2E8F0]"
            >
              <View className="bg-[#E0F2FE] p-3 rounded-full w-12 mb-4">
                <Ionicons name="bed-outline" size={24} color="#0284C7" />
              </View>

              <Text className="text-lg font-bold text-[#1A2B48] mb-1">
                Hotels
              </Text>
              <Text className="text-[#94A3B8] text-sm">
                Find & book places to stay
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => openLink("https://www.skyscanner.com")}
              className="bg-white w-[48%] p-5 rounded-3xl border border-[#E2E8F0]"
            >
              <View className="bg-[#FEF3C7] p-3 rounded-full w-12 mb-4">
                <Ionicons name="airplane-outline" size={24} color="#D97706" />
              </View>

              <Text className="text-lg font-bold text-[#1A2B48] mb-1">
                Flights
              </Text>
              <Text className="text-[#94A3B8] text-sm">
                Compare & book flights
              </Text>
            </TouchableOpacity>
          </View>

          {/* POPULAR SITES */}
          <Text className="text-lg font-bold text-[#1A2B48] mb-4">
            Popular Booking Sites
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-8">
            {[
              {
                name: "Booking.com",
                img: "https://tse2.mm.bing.net/th/id/OIP.dFe-8ErBa9iL4iO0suQzOgHaHa?rs=1&pid=ImgDetMain&o=7&rm=3",
                url: "https://www.booking.com"
              },
              {
                name: "Agoda",
                img: "https://tse1.mm.bing.net/th/id/OIP.i8tdTxifd0azaU6fH9roJQHaEH?rs=1&pid=ImgDetMain&o=7&rm=3",
                url: "https://www.agoda.com"
              },
              {
                name: "Google Flights",
                img: "https://logowik.com/content/uploads/images/t_google-flight1670.jpg",
                url: "https://www.google.com/flights"
              }
            ].map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => openLink(item.url)}
                className="mr-5 bg-white p-4 rounded-3xl border border-[#E2E8F0] shadow-sm items-center"
              >
                <Image
                  source={{ uri: item.img }}
                  className="w-24 h-12 resize-contain mb-3"
                />
                <Text className="font-bold text-[#1A2B48]">
                  {item.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* UPCOMING TRIPS */}
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-bold text-[#1A2B48]">
              Upcoming Trips
            </Text>

            <TouchableOpacity
              onPress={() => router.push("/(dashboard)/(tabs)/trip")}
            >
              <Text className="text-[#FF6D4D] font-bold">
                See More
              </Text>
            </TouchableOpacity>
          </View>

          {loadingTrips ? (
            <ActivityIndicator color="#FF6D4D" />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-8">
              {upcomingTrips.length === 0 && (
                <Text className="text-[#94A3B8] mt-4">
                  No upcoming trips
                </Text>
              )}

              {upcomingTrips.slice(0, 5).map(trip => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </ScrollView>
          )}

          {/* COMPLETED TRIPS */}
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-bold text-[#1A2B48]">
              Completed Trips
            </Text>

            <TouchableOpacity
              onPress={() => router.push("/(dashboard)/(tabs)/trip")}
            >
              <Text className="text-[#FF6D4D] font-bold">
                See More
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-12">
            {completedTrips.length === 0 && (
              <Text className="text-[#94A3B8] mt-4">
                No completed trips
              </Text>
            )}

            {completedTrips.slice(0, 5).map(trip => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </ScrollView>
        </>
      )}
    </ScrollView>
  )
}
