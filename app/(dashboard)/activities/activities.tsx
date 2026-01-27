import React, { useEffect, useState } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  Alert,
  TextInput
} from "react-native"
import DateTimePicker from "@react-native-community/datetimepicker"
import { useLocalSearchParams, useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import {
  createActivity,
  updateActivity,
  subscribeActivities,
  deleteActivity,
  Activity
} from "@/services/activity_service"

export default function ActivitiesScreen() {
  const { tripId, tripTitle } = useLocalSearchParams()
  const router = useRouter()

  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)
  const [saving, setSaving] = useState(false) // Buffer for Save/Update

  // Form state
  const [title, setTitle] = useState("")
  const [type, setType] = useState<Activity["type"]>("custom")
  const [date, setDate] = useState<Date | null>(null)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [endTime, setEndTime] = useState<Date | null>(null)
  const [location, setLocation] = useState("")
  const [notes, setNotes] = useState("")

  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showStartTimePicker, setShowStartTimePicker] = useState(false)
  const [showEndTimePicker, setShowEndTimePicker] = useState(false)

  // ---------------- SUBSCRIBE ACTIVITIES ----------------
  useEffect(() => {
    if (!tripId) return

    const unsub = subscribeActivities(tripId as string, list => {
      setActivities(list)
      setLoading(false)
    })

    return unsub
  }, [])

  // ---------------- RESET FORM ----------------
  const resetForm = () => {
    setTitle("")
    setType("custom")
    setDate(null)
    setStartTime(null)
    setEndTime(null)
    setLocation("")
    setNotes("")
    setEditingActivity(null)
  }

  // ---------------- OPEN MODAL ----------------
  const openAddModal = () => {
    resetForm()
    setModalVisible(true)
  }

  const openEditModal = (activity: Activity) => {
    setEditingActivity(activity)
    setTitle(activity.title)
    setType(activity.type || "custom")
    setDate(activity.date ? new Date(activity.date) : null)
    setStartTime(activity.startTime ? new Date(`${activity.date}T${activity.startTime}`) : null)
    setEndTime(activity.endTime ? new Date(`${activity.date}T${activity.endTime}`) : null)
    setLocation(activity.location?.name || "")
    setNotes(activity.notes || "")
    setModalVisible(true)
  }

  // ---------------- SAVE OR UPDATE ACTIVITY ----------------
  const saveActivity = async () => {
    if (!title || !date || !startTime) {
      Alert.alert("Missing fields", "Title, date, and start time are required")
      return
    }

    setSaving(true) // start buffering

    const activityData: Partial<Activity> = {
      title,
      type,
      date: date.toISOString().split("T")[0],
      startTime: startTime.toTimeString().slice(0, 5),
      endTime: endTime ? endTime.toTimeString().slice(0, 5) : "",
      location: location ? { name: location } : undefined,
      notes,
      order: editingActivity ? editingActivity.order : activities.length
    }

    try {
      if (editingActivity) {
        await updateActivity(tripId as string, editingActivity.id!, activityData as Activity)
      } else {
        await createActivity(tripId as string, activityData as Activity)
      }

      setModalVisible(false)
      resetForm()
    } catch (err) {
      Alert.alert("Error", "Could not save activity")
    } finally {
      setSaving(false) // stop buffering
    }
  }

  // ---------------- DELETE ----------------
  const removeActivity = (id: string) => {
    Alert.alert("Delete Activity", "Remove this activity?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteActivity(tripId as string, id)
        }
      }
    ])
  }

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#F8FAFC]">
        <ActivityIndicator size="large" color="#FF6D4D" />
      </View>
    )
  }

  return (
    <View className="flex-1 bg-[#F8FAFC] pt-14 px-5">
      {/* HEADER */}
      <View className="flex-row justify-between items-center mb-6">
        <TouchableOpacity onPress={() => router.push("/(dashboard)/(tabs)/trip")}>
          <Ionicons name="arrow-back" size={26} color="#1A2B48" />
        </TouchableOpacity>

        <Text className="text-xl font-bold text-[#1A2B48]">
          {tripTitle || "Activities"}
        </Text>

        <TouchableOpacity onPress={openAddModal}>
          <Ionicons name="add-circle" size={32} color="#FF6D4D" />
        </TouchableOpacity>
      </View>

      {/* TIMELINE */}
      <ScrollView>
        {activities.length === 0 && (
          <Text className="text-center text-[#94A3B8] mt-10">
            No activities yet. Tap + to add one.
          </Text>
        )}

        {activities.map((item) => (
          <View
            key={item.id}
            className="bg-white p-5 rounded-3xl border border-[#E2E8F0] mb-4"
          >
            <View className="flex-row justify-between items-center mb-2">
              <Text className="font-bold text-lg text-[#1A2B48]">
                {item.title}
              </Text>

              <View className="flex-row gap-4">
                <TouchableOpacity onPress={() => openEditModal(item)}>
                  <Ionicons name="create-outline" size={20} color="#1A73E8" />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => removeActivity(item.id!)}>
                  <Ionicons name="trash" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>

            <Text className="text-[#94A3B8]">
              {item.date} • {item.startTime}
              {item.endTime && ` - ${item.endTime}`}
            </Text>

            {item.location?.name && (
              <Text className="text-[#64748B] mt-1">📍 {item.location.name}</Text>
            )}

            {item.notes && (
              <Text className="text-[#64748B] mt-2">{item.notes}</Text>
            )}
          </View>
        ))}
      </ScrollView>

      {/* ADD/EDIT MODAL */}
      <Modal visible={modalVisible} animationType="slide">
        <ScrollView className="flex-1 bg-[#F8FAFC] px-5 pt-14">
          <Text className="text-xl font-bold mb-6 text-[#1A2B48]">
            {editingActivity ? "Edit Activity" : "Add Activity"}
          </Text>

          {/* Title */}
          <TextInput
            placeholder="Title (Flight, Hotel, Dinner...)"
            value={title}
            onChangeText={setTitle}
            className="bg-white p-4 rounded-2xl mb-4 border border-[#E2E8F0]"
          />

          {/* Type */}
          <TextInput
            placeholder="Type (flight, hotel, restaurant, custom)"
            value={type}
            onChangeText={t => setType(t as any)}
            className="bg-white p-4 rounded-2xl mb-4 border border-[#E2E8F0]"
          />

          {/* DATE PICKER */}
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            className="bg-white p-4 rounded-2xl mb-4 border border-[#E2E8F0]"
          >
            <Text className="text-[#1A2B48]">
              {date ? date.toDateString() : "Select Date"}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={date || new Date()}
              mode="date"
              display="default"
              onChange={(e, selectedDate) => {
                setShowDatePicker(false)
                if (selectedDate) setDate(selectedDate)
              }}
            />
          )}

          {/* START TIME PICKER */}
          <TouchableOpacity
            onPress={() => setShowStartTimePicker(true)}
            className="bg-white p-4 rounded-2xl mb-4 border border-[#E2E8F0]"
          >
            <Text className="text-[#1A2B48]">
              {startTime
                ? startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                : "Select Start Time"}
            </Text>
          </TouchableOpacity>
          {showStartTimePicker && (
            <DateTimePicker
              value={startTime || new Date()}
              mode="time"
              display="default"
              onChange={(e, selectedTime) => {
                setShowStartTimePicker(false)
                if (selectedTime) setStartTime(selectedTime)
              }}
            />
          )}

          {/* END TIME PICKER */}
          <TouchableOpacity
            onPress={() => setShowEndTimePicker(true)}
            className="bg-white p-4 rounded-2xl mb-4 border border-[#E2E8F0]"
          >
            <Text className="text-[#1A2B48]">
              {endTime
                ? endTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                : "Select End Time (optional)"}
            </Text>
          </TouchableOpacity>
          {showEndTimePicker && (
            <DateTimePicker
              value={endTime || new Date()}
              mode="time"
              display="default"
              onChange={(e, selectedTime) => {
                setShowEndTimePicker(false)
                if (selectedTime) setEndTime(selectedTime)
              }}
            />
          )}

          {/* Location */}
          <TextInput
            placeholder="Location"
            value={location}
            onChangeText={setLocation}
            className="bg-white p-4 rounded-2xl mb-4 border border-[#E2E8F0]"
          />

          {/* Notes */}
          <TextInput
            placeholder="Notes"
            value={notes}
            onChangeText={setNotes}
            multiline
            className="bg-white p-4 rounded-2xl mb-6 border border-[#E2E8F0] h-24"
          />

          {/* Save/Update with buffering */}
          <TouchableOpacity
            onPress={saveActivity}
            disabled={saving}
            className={`p-4 rounded-2xl items-center mb-4 ${saving ? "bg-gray-400" : "bg-[#FF6D4D]"}`}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-bold">
                {editingActivity ? "Update Activity" : "Save Activity"}
              </Text>
            )}
          </TouchableOpacity>

          {/* Cancel */}
          <TouchableOpacity
            onPress={() => {
              setModalVisible(false)
              resetForm()
            }}
            className="p-4 items-center"
          >
            <Text className="text-[#94A3B8]">Cancel</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    </View>
  )
}
