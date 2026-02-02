import React from 'react';
import { View, Text, TouchableOpacity, StatusBar, Image, Dimensions, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import LottieView from 'lottie-react-native'; 
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur'; 
import '../global.css';

const { width, height } = Dimensions.get('window');

const WelcomeScreen = () => {
  return (
    <View className="flex-1 bg-[#0F172A]">
      <StatusBar barStyle="light-content" translucent />

      {/* 1. LIVE BACKGROUND */}
      <LottieView
        source={require('@/assets/animations/planes.json')} 
        autoPlay
        loop
        speed={0.6}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      />

      {/* 2. BACKGROUND OVERLAY */}
      <LinearGradient
        colors={['rgba(15, 23, 42, 0.2)', 'rgba(15, 23, 42, 0.8)']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* 3. CONTENT AREA */}
      <View className="flex-1 justify-end items-center px-6 pb-12">
        
        {/* LARGE BUT REFINED GLASS CARD */}
        <BlurView 
          intensity={50} 
          tint="dark" 
          className="rounded-[45px] overflow-hidden border border-white/20 w-full"
          style={{ height: height * 0.72 }} 
        >
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.12)', 'rgba(255, 255, 255, 0.04)']}
            className="flex-1 p-8 items-center justify-between"
          >
            {/* TOP SECTION - Now smaller and more centered */}
            <View className="items-center mt-6">
              <View className="bg-white/90 p-4 rounded-2xl shadow-lg mb-6">
                <Image
                  source={require('@/assets/images/vagaRoute_logo.png')}
                  className="w-12 h-12" // Smaller Logo
                  resizeMode="contain"
                />
              </View>

              <Text className="text-3xl font-black text-white tracking-tight text-center">
                VagaRoute
              </Text>
              
              <View className="h-[2px] w-8 bg-[#FF6D4D] rounded-full my-4" />

              <Text className="text-gray-300 text-center text-base font-medium leading-6 px-6">
                Your journey,{"\n"}
                <Text className="text-white font-bold italic">perfectly tailored.</Text>
              </Text>
            </View>

            {/* BOTTOM SECTION - Separated from content */}
            <View className="w-full mb-2">
              {/* Added a View with margin to create "Distance" from the content above */}
              <View className="mt-12 w-full"> 
                <TouchableOpacity 
                  activeOpacity={0.8}
                  onPress={() => router.push('/signup')}
                  className="bg-[#FF6D4D] py-4 rounded-2xl items-center shadow-lg shadow-orange-500/30 mb-4"
                >
                  <Text className="text-white text-base font-black uppercase tracking-widest">
                    Get Started
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  activeOpacity={0.7}
                  onPress={() => router.push('/login')}
                  className="bg-white/5 border border-white/10 py-4 rounded-2xl items-center"
                >
                  <Text className="text-white/80 text-base font-bold">
                    Sign In
                  </Text>
                </TouchableOpacity>
              </View>

              <View className="items-center mt-8">
                <Text className="text-white/20 text-[9px] font-bold tracking-[3px] uppercase">
                  V 1.0.0 • Global Explorer
                </Text>
              </View>
            </View>

          </LinearGradient>
        </BlurView>
      </View>
    </View>
  );
};

export default WelcomeScreen;