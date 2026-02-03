import React, { useEffect, useState } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  Alert,
  TextInput,
  StatusBar,
  Platform
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
  const [saving, setSaving] = useState(false)

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

  // Explicit color constants for consistency
  const PLACEHOLDER_COLOR = "#94A3B8"
  const TEXT_COLOR = "#1A2B48"

  useEffect(() => {
    if (!tripId) return
    const unsub = subscribeActivities(tripId as string, list => {
      setActivities(list)
      setLoading(false)
    })
    return unsub
  }, [tripId])

  const resetForm = () => {
    setTitle(""); setType("custom"); setDate(null); setStartTime(null);
    setEndTime(null); setLocation(""); setNotes(""); setEditingActivity(null);
  }

  const openAddModal = () => { resetForm(); setModalVisible(true); }

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

  const saveActivity = async () => {
    if (!title || !date || !startTime) {
      Alert.alert("Missing fields", "Title, date, and start time are required")
      return
    }

    setSaving(true)
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
      setSaving(false)
    }
  }

  const removeActivity = (id: string) => {
    Alert.alert("Delete Activity", "Remove this activity?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => await deleteActivity(tripId as string, id) }
    ])
  }

  const getActivityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'flight': return 'airplane'
      case 'hotel': return 'bed'
      case 'restaurant': return 'restaurant'
      case 'activity': return 'ticket'
      default: return 'map'
    }
  }

  if (loading) return (
    <View className="flex-1 justify-center items-center bg-[#F8FAFC]">
      <ActivityIndicator size="large" color="#FF6D4D" />
    </View>
  )

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      <StatusBar barStyle="dark-content" />
      
      {/* HEADER */}
      <View className="pt-14 pb-6 px-6 bg-white flex-row justify-between items-center border-b border-gray-100 shadow-sm">
        <TouchableOpacity 
          onPress={() => router.push({ pathname: "/trips/details", params: { tripId: tripId } })}
          className="w-10 h-10 items-center justify-center rounded-full bg-gray-50"
        >
          <Ionicons name="chevron-back" size={24} color={TEXT_COLOR} />
        </TouchableOpacity>

        <View className="items-center">
            <Text className="text-[10px] font-black text-[#FF6D4D] uppercase tracking-[2px]">Timeline</Text>
            <Text className="text-lg font-black text-[#1A2B48] max-w-[200px]" numberOfLines={1}>{tripTitle || "Activities"}</Text>
        </View>

        <TouchableOpacity onPress={openAddModal} className="bg-[#FF6D4D] w-10 h-10 items-center justify-center rounded-xl shadow-lg shadow-orange-500/30">
          <Ionicons name="add" size={26} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {activities.length === 0 ? (
          <View className="items-center mt-20">
            <Ionicons name="calendar-outline" size={64} color="#CBD5E1" />
            <Text className="text-[#94A3B8] font-bold mt-4 text-center">No plans yet.{"\n"}Ready for departure?</Text>
          </View>
        ) : (
          activities.map((item, index) => (
            <View key={item.id} className="flex-row">
              <View className="items-center mr-4">
                <View className="bg-[#1A2B48] w-10 h-10 rounded-2xl items-center justify-center z-10 shadow-md">
                  <Ionicons name={getActivityIcon(item.type || 'custom') as any} size={18} color="white" />
                </View>
                {index !== activities.length - 1 && (
                  <View className="w-[2px] flex-1 bg-[#E2E8F0] my-1" />
                )}
              </View>

              <TouchableOpacity 
                activeOpacity={0.8}
                onPress={() => openEditModal(item)}
                className="flex-1 bg-white p-5 rounded-[24px] shadow-sm border border-gray-50 mb-6"
              >
                <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                        <Text className="font-black text-[#1A2B48] text-base mb-1">{item.title}</Text>
                        <Text className="text-[#FF6D4D] text-[11px] font-black uppercase tracking-widest">
                            {item.startTime} {item.endTime ? `— ${item.endTime}` : ''}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={() => removeActivity(item.id!)} className="p-1">
                        <Ionicons name="trash-outline" size={18} color="#CBD5E1" />
                    </TouchableOpacity>
                </View>

                {item.location?.name && (
                    <View className="flex-row items-center mt-3 bg-gray-50 self-start px-2 py-1 rounded-md">
                        <Ionicons name="location" size={10} color="#94A3B8" />
                        <Text className="text-[#94A3B8] text-[10px] font-bold ml-1">{item.location.name}</Text>
                    </View>
                )}

                {item.notes && (
                    <Text className="text-[#64748B] text-xs mt-3 italic" numberOfLines={2}>
                        "{item.notes}"
                    </Text>
                )}
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {/* FORM MODAL */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setModalVisible(false)}>
        <View className="flex-1 bg-[#F8FAFC]">
          <View className="p-6 flex-row justify-between items-center bg-white border-b border-gray-100">
            <Text className="text-xl font-black text-[#1A2B48]">
                {editingActivity ? "Edit Activity" : "New Plan"}
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close-circle" size={28} color="#CBD5E1" />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 px-6 pt-6">
            <View className="space-y-4">
                <TextInput
                    placeholder="Title (Flight, Hotel, Dinner...)"
                    placeholderTextColor={PLACEHOLDER_COLOR}
                    value={title}
                    onChangeText={setTitle}
                    className="bg-white p-4 rounded-2xl border border-gray-100 font-bold text-[#1A2B48]"
                />
                <TextInput
                    placeholder="Type (flight, hotel, restaurant, custom)"
                    placeholderTextColor={PLACEHOLDER_COLOR}
                    value={type}
                    onChangeText={t => setType(t as any)}
                    className="bg-white p-4 rounded-2xl border border-gray-100 font-bold text-[#1A2B48]"
                />
                
                <View className="flex-row justify-between">
                    <TouchableOpacity onPress={() => setShowDatePicker(true)} className="bg-white p-4 rounded-2xl border border-gray-100 w-[48%] items-center">
                        <Ionicons name="calendar" size={18} color="#FF6D4D" />
                        <Text style={{ color: date ? TEXT_COLOR : PLACEHOLDER_COLOR }} className="font-bold mt-1">
                          {date ? date.toDateString() : "Date"}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => setShowStartTimePicker(true)} className="bg-white p-4 rounded-2xl border border-gray-100 w-[48%] items-center">
                        <Ionicons name="time" size={18} color="#FF6D4D" />
                        <Text style={{ color: startTime ? TEXT_COLOR : PLACEHOLDER_COLOR }} className="font-bold mt-1">
                          {startTime ? startTime.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : "Start"}
                        </Text>
                    </TouchableOpacity>
                </View>

                <TextInput
                    placeholder="Location"
                    placeholderTextColor={PLACEHOLDER_COLOR}
                    value={location}
                    onChangeText={setLocation}
                    className="bg-white p-4 rounded-2xl border border-gray-100 font-bold text-[#1A2B48]"
                />
                <TextInput
                    placeholder="Notes"
                    placeholderTextColor={PLACEHOLDER_COLOR}
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    className="bg-white p-4 rounded-2xl border border-gray-100 h-24 font-medium text-[#1A2B48]"
                />
            </View>

            <TouchableOpacity
                onPress={saveActivity}
                disabled={saving}
                className={`p-5 rounded-[24px] items-center mt-8 mb-4 shadow-xl shadow-orange-500/20 ${saving ? "bg-gray-400" : "bg-[#FF6D4D]"}`}
            >
                {saving ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-black text-lg">{editingActivity ? "Update Activity" : "Save Activity"}</Text>}
            </TouchableOpacity>
          </ScrollView>
        </View>

        {showDatePicker && (
          <DateTimePicker 
            value={date || new Date()} 
            mode="date" 
            display={Platform.OS === 'ios' ? 'spinner' : 'default'} 
            onChange={(e, d) => { setShowDatePicker(false); if(d) setDate(d); }} 
          />
        )}
        {showStartTimePicker && (
          <DateTimePicker 
            value={startTime || new Date()} 
            mode="time" 
            display={Platform.OS === 'ios' ? 'spinner' : 'default'} 
            onChange={(e, t) => { setShowStartTimePicker(false); if(t) setStartTime(t); }} 
          />
        )}
      </Modal>
    </View>
  )
}