import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ExploreScreen() {
  return (
    <ScrollView className="flex-1 bg-[#F8FAFC] pt-14 px-5">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-6">
        <View>
          <Text className="text-[#94A3B8] font-medium">Explore</Text>
          <Text className="text-2xl font-bold text-[#1A2B48]">Sri Lanka</Text>
        </View>
        <TouchableOpacity className="bg-white p-2 rounded-full shadow-sm border border-[#E2E8F0]">
          <Ionicons name="notifications-outline" size={24} color="#1A2B48" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View className="flex-row items-center bg-white p-4 rounded-2xl shadow-sm border border-[#E2E8F0] mb-8">
        <Ionicons name="search" size={20} color="#94A3B8" />
        <TextInput placeholder="Search destinations..." className="flex-1 ml-3 text-[#1A2B48]" />
      </View>

      {/* Categories */}
      <Text className="text-lg font-bold text-[#1A2B48] mb-4">Popular Places</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-8">
        {[
          { name: 'Ella', img: 'https://images.unsplash.com/photo-1586714283181-2290740a08e1?q=80&w=400' },
          { name: 'Galle', img: 'https://images.unsplash.com/photo-1627894460734-9358632c024d?q=80&w=400' },
          { name: 'Sigiriya', img: 'https://images.unsplash.com/photo-1546708973-b339540b5162?q=80&w=400' }
        ].map((item, index) => (
          <TouchableOpacity key={index} className="mr-5 relative">
            <Image source={{ uri: item.img }} className="w-48 h-64 rounded-3xl" />
            <View className="absolute bottom-4 left-4 bg-white/90 px-3 py-1 rounded-xl">
              <Text className="font-bold text-[#1A2B48]">{item.name}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </ScrollView>
  );
}