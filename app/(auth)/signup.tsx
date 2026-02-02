import React, { useState, useEffect, useRef } from 'react'; // Added useRef
import { 
  View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, 
  Platform, Alert, ScrollView, ActivityIndicator, StatusBar,
  Animated // Added Animated
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/services/firebase';
import { useLoader } from '@/hooks/useLoader';

const SignupPage = () => {
  const router = useRouter();
  const { showLoader, hideLoader } = useLoader();

  // --- ANIMATION SETUP ---
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.97)).current;

  useEffect(() => {
    // Entrance: Subtle fade and scale-in
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
    // Smooth exit before routing
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => router.replace("/welcome"));
  };
  // ------------------------

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const getSignupErrorMessage = (code: string) => {
    switch (code) {
      case "auth/email-already-in-use": return "This email is already registered.";
      case "auth/invalid-email": return "Please enter a valid email address.";
      case "auth/weak-password": return "Password should be at least 6 characters.";
      default: return "Signup failed. Please try again.";
    }
  };

  const handleSignup = async () => {
    if (!name || !email || !password) {
      Alert.alert("Required Fields", "Please fill in all details to create your account.");
      return;
    }

    setLoading(true);
    showLoader();

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;

      await setDoc(doc(db, "Users", user.uid), {
        uid: user.uid,
        name: name,
        email: email.trim(),
        createdAt: new Date().toISOString(),
        role: 'traveler',
        photoURL: ""
      });

      await signOut(auth);

      hideLoader();
      setLoading(false);

      Alert.alert(
        "🎉 Account Created",
        "Your account has been created successfully. Please sign in to continue.",
        [{ text: "Go to Login", onPress: () => router.replace("/login") }]
      );

    } catch (error: any) {
      setLoading(false);
      hideLoader();
      Alert.alert("Signup Error", getSignupErrorMessage(error.code));
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <StatusBar barStyle="dark-content" />
      
      {/* 1. Wrap entire scroll content in Animated.View */}
      <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 px-8 pt-20 pb-10">
            
            <TouchableOpacity
              onPress={handleBackNavigation} // 2. Trigger back animation
              className="w-12 h-12 items-center justify-center rounded-full bg-gray-50 mb-8"
            >
              <Ionicons name="chevron-back" size={24} color="#1A2B48" />
            </TouchableOpacity>

            <View className="mb-10">
              <Text className="text-4xl font-black text-[#1A2B48] tracking-tight">
                Join Us
              </Text>
              <Text className="text-lg text-[#94A3B8] mt-2 font-medium">
                Create an account to start your adventure.
              </Text>
            </View>

            <View className="space-y-4">
              <View>
                <Text className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mb-2 ml-1">Full Name</Text>
                <View className={`bg-[#F8FAFC] border-2 rounded-2xl flex-row items-center px-4 ${focusedField === 'name' ? 'border-[#FF6D4D]' : 'border-transparent'}`}>
                  <Ionicons name="person-outline" size={20} color={focusedField === 'name' ? '#FF6D4D' : '#94A3B8'} />
                  <TextInput
                    placeholder="John Doe"
                    placeholderTextColor="#CBD5E1"
                    className="flex-1 p-4 font-bold text-[#1A2B48]"
                    value={name}
                    onChangeText={setName}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
              </View>

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
                    placeholder="Min. 8 characters"
                    placeholderTextColor="#CBD5E1"
                    secureTextEntry={!isPasswordVisible}
                    className="flex-1 p-4 font-bold text-[#1A2B48]"
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                  />
                  <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                    <Ionicons 
                      name={isPasswordVisible ? "eye-off-outline" : "eye-outline"} 
                      size={20} 
                      color="#94A3B8" 
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleSignup}
              disabled={loading}
              activeOpacity={0.8}
              className={`mt-10 py-5 rounded-2xl items-center shadow-xl ${loading ? "bg-gray-400" : "bg-[#FF6D4D] shadow-orange-500/20"}`}
            >
              {loading ? <ActivityIndicator color="#fff" /> :
                <Text className="text-white font-black text-lg">Create Account</Text>}
            </TouchableOpacity>

            <View className="flex-row justify-center mt-8">
              <Text className="text-[#64748B] font-medium">Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push("/login")}>
                <Text className="text-[#1A2B48] font-black">Sign In</Text>
              </TouchableOpacity>
            </View>

            <Text className="text-center text-[#94A3B8] text-[10px] mt-10 px-6 font-medium leading-4">
              By signing up, you agree to our 
              <Text className="text-[#1A2B48] font-bold"> Terms of Service </Text> 
              and 
              <Text className="text-[#1A2B48] font-bold"> Privacy Policy</Text>.
            </Text>

          </View>
        </ScrollView>
      </Animated.View>
    </KeyboardAvoidingView>
  );
};

export default SignupPage;