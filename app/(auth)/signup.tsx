import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, 
  KeyboardAvoidingView, Platform, Alert, ScrollView, ActivityIndicator 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/services/firebase';
import { useLoader } from '@/hooks/useLoader';

const SignupPage = () => {
  const router = useRouter();
  const { showLoader, hideLoader } = useLoader();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    showLoader();

    try {
      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Create user document in Firestore 'Users' collection
      await setDoc(doc(db, "Users", user.uid), {
        uid: user.uid,
        displayName: name,
        email: email,
        createdAt: new Date().toISOString(),
        role: 'traveler' // Default role
      });

      hideLoader();
      setLoading(false);

      // 3. Show success alert and redirect to login
      Alert.alert(
        "🎉 Account Created",
        "Your account has been created successfully. Please log in.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/login")
          }
        ]
      );

    } catch (error: any) {
      console.error(error);
      hideLoader();
      setLoading(false);
      Alert.alert("Signup Failed", error.message);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#F8FAFC]"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Back Button */}
        <TouchableOpacity 
          onPress={() => router.replace('/welcome')} 
          style={{ top: Platform.OS === 'ios' ? 60 : 40 }}
          className="absolute left-6 z-10 w-12 h-12 bg-white rounded-full items-center justify-center shadow-sm border border-[#E2E8F0]"
        >
          <Ionicons name="arrow-back" size={24} color="#1A2B48" />
        </TouchableOpacity>

        <View className="flex-1 px-8 justify-center pt-24 pb-10">
          {/* Header */}
          <View className="items-center mb-8">
            <Text className="text-3xl font-extrabold text-[#1A2B48]">Create Account</Text>
            <Text className="text-[#94A3B8] mt-2 text-center">
              Join VagaRoute and start planning your perfect journey.
            </Text>
          </View>

          {/* Form */}
          <View className="space-y-4">
            <View>
              <Text className="text-[#1A2B48] font-semibold mb-2 ml-1">Full Name</Text>
              <TextInput
                placeholder="John Doe"
                className="bg-white border border-[#E2E8F0] p-4 rounded-2xl text-[#1A2B48]"
                value={name}
                onChangeText={setName}
              />
            </View>

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
                placeholder="Min. 8 characters"
                secureTextEntry
                className="bg-white border border-[#E2E8F0] p-4 rounded-2xl text-[#1A2B48]"
                value={password}
                onChangeText={setPassword}
              />
            </View>
          </View>

          {/* Signup Button */}
          <View className="mt-10">
            <TouchableOpacity 
              onPress={handleSignup}
              disabled={loading}
              className={`py-5 rounded-2xl items-center shadow-lg ${
                loading ? "bg-gray-400" : "bg-[#FF6D4D] shadow-[#FF6D4D]/30"
              }`}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text className="text-white text-lg font-bold">Create Account</Text>
              )}
            </TouchableOpacity>

            <View className="flex-row justify-center mt-6">
              <Text className="text-[#94A3B8]">Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push("/login")}>
                <Text className="text-[#1A2B48] font-bold">Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text className="text-center text-[#94A3B8] text-xs mt-8 px-4">
            By signing up, you agree to our Terms of Service and Privacy Policy.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignupPage;
