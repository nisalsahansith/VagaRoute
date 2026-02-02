import React, { useEffect, useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { auth, db } from "@/services/firebase"
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from "firebase/auth"
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"

export default function SettingsScreen() {
  const router = useRouter()
  const user = auth.currentUser

  const [name, setName] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)

  const [loadingName, setLoadingName] = useState(false)
  const [loadingPassword, setLoadingPassword] = useState(false)
  const [loadingUser, setLoadingUser] = useState(true)

  const loadUserData = async () => {
    try {
      if (!user) return
      const userRef = doc(db, "Users", user.uid)
      const snapshot = await getDoc(userRef)
      if (snapshot.exists()) {
        setName(snapshot.data().displayName || "")
      }
    } catch (err) {
      console.log("Error loading user data", err)
    } finally {
      setLoadingUser(false)
    }
  }

  useEffect(() => {
    loadUserData()
  }, [])

  const handleChangeName = async () => {
    if (!name.trim()) return Alert.alert("Error", "Name cannot be empty")
    try {
      if (!user) return
      setLoadingName(true)
      await setDoc(doc(db, "Users", user.uid), { displayName: name.trim(), updatedAt: serverTimestamp() }, { merge: true })
      Alert.alert("Success", "Profile name updated!")
    } catch (err) {
      Alert.alert("Error", "Could not update name")
    } finally {
      setLoadingName(false)
    }
  }

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) return Alert.alert("Error", "Please fill in all fields")
    if (newPassword.length < 6) return Alert.alert("Error", "New password is too short")

    try {
      if (!user || !user.email) return
      setLoadingPassword(true)
      const credential = EmailAuthProvider.credential(user.email, currentPassword)
      await reauthenticateWithCredential(user, credential)
      await updatePassword(user, newPassword)
      Alert.alert("Success", "Security settings updated")
      setCurrentPassword(""); setNewPassword("")
    } catch (err: any) {
      Alert.alert("Security Error", err.code === "auth/wrong-password" ? "Incorrect current password" : "Update failed")
    } finally {
      setLoadingPassword(false)
    }
  }

  if (loadingUser) {
    return (
      <View className="flex-1 justify-center items-center bg-[#F8FAFC]">
        <ActivityIndicator size="large" color="#FF6D4D" />
      </View>
    )
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-[#F8FAFC]"
    >
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 60 }}>
        {/* HEADER */}
        <View className="pt-16 px-6 pb-6 bg-white rounded-b-[40px] shadow-sm shadow-black/5 flex-row items-center">
          <TouchableOpacity onPress={() => router.push("/(dashboard)/(tabs)/profile")} className="bg-[#F8FAFC] p-2 rounded-xl border border-[#F1F5F9]">
            <Ionicons name="chevron-back" size={24} color="#1A2B48" />
          </TouchableOpacity>
          <Text className="ml-4 text-2xl font-black text-[#1A2B48]">Settings</Text>
        </View>

        <View className="p-6">
          {/* PERSONAL INFO SECTION */}
          <Text className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[2px] mb-4 ml-2">Personal Information</Text>
          <View className="bg-white p-6 rounded-[32px] border border-[#F1F5F9] mb-8 shadow-sm shadow-black/5">
            <View className="mb-4">
              <Text className="text-xs font-bold text-[#64748B] mb-2 ml-1">Display Name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0] font-semibold text-[#1A2B48]"
              />
            </View>
            <View>
              <Text className="text-xs font-bold text-[#64748B] mb-2 ml-1">Email Address</Text>
              <TextInput
                value={user?.email || ""}
                editable={false}
                className="bg-[#F1F5F9] p-4 rounded-2xl border border-[#E2E8F0] text-[#94A3B8] font-medium"
              />
            </View>
            <TouchableOpacity
              onPress={handleChangeName}
              disabled={loadingName}
              className="bg-[#1A2B48] p-4 rounded-2xl items-center mt-6"
            >
              {loadingName ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold">Update Profile</Text>}
            </TouchableOpacity>
          </View>

          {/* SECURITY SECTION */}
          <Text className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[2px] mb-4 ml-2">Security</Text>
          <View className="bg-white p-6 rounded-[32px] border border-[#F1F5F9] mb-8 shadow-sm shadow-black/5">
            <View className="mb-4">
              <Text className="text-xs font-bold text-[#64748B] mb-2 ml-1">Current Password</Text>
              <View className="flex-row items-center bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] px-4">
                <TextInput
                  secureTextEntry={!showCurrent}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  className="flex-1 py-4 font-semibold text-[#1A2B48]"
                />
                <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)}>
                  <Ionicons name={showCurrent ? "eye-off" : "eye"} size={20} color="#94A3B8" />
                </TouchableOpacity>
              </View>
            </View>

            <View className="mb-6">
              <Text className="text-xs font-bold text-[#64748B] mb-2 ml-1">New Password</Text>
              <View className="flex-row items-center bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] px-4">
                <TextInput
                  secureTextEntry={!showNew}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  className="flex-1 py-4 font-semibold text-[#1A2B48]"
                />
                <TouchableOpacity onPress={() => setShowNew(!showNew)}>
                  <Ionicons name={showNew ? "eye-off" : "eye"} size={20} color="#94A3B8" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleChangePassword}
              disabled={loadingPassword}
              className="bg-[#FF6D4D] p-4 rounded-2xl items-center"
            >
              {loadingPassword ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold">Change Password</Text>}
            </TouchableOpacity>
          </View>

          {/* DANGER ZONE */}
          <View className="mt-4 items-center">
            <TouchableOpacity 
              onPress={() => Alert.alert("Delete Account", "This cannot be undone.", [
                { text: "Cancel", style: "cancel" },
                { text: "Delete Permanently", style: "destructive", onPress: () => user?.delete().then(() => router.replace("/(auth)/login")) }
              ])}
              className="flex-row items-center p-4"
            >
              <Ionicons name="trash-outline" size={18} color="#EF4444" />
              <Text className="ml-2 text-[#EF4444] font-bold">Deactivate Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}