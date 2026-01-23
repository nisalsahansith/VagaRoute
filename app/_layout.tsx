import React from "react";
import { View, StatusBar } from "react-native";
import { Slot } from "expo-router";
import { useSafeAreaInsets, SafeAreaProvider } from "react-native-safe-area-context";
import { LoaderProvider } from "@/context/LoaderContext";
import { AuthProvider } from "@/context/authContext";
import "../global.css";

const RootLayout = () => {
  const insets = useSafeAreaInsets();

  return (
    // SafeAreaProvider is required at the top level for useSafeAreaInsets to work
    <SafeAreaProvider>
      <LoaderProvider>
        <AuthProvider>
          {/* 1. Set StatusBar to dark-content to contrast with Cloud White background 
            2. Apply global background color #F8FAFC
          */}
          <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
          
          <View 
            className="flex-1 bg-[#F8FAFC]" 
            style={{ 
              paddingTop: insets.top,
              paddingBottom: insets.bottom 
            }}
          >
            {/* Slot renders the active screen (Welcome, Dashboard, etc.) */}
            <Slot />
          </View>
        </AuthProvider>
      </LoaderProvider>
    </SafeAreaProvider>
  );
};

export default RootLayout;