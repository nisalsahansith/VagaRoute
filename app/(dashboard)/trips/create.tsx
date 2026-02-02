import React, { useEffect, useState } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TextInput,
  ActivityIndicator,
  StatusBar
} from "react-native"
import { useRouter, useLocalSearchParams } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import LocationSearchInput from "@/components/locationSearchInput"
import DateTimePicker from "@react-native-community/datetimepicker"
import { auth, db } from "@/services/firebase"
import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  deleteDoc
} from "firebase/firestore"

export default function CreateTripScreen() {
  const router = useRouter()
  const { tripId } = useLocalSearchParams()
  const isEditMode = !!tripId

  const [title, setTitle] = useState("")
  const [startPoint, setStartPoint] = useState("")
  const [endPoint, setEndPoint] = useState("")
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)

  const [stops, setStops] = useState<string[]>([])
  const [newStop, setNewStop] = useState("")
  const [stopInputKey, setStopInputKey] = useState(0)

  const [showStartPicker, setShowStartPicker] = useState(false)
  const [showEndPicker, setShowEndPicker] = useState(false)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(false)

  const loadTrip = async () => {
    if (!tripId) return
    try {
      setInitialLoading(true)
      const tripRef = doc(db, "trips", tripId as string)
      const snapshot = await getDoc(tripRef)
      if (snapshot.exists()) {
        const data = snapshot.data()
        setTitle(data.title)
        setStartPoint(data.startPoint)
        setEndPoint(data.endPoint)
        setStartDate(new Date(data.startDate))
        setEndDate(new Date(data.endDate))
        setStops(data.stops || [])
      }
    } catch (err) {
      Alert.alert("Error", "Failed to load trip")
    } finally {
      setInitialLoading(false)
    }
  }

  useEffect(() => {
    if (isEditMode) loadTrip()
  }, [tripId])

  const addStop = () => {
    if (!newStop.trim()) return
    setStops(prev => [...prev, newStop.trim()])
    setNewStop("")
    setStopInputKey(prev => prev + 1)
  }

  const removeStop = (index: number) => {
    setStops(prev => prev.filter((_, i) => i !== index))
  }

  const saveTrip = async () => {
    if (!title || !startPoint || !endPoint || !startDate || !endDate) {
      Alert.alert("Error", "Please fill all required fields")
      return
    }
    try {
      setLoading(true)
      const payload = {
        title,
        startPoint,
        endPoint,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        stops,
        userId: auth.currentUser?.uid,
        status: startDate >= new Date() ? "Upcoming" : "Completed",
        updatedAt: new Date().toISOString()
      }

      if (isEditMode) {
        const ref = doc(db, "trips", tripId as string)
        await updateDoc(ref, payload)
      } else {
        await addDoc(collection(db, "trips"), { ...payload, createdAt: new Date().toISOString() })
      }
      router.push("/(dashboard)/(tabs)/trip")
    } catch (err) {
      Alert.alert("Error", "Failed to save trip")
    } finally {
      setLoading(false)
    }
  }

  const deleteTrip = async () => {
    Alert.alert("Delete Trip", "This action cannot be undone.", [
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

  if (initialLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#F8FAFC]">
        <ActivityIndicator size="large" color="#FF6D4D" />
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-[#F8FAFC]"
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <StatusBar barStyle="dark-content" />
      <FlatList
        data={stops}
        keyExtractor={(_, i) => i.toString()}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 40 }}
        ListHeaderComponent={
          <View className="px-6 pt-14">
            {/* HEADER */}
            <View className="flex-row items-center mb-8">
              <TouchableOpacity 
                onPress={() => router.push("/(dashboard)/(tabs)/trip")} 
                className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm"
              >
                <Ionicons name="chevron-back" size={24} color="#1A2B48" />
              </TouchableOpacity>
              <Text className="text-2xl font-black text-[#1A2B48] ml-4">
                {isEditMode ? "Edit Trip" : "New Journey"}
              </Text>
            </View>

            {/* FORM FIELDS */}
            <View className="space-y-5">
              <View>
                <Text className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mb-2 ml-1">Trip Title</Text>
                <TextInput
                  placeholder="e.g. Summer in Ella"
                  placeholderTextColor="#CBD5E1"
                  className="bg-white p-4 rounded-2xl border border-gray-100 font-bold text-[#1A2B48]"
                  value={title}
                  onChangeText={setTitle}
                />
              </View>

              <View>
                <Text className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mb-2 ml-1">Start Point</Text>
                <LocationSearchInput
                  placeholder="Where are you starting?"
                  value={startPoint}
                  onSelect={setStartPoint}
                />
              </View>

              <View>
                <Text className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mb-2 ml-1">End Point</Text>
                <LocationSearchInput
                  placeholder="Your destination"
                  value={endPoint}
                  onSelect={setEndPoint}
                />
              </View>

              {/* DATES */}
              <View className="flex-row gap-4">
                <View className="flex-1">
                  <Text className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mb-2 ml-1">Start Date</Text>
                  <TouchableOpacity
                    onPress={() => setShowStartPicker(true)}
                    className="bg-white p-4 rounded-2xl border border-gray-100 flex-row items-center"
                  >
                    <Ionicons name="calendar-outline" size={16} color="#FF6D4D" />
                    <Text className="ml-2 font-bold text-[#1A2B48]">
                      {startDate ? startDate.toLocaleDateString() : "Select"}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View className="flex-1">
                  <Text className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mb-2 ml-1">End Date</Text>
                  <TouchableOpacity
                    onPress={() => setShowEndPicker(true)}
                    className="bg-white p-4 rounded-2xl border border-gray-100 flex-row items-center"
                  >
                    <Ionicons name="calendar-outline" size={16} color="#FF6D4D" />
                    <Text className="ml-2 font-bold text-[#1A2B48]">
                      {endDate ? endDate.toLocaleDateString() : "Select"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* STOPS INPUT */}
              <View>
                <Text className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mb-2 ml-1">Waypoints (Optional)</Text>
                <View className="flex-row gap-2">
                  <View className="flex-1">
                    <LocationSearchInput
                      key={stopInputKey}
                      placeholder="Add a stop along the way"
                      value={newStop}
                      onSelect={setNewStop}
                    />
                  </View>
                  <TouchableOpacity
                    onPress={addStop}
                    className="bg-[#FF6D4D] w-14 h-14 rounded-2xl items-center justify-center shadow-lg shadow-orange-500/30"
                  >
                    <Ionicons name="add" size={28} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <Text className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mt-6 mb-2 ml-1">Your Route</Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <View className="bg-white p-4 rounded-2xl mb-2 mx-6 border border-gray-50 flex-row justify-between items-center shadow-sm">
            <View className="flex-row items-center">
              <View className="w-2 h-2 rounded-full bg-[#FF6D4D] mr-3" />
              <Text className="font-bold text-[#1A2B48]">{item}</Text>
            </View>
            <TouchableOpacity onPress={() => removeStop(index)}>
              <Ionicons name="trash-outline" size={18} color="#CBD5E1" />
            </TouchableOpacity>
          </View>
        )}
        ListFooterComponent={
          <View className="px-6 mt-8 space-y-3">
            <TouchableOpacity
              onPress={saveTrip}
              disabled={loading}
              className="bg-[#1A2B48] p-5 rounded-[22px] items-center shadow-xl shadow-slate-900/20"
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-black text-lg">
                  {isEditMode ? "Update Itinerary" : "Create Adventure"}
                </Text>
              )}
            </TouchableOpacity>

            {isEditMode && (
              <TouchableOpacity
                onPress={deleteTrip}
                className="p-4 items-center"
              >
                <Text className="text-red-500 font-bold">Cancel Trip</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      {showStartPicker && (
        <DateTimePicker
          value={startDate || new Date()}
          mode="date"
          display="default"
          onChange={(e, date) => {
            setShowStartPicker(false)
            if (date) setStartDate(date)
          }}
        />
      )}
      {showEndPicker && (
        <DateTimePicker
          value={endDate || new Date()}
          mode="date"
          display="default"
          onChange={(e, date) => {
            setShowEndPicker(false)
            if (date) setEndDate(date)
          }}
        />
      )}
    </KeyboardAvoidingView>
  )
}