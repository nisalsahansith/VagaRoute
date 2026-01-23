import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, 
  Platform, Alert, ScrollView, ActivityIndicator 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/services/firebase';
import { useLoader } from '@/hooks/useLoader';

const LoginPage = () => {
  const router = useRouter();
  const { showLoader, hideLoader } = useLoader();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    showLoader();

    try {
      await signInWithEmailAndPassword(auth, email, password);

      hideLoader();
      setLoading(false);

      Alert.alert(
        "🎉 Login Successful",
        "You are now logged in.",
        [{ text: "OK", onPress: () => router.replace("/home") }]
      );
    } catch (error: any) {
      hideLoader();
      setLoading(false);
      console.error(error);
      Alert.alert("Login Failed", error.message || "Check your credentials");
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#F8FAFC]"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* --- BACK BUTTON --- */}
        <TouchableOpacity 
          onPress={() => router.replace('/welcome')} 
          className="absolute top-12 left-6 z-10 w-12 h-12 bg-white rounded-full items-center justify-center shadow-sm border border-[#E2E8F0]"
        >
          <Ionicons name="arrow-back" size={24} color="#1A2B48" />
        </TouchableOpacity>

        <View className="flex-1 px-8 justify-center pt-24 pb-10">
          {/* Header */}
          <View className="items-center mb-10">
            <Text className="text-3xl font-extrabold text-[#1A2B48]">Welcome Back</Text>
            <Text className="text-[#94A3B8] mt-2 text-center">
              Sign in to continue your journey
            </Text>
          </View>

          {/* Form Fields */}
          <View className="space-y-4">
            <View>
              <Text className="text-[#1A2B48] font-semibold mb-2 ml-1">Email Address</Text>
              <TextInput
                placeholder="name@example.com"
                className="bg-white border border-[#E2E8F0] p-4 rounded-2xl text-[#1A2B48]"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View>
              <Text className="text-[#1A2B48] font-semibold mb-2 ml-1">Password</Text>
              <TextInput
                placeholder="••••••••"
                secureTextEntry
                className="bg-white border border-[#E2E8F0] p-4 rounded-2xl text-[#1A2B48]"
                value={password}
                onChangeText={setPassword}
              />
            </View>
          </View>

          {/* Actions */}
          <View className="mt-10">
            <TouchableOpacity 
              onPress={handleLogin}
              disabled={loading}
              className={`py-5 rounded-2xl items-center shadow-lg ${
                loading ? "bg-gray-400" : "bg-[#1A2B48] shadow-[#1A2B48]/20"
              }`}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text className="text-white text-lg font-bold">Sign In</Text>
              )}
            </TouchableOpacity>

            <View className="flex-row justify-center mt-6">
              <Text className="text-[#94A3B8]">Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push("/signup")}>
                <Text className="text-[#FF6D4D] font-bold">Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text className="text-center text-[#94A3B8] text-xs mt-8 px-4">
            By logging in, you agree to our Terms of Service and Privacy Policy.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginPage;
