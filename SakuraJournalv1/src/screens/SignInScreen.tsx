import React, { useContext, useState } from 'react';
import {
  TouchableWithoutFeedback,
  Keyboard,
  SafeAreaView,
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Image,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AlertNotificationRoot, Toast, ALERT_TYPE } from 'react-native-alert-notification';
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootParamList } from "../../App";
import sakura from '../../assets/sakurav1.png';
import { PUBLIC_URL } from '../../config';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { AuthContext } from '../context/AuthContext';

type SignInNavProps = NativeStackNavigationProp<RootParamList, "SignIn">;

export default function SignInScreen() {
  const navigation = useNavigation<SignInNavProps>();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [buttonScale] = useState(new Animated.Value(1));

  const { setUserData } = useContext(AuthContext);

  const animateButton = (toValue: number) => {
    Animated.spring(buttonScale, {
      toValue,
      useNativeDriver: true,
    }).start();
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: "Missing Fields",
        textBody: "Please enter both email and password.",
      });
      return;
    }

    try {
      const response = await fetch(PUBLIC_URL + "/SakuraJournal/SignIn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const json = await response.json();
        if (json.status) {
          // Save user info for SettingsScreen
          const userData = {
            full_name: json.loggedUser?.fullName || "User",
            username: json.loggedUser?.username || "User123",
            email: json.loggedUser?.email || email,
            profile_image: json.loggedUser?.profile_img
              ? `${PUBLIC_URL}/SakuraJournal/profile_image/${json.loggedUser.profile_img}`
              : "https://i.pravatar.cc/150?img=12"
          };

          console.log("json.loggedUser:", json.loggedUser);
          console.log("profile_img field from backend:", json.loggedUser?.profile_img);
          console.log("Constructed profile_image URL:", userData.profile_image);

          await AsyncStorage.setItem("userData", JSON.stringify(userData));

          setUserData(userData);

          Toast.show({
            type: ALERT_TYPE.SUCCESS,
            title: "Welcome Back!",
            textBody: `Hello, ${userData.username}`,
          });

        } else {
          Toast.show({
            type: ALERT_TYPE.WARNING,
            title: "Login Failed",
            textBody: json.message || "Invalid credentials.",
          });
        }
      } else {
        Toast.show({
          type: ALERT_TYPE.DANGER,
          title: "Server Error",
          textBody: "Something went wrong. Please try again later.",
        });
      }
    } catch (error) {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: "Network Error",
        textBody: "Unable to connect to server. Check your internet or ngrok tunnel.",
      });
    }
  };

  return (
    <AlertNotificationRoot>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff0f6" }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAwareScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
            enableOnAndroid={true}
            extraScrollHeight={Platform.OS === "ios" ? 20 : 80}
          >
            <View style={styles.container}>
              <Image source={sakura} style={styles.logo} />
              <Text style={styles.title}>Sakura Journal</Text>
              <Text style={styles.subtitle}>Welcome back! Sign in</Text>

              {/* Email */}
              <View style={styles.inputContainer}>
                {email ? <Text style={styles.floatingLabel}>Email</Text> : null}
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              {/* Password */}
              <View style={styles.inputContainer}>
                {password ? <Text style={styles.floatingLabel}>Password</Text> : null}
                <View style={styles.inputWithIcon}>
                  <TextInput
                    style={styles.inputFlex}
                    placeholder="Password"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <Pressable
                    style={styles.iconContainer}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off" : "eye"}
                      size={22}
                      color="#db2777"
                    />
                  </Pressable>
                </View>
              </View>

              {/* Animated Sign In Button */}
              <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <Pressable
                  style={styles.signInButton}
                  onPress={handleSignIn}
                  onPressIn={() => animateButton(0.95)}
                  onPressOut={() => animateButton(1)}
                >
                  <Text style={styles.signInButtonText}>Sign In</Text>
                </Pressable>
              </Animated.View>

              <View style={styles.signUpContainer}>
                <Text style={styles.signUpText}>Don’t have an account?</Text>
                <Pressable onPress={() => navigation.navigate("SignUp")}>
                  <Text style={styles.signUpLink}> Sign Up</Text>
                </Pressable>
              </View>
            </View>
          </KeyboardAwareScrollView>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    </AlertNotificationRoot>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
    backgroundColor: '#fff0f6',
  },
  container: {
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#be123c',
    marginBottom: 6,
    textShadowColor: '#f9a8d4',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 18,
    color: '#ec4899',
    marginBottom: 30,
    fontStyle: 'italic',
  },
  inputContainer: {
    width: '100%',
    marginVertical: 12,
    position: 'relative',
  },
  floatingLabel: {
    position: 'absolute',
    top: -10,
    left: 15,
    backgroundColor: '#fff0f6',
    paddingHorizontal: 4,
    fontSize: 12,
    color: '#be123c',
    zIndex: 10,
  },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f9a8d4',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  inputFlex: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f9a8d4',
    borderRadius: 14,
    backgroundColor: '#fff',
    marginVertical: 12,
  },
  iconContainer: {
    position: 'absolute',
    right: 15,
  },
  signInButton: {
    backgroundColor: '#db2777',
    paddingVertical: 16,
    paddingHorizontal: 50,
    borderRadius: 20,
    marginTop: 25,
    alignItems: 'center',
    shadowColor: '#db2777',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  signUpContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  signUpText: {
    fontSize: 16,
    color: '#9d174d',
  },
  signUpLink: {
    fontSize: 16,
    color: '#db2777',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});
