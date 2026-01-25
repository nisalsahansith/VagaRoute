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
  ActivityIndicator
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

  // ---------------- LOAD TRIP FOR EDIT ----------------
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

  // ---------------- ADD / REMOVE STOP ----------------
  const addStop = () => {
    if (!newStop.trim()) return
    setStops(prev => [...prev, newStop.trim()])
    setNewStop("") // clear input after adding
    setStopInputKey(prev => prev + 1) // force LocationSearchInput reset
  }

  const removeStop = (index: number) => {
    setStops(prev => prev.filter((_, i) => i !== index))
  }

  // ---------------- SAVE / UPDATE TRIP ----------------
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
        Alert.alert("Updated", "Trip updated successfully")
      } else {
        await addDoc(collection(db, "trips"), { ...payload, createdAt: new Date().toISOString() })
        Alert.alert("Success", "Trip created successfully")
      }

      router.push("/(dashboard)/(tabs)/trip")
    } catch (err) {
      Alert.alert("Error", "Failed to save trip")
    } finally {
      setLoading(false)
    }
  }

  // ---------------- DELETE TRIP ----------------
  const deleteTrip = async () => {
    Alert.alert("Delete Trip", "Are you sure?", [
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

  // ---------------- LOADER ----------------
  if (initialLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#F8FAFC]">
        <ActivityIndicator size="large" color="#FF6D4D" />
      </View>
    )
  }

  // ---------------- UI ----------------
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-[#F8FAFC]"
    >
      <FlatList
        data={stops}
        keyExtractor={(_, i) => i.toString()}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View className="px-5 pt-14">
            {/* HEADER */}
            <View className="flex-row items-center mb-6 justify-between">
              <TouchableOpacity onPress={() => router.push("/(dashboard)/(tabs)/trip")}>
                <Ionicons name="arrow-back" size={26} color="#1A2B48" />
              </TouchableOpacity>

              <Text className="text-2xl font-bold text-[#1A2B48]">
                {isEditMode ? "Edit Trip" : "Create Trip"}
              </Text>

              <View className="w-6" />
            </View>

            {/* TITLE */}
            <Text className="font-semibold mb-2 mt-4">Trip Title*</Text>
            <TextInput
              placeholder="Ella Adventure"
              className="bg-white p-4 rounded-2xl border border-[#E2E8F0]"
              value={title}
              onChangeText={setTitle}
            />

            {/* START POINT */}
            <Text className="font-semibold mb-2 mt-4">Start Point*</Text>
            <LocationSearchInput
              placeholder="Search start location"
              value={startPoint}
              onSelect={setStartPoint}
            />

            {/* END POINT */}
            <Text className="font-semibold mb-2 mt-4">End Point*</Text>
            <LocationSearchInput
              placeholder="Search destination"
              value={endPoint}
              onSelect={setEndPoint}
            />

            {/* DATES */}
            <View className="flex-row gap-3 mb-4 mt-4">
              <View className="flex-1">
                <Text className="font-semibold mb-2">Start Date*</Text>
                <TouchableOpacity
                  onPress={() => setShowStartPicker(true)}
                  className="bg-white p-4 rounded-2xl border border-[#E2E8F0]"
                >
                  <Text>{startDate ? startDate.toDateString() : "Select date"}</Text>
                </TouchableOpacity>

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
              </View>

              <View className="flex-1">
                <Text className="font-semibold mb-2">End Date*</Text>
                <TouchableOpacity
                  onPress={() => setShowEndPicker(true)}
                  className="bg-white p-4 rounded-2xl border border-[#E2E8F0]"
                >
                  <Text>{endDate ? endDate.toDateString() : "Select date"}</Text>
                </TouchableOpacity>

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
              </View>
            </View>

            {/* STOPS */}
            <Text className="font-semibold mb-2">Stops</Text>
            <View className="flex-row gap-2 mb-3">
              <View className="flex-1">
                <LocationSearchInput
                  key={stopInputKey} // force reset after adding
                  placeholder="Add stop"
                  value={newStop}
                //   onChangeText={setNewStop} // controlled input
                  onSelect={setNewStop}
                />
              </View>

              <TouchableOpacity
                onPress={addStop}
                className="bg-[#FF6D4D] w-12 h-12 rounded-2xl items-center justify-center"
              >
                <Ionicons name="add" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        }
        renderItem={({ item, index }) => (
          <View className="bg-white p-3 rounded-xl mb-2 mx-5 border border-[#E2E8F0] flex-row justify-between items-center">
            <Text>{item}</Text>
            <TouchableOpacity onPress={() => removeStop(index)}>
              <Ionicons name="close-circle" size={20} color="#FF6D4D" />
            </TouchableOpacity>
          </View>
        )}
        ListFooterComponent={
          <View className="mx-5 mt-6 mb-12">
            <TouchableOpacity
              onPress={saveTrip}
              disabled={loading}
              className="bg-[#1A2B48] p-5 rounded-2xl items-center"
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-lg">
                  {isEditMode ? "Update Trip" : "Save Trip"}
                </Text>
              )}
            </TouchableOpacity>

            {isEditMode && (
              <TouchableOpacity
                onPress={deleteTrip}
                className="bg-red-500 p-4 rounded-2xl items-center mt-4"
              >
                <Text className="text-white font-bold">Delete Trip</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
    </KeyboardAvoidingView>
  )
}
