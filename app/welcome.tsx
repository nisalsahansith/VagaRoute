import React from 'react';
import { View, Text, TouchableOpacity, StatusBar, Image, Dimensions } from 'react-native';
import { router } from 'expo-router';
import LottieView from 'lottie-react-native'; 
import '../global.css';

const { width, height } = Dimensions.get('window');

const WelcomeScreen = () => {
  return (
    <View className="flex-1 bg-[#F8FAFC]">
      <StatusBar barStyle="dark-content" />

      {/* ------------------- LIVE BACKGROUND ------------------- */}
      <LottieView
        source={require('@/assets/animations/planes.json')} // Add your Lottie animation file here
        autoPlay
        loop
        style={{
          position: 'absolute',
          width,
          height,
          zIndex: -1
        }}
      />

      {/* ------------------- CONTENT ------------------- */}
      <View className="flex-1 justify-between px-8 py-12">

        {/* Top Section: Branding */}
        <View className="mt-20 items-center">
          {/* Logo */}
          <Image
            source={require('@/assets/images/vagaRoute_logo.png')} // Your VagaRoute logo
            className="w-24 h-24 rounded-xl"
            resizeMode="contain"
          />

          <Text className="text-4xl font-extrabold text-[#1A2B48] mt-6 tracking-tight">
            VagaRoute
          </Text>

          <Text className="text-base text-[#94A3B8] text-center mt-4 leading-6 px-4">
            Your journey, perfectly tailored. All your plans in one secure place.
          </Text>
        </View>

        {/* Bottom Section: Actions */}
        <View className="mb-10 w-full">
          <TouchableOpacity 
            className="bg-[#FF6D4D] py-5 rounded-2xl items-center shadow-lg shadow-[#FF6D4D]/30 mb-4"
            activeOpacity={0.8}
            onPress={() => router.push('/signup')}
          >
            <Text className="text-white text-lg font-bold">Get Started</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="py-4 items-center"
            onPress={() => router.push('/login')}
          >
            <Text className="text-[#1A2B48] text-base font-semibold">
              I already have an account
            </Text>
          </TouchableOpacity>

          <Text className="text-center text-[#94A3B8] text-xs mt-6">
            Version 1.0.0
          </Text>
        </View>

      </View>
    </View>
  );
};

export default WelcomeScreen;
