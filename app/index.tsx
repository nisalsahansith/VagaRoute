import React from "react";
import "../global.css";
import { Redirect } from "expo-router";
import { useAuth } from "@/hooks/useAuth"; // Ensure this path is correct
import { ActivityIndicator, View } from "react-native";

const Index = () => {
  const { user, loading } = useAuth();

  // Show a loading spinner while Firebase checks the login status
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#F8FAFC]">
        <ActivityIndicator size={"large"} color={"#1A2B48"} />
      </View>
    );
  }

  // If user is logged in, send to Dashboard. 
  // If not, send to the Welcome branding page.
  return user ? <Redirect href="/(dashboard)/home" /> : <Redirect href="/welcome" />;
};

export default Index;