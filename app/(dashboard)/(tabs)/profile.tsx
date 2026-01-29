import React, { useEffect, useState } from "react"
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { auth, db } from "@/services/firebase"
import { signOut } from "firebase/auth"
import { doc, getDoc, updateDoc, collection, getDocs, query, where, setDoc, serverTimestamp } from "firebase/firestore"
import * as ImagePicker from "expo-image-picker"
import { uploadToCloudinary } from "@/utils/cloudinary"
import { logout } from "@/services/auth_service"
import { useRouter } from "expo-router"

export default function ProfileScreen() {
  const user = auth.currentUser
  const router = useRouter()

  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [tripCount, setTripCount] = useState(0)
  

  // ---------------- LOAD USER DATA ----------------
  const loadUserData = async () => {
    try {
      if (!user) return

      const userRef = doc(db, "Users", user.uid)
      const snapshot = await getDoc(userRef)

      if (snapshot.exists()) {
        setUserData(snapshot.data())
      }
    } catch (err) {
      console.log("Error loading user data", err)
    } finally {
      setLoading(false)
    }
  }

  // ---------------- LOAD TRIP COUNT ----------------
  const loadTripCount = async () => {
    try {
      if (!user) return

      const q = query(
        collection(db, "trips"),
        where("userId", "==", user.uid)
      )

      const snap = await getDocs(q)
      setTripCount(snap.size)
    } catch (err) {
      console.log("Error loading trip count", err)
    }
  }

  // ---------------- LOGOUT ----------------
  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to exit?", [
      { text: "Cancel", style: "cancel" },
      {
      text: "Logout",
      onPress: async () => {
        await logout()
        router.replace("/(auth)/login")
      }
    }
    ])
  }

  // ---------------- IMAGE PICKER ----------------
  const pickImage = () => {
    Alert.alert("Profile Photo", "Choose an option", [
      { text: "Camera", onPress: openCamera },
      { text: "Gallery", onPress: openGallery },
      { text: "Cancel", style: "cancel" }
    ])
  }

  const openCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync()
    if (!permission.granted) {
      Alert.alert("Permission required", "Camera access is needed.")
      return
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7
    })

    if (!result.canceled && result.assets?.length) {
      uploadImage(result.assets[0].uri)
    }
  }

  const openGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) {
      Alert.alert("Permission required", "Gallery access is needed.")
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7
    })

    if (!result.canceled && result.assets?.length) {
      uploadImage(result.assets[0].uri)
    }
  }

  // ---------------- UPLOAD ----------------
  const uploadImage = async (uri: string) => {
    try {
      if (!user) return
      setUploading(true)

      const imageUrl = await uploadToCloudinary(uri)

      await setDoc(
      doc(db, "Users", user.uid),
      {
        photoURL: imageUrl,
        updatedAt: serverTimestamp(),
        email: user.email
      },
      { merge: true } // 👈 THIS IS THE KEY
    )

      // Instantly update UI
      setUserData((prev: any) => ({
        ...prev,
        photoURL: imageUrl
      }))
    } catch (err) {
      console.log("Upload error:", err)
      Alert.alert("Upload failed", "Could not upload image")
    } finally {
      setUploading(false)
    }
  }

  useEffect(() => {
    loadUserData()
    loadTripCount()
  }, [])

  // ---------------- LOADING ----------------
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#F8FAFC]">
        <ActivityIndicator size="large" color="#FF6D4D" />
      </View>
    )
  }

  // ---------------- UI ----------------
  return (
    <View className="flex-1 bg-[#F8FAFC] pt-20 px-5 items-center">
      {/* Profile Picture */}
      <TouchableOpacity
        onPress={pickImage}
        className="w-32 h-32 rounded-full border-4 border-[#FF6D4D] p-1 mb-4 shadow-lg"
      >
        {uploading ? (
          <ActivityIndicator color="#FF6D4D" />
        ) : (
          <Image
            source={{
              uri:
                userData?.photoURL ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png"
            }}
            className="w-full h-full rounded-full"
          />
        )}

        <View className="absolute bottom-1 right-1 bg-[#FF6D4D] p-2 rounded-full">
          <Ionicons name="camera" size={16} color="white" />
        </View>
      </TouchableOpacity>

      {/* Name & Username */}
      <Text className="text-2xl font-bold text-[#1A2B48]">
        {userData?.displayName || "Traveler"}
      </Text>
      <Text className="text-[#94A3B8] mb-8">
        {userData?.username || user?.email}
      </Text>

      {/* Stats */}
      <View className="flex-row bg-white rounded-3xl p-6 shadow-sm border border-[#E2E8F0] w-full mb-6 justify-center">
        <View className="items-center">
          <Text className="text-xl font-bold text-[#1A2B48]">
            {tripCount}
          </Text>
          <Text className="text-[#94A3B8]">Trips</Text>
        </View>
      </View>

      {/* Buttons */}
      <TouchableOpacity
        onPress={() => router.push("/(dashboard)/setting")}
        className="w-full flex-row items-center bg-white p-5 rounded-2xl mb-4 border border-[#E2E8F0]"
      >
        <Ionicons name="settings-outline" size={20} color="#1A2B48" />
        <Text className="ml-4 font-bold text-[#1A2B48]">
          Account Settings
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleLogout}
        className="w-full flex-row items-center bg-[#FF6D4D]/10 p-5 rounded-2xl"
      >
        <Ionicons name="log-out-outline" size={20} color="#FF6D4D" />
        <Text className="ml-4 font-bold text-[#FF6D4D]">
          Logout
        </Text>
      </TouchableOpacity>
    </View>
  )
}
