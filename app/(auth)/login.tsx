import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, 
  Platform, Alert, ScrollView, ActivityIndicator 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail,
  signInWithCredential,
  GoogleAuthProvider
} from 'firebase/auth';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { auth } from '@/services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useLoader } from '@/hooks/useLoader';

WebBrowser.maybeCompleteAuthSession();

const getAuthErrorMessage = (code: string) => {
  switch (code) {
    case "auth/invalid-credential":
      return "Incorrect email or password. Please try again.";
    case "auth/user-not-found":
      return "No account found with this email.";
    case "auth/wrong-password":
      return "Incorrect password. Please try again.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";
    default:
      return "Login failed. Please try again.";
  }
};

const LoginPage = () => {
  const router = useRouter();
  const { showLoader, hideLoader } = useLoader();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // ---------------- GOOGLE AUTH SETUP ----------------
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: "906547182352-a73aceker0cr42mjo5n281pshr8ur93n",
    iosClientId: "YOUR_IOS_CLIENT_ID.apps.googleusercontent.com",
    androidClientId: "YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com",
    scopes: ["profile", "email"]
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);

      signInWithCredential(auth, credential)
        .then(async (userCred) => {
          const userRef = doc(db, "Users", userCred.user.uid);
          const snap = await getDoc(userRef);

          if (!snap.exists()) {
            await setDoc(userRef, {
              name: userCred.user.displayName || "",
              email: userCred.user.email,
              photoURL: userCred.user.photoURL || "",
              role: "",
              createdAt: new Date()
            });
          }

          router.replace("/home");
        })
        .catch(err => {
          console.log(err);
          Alert.alert("Google Login Failed", "Unable to sign in with Google.");
        })
        .finally(() => setGoogleLoading(false));
    }
  }, [response]);

  // ---------------- LOGIN ----------------
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    showLoader();

    try {
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert("🎉 Login Successful", "Welcome back!", [
        { text: "Continue", onPress: () => router.replace("/home") }
      ]);
    } catch (err: any) {
      Alert.alert("Login Failed", getAuthErrorMessage(err.code));
    } finally {
      setLoading(false);
      hideLoader();
    }
  };

  // ---------------- FORGOT PASSWORD ----------------
  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert("Enter Email", "Please enter your email to reset your password.");
      return;
    }

    setResetLoading(true);
    showLoader();

    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert("📩 Email Sent", "Check your inbox for the reset link.");
    } catch (err: any) {
      Alert.alert("Reset Failed", getAuthErrorMessage(err.code));
    } finally {
      setResetLoading(false);
      hideLoader();
    }
  };

  // ---------------- GOOGLE LOGIN ----------------
  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    await promptAsync();
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#F8FAFC]"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 px-8 justify-center pt-24 pb-10">

          {/* ← Back Button */}
          <TouchableOpacity
            onPress={() => router.replace("/welcome")}
            className="absolute top-14 left-6 p-2"
          >
            <Ionicons name="arrow-back" size={28} color="#1A2B48" />
          </TouchableOpacity>

          <Text className="text-3xl font-extrabold text-[#1A2B48] text-center mb-2">
            Welcome Back
          </Text>

          <Text className="text-[#94A3B8] text-center mb-8">
            Sign in to continue your journey
          </Text>

          {/* Email */}
          <TextInput
            placeholder="Email"
            placeholderTextColor="#94A3B8"
            className="bg-white border border-[#E2E8F0] p-4 rounded-2xl mb-4"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />

          {/* Password */}
          <TextInput
            placeholder="Password"
            secureTextEntry
            placeholderTextColor="#94A3B8"
            className="bg-white border border-[#E2E8F0] p-4 rounded-2xl"
            value={password}
            onChangeText={setPassword}
          />

          {/* Forgot Password */}
          <TouchableOpacity onPress={handleForgotPassword} className="mt-3 self-end">
            <Text className="text-[#FF6D4D] font-semibold">
              {resetLoading ? "Sending..." : "Forgot Password?"}
            </Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            className={`mt-6 py-5 rounded-2xl items-center ${loading ? "bg-gray-400" : "bg-[#1A2B48]"}`}
          >
            {loading ? <ActivityIndicator color="#fff" /> :
              <Text className="text-white font-bold text-lg">Sign In</Text>}
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex-row items-center my-6">
            <View className="flex-1 h-px bg-[#E2E8F0]" />
            <Text className="mx-3 text-[#94A3B8]">OR</Text>
            <View className="flex-1 h-px bg-[#E2E8F0]" />
          </View>

          {/* Google Button */}
          <TouchableOpacity
            onPress={handleGoogleLogin}
            disabled={googleLoading || !request}
            className="py-4 rounded-2xl border border-[#E2E8F0] flex-row justify-center items-center bg-white"
          >
            {googleLoading ? <ActivityIndicator /> : (
              <>
                <Ionicons name="logo-google" size={20} color="#EA4335" />
                <Text className="ml-3 font-semibold text-[#1A2B48]">
                  Continue with Google
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Navigate to Sign Up */}
          <View className="flex-row justify-center mt-6">
            <Text className="text-[#64748B]">Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
              <Text className="text-[#FF6D4D] font-semibold">Sign Up</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginPage;
