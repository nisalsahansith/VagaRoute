import React from 'react';
import { View, Text, Image, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '@/services/firebase';
import { signOut } from 'firebase/auth';

export default function ProfileScreen() {
  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to exit?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", onPress: () => signOut(auth) }
    ]);
  };

  return (
    <View className="flex-1 bg-[#F8FAFC] pt-20 px-5 items-center">
      
      {/* Profile Picture */}
      <View className="w-32 h-32 rounded-full border-4 border-[#FF6D4D] p-1 mb-4 shadow-lg">
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200' }}
          className="w-full h-full rounded-full"
        />
      </View>

      {/* Name & Username */}
      <Text className="text-2xl font-bold text-[#1A2B48]">Vaga Traveler</Text>
      <Text className="text-[#94A3B8] mb-8">@vagabond_sl</Text>

      {/* Stats */}
      <View className="flex-row bg-white rounded-3xl p-6 shadow-sm border border-[#E2E8F0] w-full mb-6">
        <View className="flex-1 items-center border-r border-[#E2E8F0]">
          <Text className="text-xl font-bold text-[#1A2B48]">12</Text>
          <Text className="text-[#94A3B8]">Trips</Text>
        </View>
        <View className="flex-1 items-center">
          <Text className="text-xl font-bold text-[#1A2B48]">05</Text>
          <Text className="text-[#94A3B8]">Badges</Text>
        </View>
      </View>

      {/* Buttons */}
      <TouchableOpacity className="w-full flex-row items-center bg-white p-5 rounded-2xl mb-4 border border-[#E2E8F0]">
        <Ionicons name="settings-outline" size={20} color="#1A2B48" />
        <Text className="ml-4 font-bold text-[#1A2B48]">Account Settings</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleLogout}
        className="w-full flex-row items-center bg-[#FF6D4D]/10 p-5 rounded-2xl"
      >
        <Ionicons name="log-out-outline" size={20} color="#FF6D4D" />
        <Text className="ml-4 font-bold text-[#FF6D4D]">Logout</Text>
      </TouchableOpacity>

    </View>
  );
}
