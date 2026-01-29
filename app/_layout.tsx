import React, { useEffect } from "react";
import { View, StatusBar, Platform } from "react-native";
import { Slot } from "expo-router";
import { useSafeAreaInsets, SafeAreaProvider } from "react-native-safe-area-context";
import { LoaderProvider } from "@/context/LoaderContext";
import { AuthProvider } from "@/context/authContext";
import * as NavigationBar from "expo-navigation-bar"; 
import "../global.css";

const RootLayout = () => {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setButtonStyleAsync("dark");
    }
  }, []);

  return (
    <SafeAreaProvider>
      <LoaderProvider>
        <AuthProvider>
          {/* Status bar for top of the screen */}
          <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
          
          <View 
            className="flex-1 bg-[#F8FAFC]" 
            style={{ 
              paddingTop: insets.top,
              paddingBottom: insets.bottom 
            }}
          >
            <Slot />
          </View>
        </AuthProvider>
      </LoaderProvider>
    </SafeAreaProvider>
  );
};

export default RootLayout;