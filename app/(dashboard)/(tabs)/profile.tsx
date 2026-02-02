import React, { useEffect, useState } from "react"
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StatusBar,
  ScrollView
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { auth, db } from "@/services/firebase"
import { doc, getDoc, collection, getDocs, query, where, setDoc, serverTimestamp } from "firebase/firestore"
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

  const loadUserData = async () => {
    try {
      if (!user) return
      const userRef = doc(db, "Users", user.uid)
      const snapshot = await getDoc(userRef)
      if (snapshot.exists()) setUserData(snapshot.data())
    } catch (err) {
      console.log("Error loading user data", err)
    } finally {
      setLoading(false)
    }
  }

  const loadTripCount = async () => {
    try {
      if (!user) return
      const q = query(collection(db, "trips"), where("userId", "==", user.uid))
      const snap = await getDocs(q)
      setTripCount(snap.size)
    } catch (err) {
      console.log("Error loading trip count", err)
    }
  }

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to log out of VagaRoute?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          await logout()
          router.replace("/(auth)/login")
        }
      }
    ])
  }

  const pickImage = () => {
    Alert.alert("Update Photo", "How would you like to select your picture?", [
      { text: "Take Photo", onPress: openCamera },
      { text: "Choose from Gallery", onPress: openGallery },
      { text: "Cancel", style: "cancel" }
    ])
  }

  const openCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync()
    if (!permission.granted) return Alert.alert("Required", "Camera access needed.")
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.7 })
    if (!result.canceled && result.assets?.length) uploadImage(result.assets[0].uri)
  }

  const openGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) return Alert.alert("Required", "Gallery access needed.")
    const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.7 })
    if (!result.canceled && result.assets?.length) uploadImage(result.assets[0].uri)
  }

  const uploadImage = async (uri: string) => {
    try {
      if (!user) return
      setUploading(true)
      const imageUrl = await uploadToCloudinary(uri)
      await setDoc(doc(db, "Users", user.uid), { photoURL: imageUrl, updatedAt: serverTimestamp(), email: user.email }, { merge: true })
      setUserData((prev: any) => ({ ...prev, photoURL: imageUrl }))
    } catch (err) {
      Alert.alert("Error", "Could not update profile picture.")
    } finally {
      setUploading(false)
    }
  }

  useEffect(() => {
    loadUserData()
    loadTripCount()
  }, [])

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#F8FAFC]">
        <ActivityIndicator size="large" color="#FF6D4D" />
      </View>
    )
  }

  const MenuButton = ({ icon, title, onPress, color = "#1A2B48", isLast = false }: any) => (
    <TouchableOpacity 
      onPress={onPress}
      activeOpacity={0.6}
      className={`flex-row items-center py-5 ${!isLast ? 'border-b border-gray-50' : ''}`}
    >
      <View style={{ backgroundColor: color + '10' }} className="w-10 h-10 rounded-xl items-center justify-center">
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text className="flex-1 ml-4 font-bold text-[#1A2B48]">{title}</Text>
      <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
    </TouchableOpacity>
  )

  return (
    <View className="flex-1 bg-[#F8FAFC] bottom-8">
      <StatusBar barStyle="dark-content" />
      
      <ScrollView 
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 80, paddingBottom: 50 }}
      >
        {/* PROFILE HEADER */}
        <View className="items-center mb-10">
          <TouchableOpacity onPress={pickImage} activeOpacity={0.9} className="relative">
            <View className="w-36 h-36 rounded-full border border-gray-100 p-2 bg-white shadow-xl shadow-black/5">
              <View className="w-full h-full rounded-full overflow-hidden bg-gray-100">
                {uploading ? (
                  <View className="flex-1 items-center justify-center"><ActivityIndicator color="#FF6D4D" /></View>
                ) : (
                  <Image
                    source={{ uri: userData?.photoURL || "https://ui-avatars.com/api/?name=" + (userData?.displayName || "T") + "&background=FF6D4D&color=fff" }}
                    className="w-full h-full"
                  />
                )}
              </View>
            </View>
            <View className="absolute bottom-2 right-2 bg-[#FF6D4D] w-10 h-10 rounded-full border-4 border-white items-center justify-center shadow-md">
              <Ionicons name="camera" size={18} color="white" />
            </View>
          </TouchableOpacity>

          <Text className="text-2xl font-black text-[#1A2B48] mt-6">{userData?.displayName || "Explorer"}</Text>
          <Text className="text-[#94A3B8] font-bold text-sm tracking-tight">{userData?.username || user?.email}</Text>
        </View>

        {/* STATS STRIP */}
        <View className="flex-row bg-white rounded-[32px] p-6 mb-8 shadow-sm shadow-black/5 border border-gray-50 justify-around">
          <View className="items-center">
            <Text className="text-2xl font-black text-[#FF6D4D]">{tripCount}</Text>
            <Text className="text-[#94A3B8] text-[10px] font-black uppercase tracking-widest">Adventures</Text>
          </View>
          <View className="w-[1px] h-full bg-gray-100" />
          <View className="items-center">
            <Text className="text-2xl font-black text-[#1A2B48]">Elite</Text>
            <Text className="text-[#94A3B8] text-[10px] font-black uppercase tracking-widest">Member Status</Text>
          </View>
        </View>

        {/* SETTINGS GROUP */}
        <Text className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[3px] mb-4 ml-2">Preferences</Text>
        <View className="bg-white rounded-[32px] px-6 shadow-sm shadow-black/5 border border-gray-50 mb-8">
          <MenuButton 
            icon="person-outline" 
            title="Personal Information" 
            onPress={() => router.push("/(dashboard)/setting")} 
          />
          <MenuButton 
            icon="notifications-outline" 
            title="Notification Center" 
            onPress={() => {}} 
          />
          <MenuButton 
            icon="shield-checkmark-outline" 
            title="Privacy & Security" 
            onPress={() => {}} 
            isLast={true}
          />
        </View>

        {/* DANGER ZONE */}
        <Text className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[3px] mb-4 ml-2">Account</Text>
        <View className="bg-white rounded-[32px] px-6 shadow-sm shadow-black/5 border border-gray-50">
          <MenuButton 
            icon="help-circle-outline" 
            title="Support" 
            onPress={() => {}} 
          />
          <MenuButton 
            icon="log-out-outline" 
            title="Sign Out" 
            color="#FF6D4D" 
            onPress={handleLogout}
            isLast={true} 
          />
        </View>

      </ScrollView>
    </View>
  )
}