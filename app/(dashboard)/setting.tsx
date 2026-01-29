import React, { useEffect, useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator
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

  const [loadingName, setLoadingName] = useState(false)
  const [loadingPassword, setLoadingPassword] = useState(false)
  const [loadingUser, setLoadingUser] = useState(true)

  // ---------------- LOAD CURRENT USER DATA ----------------
  const loadUserData = async () => {
    try {
      if (!user) return
      const userRef = doc(db, "Users", user.uid)
      const snapshot = await getDoc(userRef)

        if (snapshot.exists()) {
        const data = snapshot.data()
            setName(data.displayName)

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

  // ---------------- CHANGE NAME ----------------
  const handleChangeName = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Name cannot be empty")
      return
    }

    try {
      if (!user) return
      setLoadingName(true)

      await setDoc(
        doc(db, "Users", user.uid),
        {
          displayName: name.trim(),
          updatedAt: serverTimestamp()
        },
        { merge: true }
      )

      Alert.alert("Success", "Name updated successfully")
    } catch (err) {
      console.log("Name update error", err)
      Alert.alert("Error", "Could not update name")
    } finally {
      setLoadingName(false)
    }
  }

  // ---------------- CHANGE PASSWORD ----------------
  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert("Error", "Fill in both password fields")
      return
    }

    if (newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters")
      return
    }

    try {
      if (!user || !user.email) return
      setLoadingPassword(true)

      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      )

      await reauthenticateWithCredential(user, credential)
      await updatePassword(user, newPassword)

      Alert.alert("Success", "Password updated successfully")
      setCurrentPassword("")
      setNewPassword("")
    } catch (err: any) {
      console.log("Password error", err)

      if (err.code === "auth/wrong-password") {
        Alert.alert("Error", "Current password is incorrect")
      } else {
        Alert.alert("Error", "Could not update password")
      }
    } finally {
      setLoadingPassword(false)
    }
  }

  // ---------------- DELETE ACCOUNT ----------------
  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This action is permanent. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              if (!user) return
              await user.delete()
              router.replace("/(auth)/login")
            } catch (err) {
              Alert.alert(
                "Reauthentication Required",
                "Please log in again before deleting your account."
              )
            }
          }
        }
      ]
    )
  }

  // ---------------- LOADING ----------------
  if (loadingUser) {
    return (
      <View className="flex-1 justify-center items-center bg-[#F8FAFC]">
        <ActivityIndicator size="large" color="#FF6D4D" />
      </View>
    )
  }

  return (
    <View className="flex-1 bg-[#F8FAFC] pt-20 px-5">
      {/* HEADER */}
      <View className="flex-row items-center mb-8">
        <TouchableOpacity onPress={() => router.push("/(dashboard)/(tabs)/profile")} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#1A2B48" />
        </TouchableOpacity>

        <Text className="text-2xl font-bold text-[#1A2B48]">
          Settings
        </Text>
      </View>

      {/* CHANGE NAME */}
      <View className="bg-white p-6 rounded-3xl border border-[#E2E8F0] mb-6">
        <Text className="text-lg font-bold text-[#1A2B48] mb-4">
          Change Name
        </Text>

        <TextInput
          placeholder="Enter new name"
          value={name}
          onChangeText={setName}
          className="bg-[#F8FAFC] p-4 rounded-2xl mb-4 border border-[#E2E8F0]"
        />

        <TouchableOpacity
          onPress={handleChangeName}
          disabled={loadingName}
          className="bg-[#FF6D4D] p-4 rounded-2xl items-center"
        >
          {loadingName ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold">Save Name</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* CHANGE PASSWORD */}
      <View className="bg-white p-6 rounded-3xl border border-[#E2E8F0] mb-6">
        <Text className="text-lg font-bold text-[#1A2B48] mb-4">
          Change Password
        </Text>

        <TextInput
          placeholder="Current Password"
          secureTextEntry
          value={currentPassword}
          onChangeText={setCurrentPassword}
          className="bg-[#F8FAFC] p-4 rounded-2xl mb-3 border border-[#E2E8F0]"
        />

        <TextInput
          placeholder="New Password"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
          className="bg-[#F8FAFC] p-4 rounded-2xl mb-4 border border-[#E2E8F0]"
        />

        <TouchableOpacity
          onPress={handleChangePassword}
          disabled={loadingPassword}
          className="bg-[#FF6D4D] p-4 rounded-2xl items-center"
        >
          {loadingPassword ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold">Update Password</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* ACCOUNT INFO */}
      <View className="bg-white p-6 rounded-3xl border border-[#E2E8F0] mb-6">
        <Text className="text-lg font-bold text-[#1A2B48] mb-2">
          Account Info
        </Text>

        <Text className="text-[#94A3B8]">
          Email: {user?.email}
        </Text>
      </View>

      {/* DELETE ACCOUNT */}
      <TouchableOpacity
        onPress={handleDeleteAccount}
        className="bg-red-100 p-5 rounded-2xl items-center"
      >
        <Text className="text-red-600 font-bold">Delete Account</Text>
      </TouchableOpacity>
    </View>
  )
}
