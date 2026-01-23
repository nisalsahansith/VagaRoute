import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TripsScreen() {
  const trips = [
    { id: '1', title: 'Ella Adventure', date: '24 Jan 2026', status: 'Upcoming' },
    { id: '2', title: 'Beach Trip Galle', date: '15 Dec 2025', status: 'Completed' },
  ];

  const renderTrip = ({ item }: { item: typeof trips[0] }) => (
    <View className="bg-white p-5 rounded-3xl mb-4 shadow-sm border border-[#E2E8F0] flex-row items-center justify-between">
      <View>
        <Text className="text-lg font-bold text-[#1A2B48]">{item.title}</Text>
        <Text className="text-[#94A3B8]">{item.date}</Text>
      </View>

      <View
        className={`px-3 py-1 rounded-full ${
          item.status === 'Upcoming' ? 'bg-[#FF6D4D]/20' : 'bg-[#1A2B48]/10'
        }`}
      >
        <Text
          className="font-bold text-xs"
          style={{ color: item.status === 'Upcoming' ? '#FF6D4D' : '#1A2B48' }}
        >
          {item.status}
        </Text>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-[#F8FAFC] pt-14 px-5">
      {/* Header */}
      <Text className="text-2xl font-bold text-[#1A2B48] mb-6">My Journeys</Text>

      {/* Trips List */}
      <FlatList
        data={trips}
        keyExtractor={(item) => item.id}
        renderItem={renderTrip}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      {/* Add Trip Button */}
      <TouchableOpacity className="absolute bottom-6 right-6 bg-[#FF6D4D] w-16 h-16 rounded-full items-center justify-center shadow-xl">
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>
    </View>
  );
}
