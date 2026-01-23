import React from "react";
import { Tabs } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { Platform } from "react-native";

const DashboardLayout = () => {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FF6D4D',   // Active tab color
        tabBarInactiveTintColor: '#94A3B8', // Inactive tab color
        tabBarStyle: {
          backgroundColor: '#FFFFFF',       // Tab bar background
          borderTopWidth: 1,
          borderTopColor: '#E2E8F0',
          height: Platform.OS === 'ios' ? 90 : 70,
          paddingBottom: Platform.OS === 'ios' ? 30 : 12,
          paddingTop: 10,
          elevation: 10,                    // Android shadow
          shadowColor: '#1A2B48',           // iOS shadow
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginBottom: 0,
        },
      }}
    >
      {/* Explore Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Explore",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="explore" color={color} size={28} />
          ),
        }}
      />

      {/* My Trips Tab */}
      <Tabs.Screen
        name="trips"
        options={{
          title: "My Trips",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="luggage" color={color} size={28} />
          ),
        }}
      />

      {/* Nearby Tab */}
      <Tabs.Screen
        name="map"
        options={{
          title: "Nearby",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="map" color={color} size={28} />
          ),
        }}
      />

      {/* Passport / Profile Tab */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Passport",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="account-circle" color={color} size={28} />
          ),
        }}
      />
    </Tabs>
  );
};

export default DashboardLayout;
