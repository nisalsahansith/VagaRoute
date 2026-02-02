import React, { useEffect, useRef } from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform, Animated, View } from "react-native";

const tabs = [
  { name: "home", title: "Home", icon: "home" },
  { name: "trip", title: "Trips", icon: "briefcase" },
  { name: "nearby", title: "Nearby", icon: "map" },
  { name: "profile", title: "Passport", icon: "person-circle" },
] as const;

// --- ANIMATED ICON COMPONENT ---
const TabIcon = ({ name, color, focused }: { name: string, color: string, focused: boolean }) => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scaleValue, {
      toValue: focused ? 1.2 : 1, // Scale up when focused
      useNativeDriver: true,
      friction: 4, // Bounciness
    }).start();
  }, [focused]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleValue }], alignItems: 'center' }}>
      <Ionicons name={name as any} size={26} color={color} />
      {focused && (
        <View 
          style={{ 
            height: 4, 
            width: 4, 
            borderRadius: 2, 
            backgroundColor: "#FF6D4D", 
            marginTop: 4 
          }} 
        />
      )}
    </Animated.View>
  );
};

export default function DashboardLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#FF6D4D",
        tabBarInactiveTintColor: "#94A3B8",
        tabBarShowLabel: true, // Set to false if you want a minimal "icon-only" look
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 0, // Removed border for a cleaner look
          height: Platform.OS === "ios" ? 88 : 70,
          paddingBottom: Platform.OS === "ios" ? 30 : 12,
          paddingTop: 10,
          // Premium Shadow
          elevation: 20,
          shadowColor: "#1A2B48",
          shadowOffset: { width: 0, height: -10 },
          shadowOpacity: 0.08,
          shadowRadius: 15,
          position: 'absolute', // Makes it float if you add margins
          borderTopLeftRadius: 25,
          borderTopRightRadius: 25,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
          marginTop: -5,
        },
      }}
    >
      {tabs.map(({ name, title, icon }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon name={icon} color={color} focused={focused} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}