import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform } from "react-native";

const tabs = [
  { name: "home", title: "Home", icon: "home" },
  { name: "trip", title: "Trips", icon: "briefcase" },
  { name: "nearby", title: "Nearby", icon: "map" },
  { name: "profile", title: "Passport", icon: "person-circle" },
] as const;

export default function DashboardLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#FF6D4D", // Active color (orange)
        tabBarInactiveTintColor: "#94A3B8", // Inactive color (slate gray)
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#E2E8F0",
          height: Platform.OS === "ios" ? 90 : 70,
          paddingBottom: Platform.OS === "ios" ? 30 : 12,
          paddingTop: 10,
          elevation: 10,
          shadowColor: "#1A2B48",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      {tabs.map(({ name, title, icon }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name={icon as any} size={28} color={color} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
