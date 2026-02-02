import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, 
  Platform, Alert, ScrollView, ActivityIndicator, StatusBar,
  Animated // Added Animated
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithCredential
} from 'firebase/auth';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { auth, db } from '@/services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useLoader } from '@/hooks/useLoader';

WebBrowser.maybeCompleteAuthSession();

const LoginPage = () => {
  const router = useRouter();
  const { showLoader, hideLoader } = useLoader();

  // --- ANIMATION SETUP ---
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.97)).current; // Start slightly smaller

  useEffect(() => {
    // Entrance animation: Fade in and gently scale up
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const handleBackNavigation = () => {
    // Exit animation before navigating back
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => router.replace("/welcome"));
  };
  // ------------------------

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Google Auth Setup
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: "906547182352-a73aceker0cr42mjo5n281pshr8ur93n",
  });

  useEffect(() => {
    if (response?.type === "success") {
      handleGoogleSuccess(response.params.id_token);
    }
  }, [response]);

  const handleGoogleSuccess = async (idToken: string) => {
    setGoogleLoading(true);
    try {
      const credential = GoogleAuthProvider.credential(idToken);
      const userCred = await signInWithCredential(auth, credential);
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
    } catch (err) {
      Alert.alert("Google Login Failed", "Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing Fields", "Please enter both email and password.");
      return;
    }
    setLoading(true);
    showLoader();
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.replace("/home");
    } catch (err: any) {
      Alert.alert("Login Failed", "Incorrect email or password.");
    } finally {
      setLoading(false);
      hideLoader();
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert("Email Required", "Enter email address first.");
      return;
    }
    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      Alert.alert("📩 Link Sent", "Check your email to reset password.");
    } catch (err: any) {
      Alert.alert("Error", "Failed to send reset email.");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <StatusBar barStyle="dark-content" />
      
      {/* Wrap everything in Animated.View */}
      <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 px-8 pt-20 pb-10">
            
            <TouchableOpacity
              onPress={handleBackNavigation} // Updated with animation logic
              className="w-12 h-12 items-center justify-center rounded-full bg-gray-50 mb-8"
            >
              <Ionicons name="chevron-back" size={24} color="#1A2B48" />
            </TouchableOpacity>

            <View className="mb-10">
              <Text className="text-4xl font-black text-[#1A2B48] tracking-tight">Login</Text>
              <Text className="text-lg text-[#94A3B8] mt-2 font-medium">Great to see you again!</Text>
            </View>

            <View className="space-y-4">
              <View>
                <Text className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mb-2 ml-1">Email Address</Text>
                <View className={`bg-[#F8FAFC] border-2 rounded-2xl flex-row items-center px-4 ${focusedField === 'email' ? 'border-[#FF6D4D]' : 'border-transparent'}`}>
                  <Ionicons name="mail-outline" size={20} color={focusedField === 'email' ? '#FF6D4D' : '#94A3B8'} />
                  <TextInput
                    placeholder="name@example.com"
                    placeholderTextColor="#CBD5E1"
                    className="flex-1 p-4 font-bold text-[#1A2B48]"
                    value={email}
                    onChangeText={setEmail}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>
              </View>

              <View>
                <Text className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mb-2 ml-1">Password</Text>
                <View className={`bg-[#F8FAFC] border-2 rounded-2xl flex-row items-center px-4 ${focusedField === 'password' ? 'border-[#FF6D4D]' : 'border-transparent'}`}>
                  <Ionicons name="lock-closed-outline" size={20} color={focusedField === 'password' ? '#FF6D4D' : '#94A3B8'} />
                  <TextInput
                    placeholder="••••••••"
                    placeholderTextColor="#CBD5E1"
                    secureTextEntry={!isPasswordVisible}
                    className="flex-1 p-4 font-bold text-[#1A2B48]"
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                  />
                  <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                    <Ionicons name={isPasswordVisible ? "eye-off-outline" : "eye-outline"} size={20} color="#94A3B8" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <TouchableOpacity 
              onPress={handleForgotPassword} 
              disabled={resetLoading}
              className="mt-4 self-end"
            >
              <Text className="text-[#FF6D4D] font-black text-xs uppercase tracking-tighter">
                {resetLoading ? "Processing..." : "Forgot Password?"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
              className={`mt-10 py-5 rounded-2xl items-center shadow-xl ${loading ? "bg-gray-400" : "bg-[#1A2B48] shadow-slate-900/20"}`}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-black text-lg">Sign In</Text>}
            </TouchableOpacity>

            <View className="flex-row items-center my-10">
              <View className="flex-1 h-[1px] bg-[#F1F5F9]" />
              <Text className="mx-4 text-[#CBD5E1] font-bold text-xs">OR CONTINUE WITH</Text>
              <View className="flex-1 h-[1px] bg-[#F1F5F9]" />
            </View>

            <TouchableOpacity
              onPress={() => promptAsync()}
              disabled={googleLoading || !request}
              className="py-4 rounded-2xl border-2 border-[#F1F5F9] flex-row justify-center items-center bg-white"
            >
              {googleLoading ? <ActivityIndicator /> : (
                <>
                  <Ionicons name="logo-google" size={20} color="#1A2B48" />
                  <Text className="ml-3 font-black text-[#1A2B48] uppercase text-xs tracking-widest">Google</Text>
                </>
              )}
            </TouchableOpacity>

            <View className="flex-row justify-center mt-auto pt-10">
              <Text className="text-[#64748B] font-medium">New here? </Text>
              <TouchableOpacity onPress={() => router.push("/signup")}>
                <Text className="text-[#FF6D4D] font-black">Create Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </Animated.View>
    </KeyboardAvoidingView>
  );
};

export default LoginPage;