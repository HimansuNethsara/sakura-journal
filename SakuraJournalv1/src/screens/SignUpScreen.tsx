import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  Animated,
  TouchableOpacity,
  Modal,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { AlertNotificationRoot, Toast, ALERT_TYPE } from 'react-native-alert-notification';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootParamList } from '../../App';
import sakura from '../../assets/sakurav1.png';
import { PUBLIC_URL } from '../../config';

type SignUpNavProps = NativeStackNavigationProp<RootParamList, "SignUp">;


export default function SignUpScreen() {

  const navigation = useNavigation<SignUpNavProps>();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [birthday, setBirthday] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); 
  const [buttonScale] = useState(new Animated.Value(1));

  // Pick profile image
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  // Password strength calculation (frontend only)
  const getPasswordStrength = (pass: string): { label: string; color: string } => {
    let strength = 0;
    if (pass.length >= 12) strength += 2;
    if (/[A-Z]/.test(pass)) strength += 1;
    if (/[a-z]/.test(pass)) strength += 1;
    if (/[0-9]/.test(pass)) strength += 1;
    if (/[^A-Za-z0-9]/.test(pass)) strength += 1;

    if (strength <= 2) return { label: 'Weak', color: '#f87171' };
    if (strength <= 4) return { label: 'Medium', color: '#facc15' };
    if (strength === 5) return { label: 'Strong', color: '#34d399' };
    return { label: 'Excellent', color: '#3b82f6' };
  };
  const passwordStrength = getPasswordStrength(password);

  const onChange = (event: any, selectedDate?: Date) => {
    if (event?.type === 'set' && selectedDate) {
      setBirthday(selectedDate);
    }
    setShowPicker(false);
  };

  // Submit to backend
  const handleSignUp = async () => {
  setLoading(true);

  const formData = new FormData();
  formData.append("fullName", fullName);
  formData.append("username", username);
  formData.append("email", email);
  formData.append("password", password);
  formData.append("confirmPassword", confirmPassword);
  formData.append("birthday", birthday.toISOString().split('T')[0]); // YYYY-MM-DD
  if (profileImage) {
    formData.append("profileImage", {
      uri: profileImage,
      name: "profile.png",
      type: "image/png",
    } as any);
  }

  try {
    const response = await fetch(PUBLIC_URL + "/SakuraJournal/NewAccount", {
      method: "POST",
      body: formData,
      headers: { "Content-Type": "multipart/form-data" },
    });

    const json = await response.json();

    if (json.status) {
      Toast.show({
        type: ALERT_TYPE.SUCCESS,
        title: 'Success',
        textBody: json.message || "Account created successfully!"
      });

      // Reset form
      setFullName('');
      setEmail('');
      setUsername('');
      setPassword('');
      setConfirmPassword('');
      setBirthday(new Date());
      setProfileImage(null);
      setShowPassword(false);
      setShowConfirm(false);

      navigation.navigate("SignIn");

    } else {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Error',
        textBody: json.message || "Signup failed"
      });
    }
  } catch (err) {
    Toast.show({
      type: ALERT_TYPE.DANGER,
      title: 'Error',
      textBody: "Network error or backend down!"
    });
  } finally {
    setLoading(false);
  }
};


  const animateButton = (toValue: number) => {
    Animated.spring(buttonScale, {
      toValue,
      useNativeDriver: true,
    }).start();
  };

  return (
    <AlertNotificationRoot>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff0f6' }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
          >
            <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
              <View style={styles.container}>
                <Image source={sakura} style={styles.logo} />
                <Text style={styles.title}>Sakura Journal</Text>
                <Text style={styles.subtitle}>Create your account</Text>

                {/* Profile Image */}
                <Pressable onPress={pickImage} style={styles.imgUploader}>
                  {profileImage ? (
                    <Image source={{ uri: profileImage }} style={styles.profileImg} />
                  ) : (
                    <View style={styles.imgPlaceholder}>
                      <Text style={styles.imgTxt}>+</Text>
                      <Text style={styles.imgLabel}>Add Profile Image</Text>
                    </View>
                  )}
                </Pressable>

                {/* Full Name */}
                <View style={styles.inputContainer}>
                  {fullName ? <Text style={styles.floatingLabel}>Full Name</Text> : null}
                  <TextInput style={styles.input} placeholder="Full Name" value={fullName} onChangeText={setFullName} />
                </View>

                {/* Username */}
                <View style={styles.inputContainer}>
                  {username ? <Text style={styles.floatingLabel}>Username</Text> : null}
                  <TextInput style={styles.input} placeholder="Username" value={username} onChangeText={setUsername} />
                </View>

                {/* Email */}
                <View style={styles.inputContainer}>
                  {email ? <Text style={styles.floatingLabel}>Email</Text> : null}
                  <TextInput style={styles.input} placeholder="Email" value={email} keyboardType="email-address" onChangeText={setEmail} />
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
                    <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.iconContainer}>
                      <Ionicons name={showPassword ? "eye-off" : "eye"} size={22} color="#db2777" />
                    </Pressable>
                  </View>
                  <Text style={{ color: passwordStrength.color, marginTop: 2 }}>{passwordStrength.label}</Text>
                </View>

                {/* Confirm Password */}
                <View style={styles.inputContainer}>
                  {confirmPassword ? <Text style={styles.floatingLabel}>Confirm Password</Text> : null}
                  <View style={styles.inputWithIcon}>
                    <TextInput
                      style={styles.inputFlex}
                      placeholder="Confirm Password"
                      secureTextEntry={!showConfirm}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                    />
                    <Pressable onPress={() => setShowConfirm(!showConfirm)} style={styles.iconContainer}>
                      <Ionicons name={showConfirm ? "eye-off" : "eye"} size={22} color="#db2777" />
                    </Pressable>
                  </View>
                </View>

                {/* Birthday */}
                <Pressable style={styles.dateInput} onPress={() => setModalVisible(true)}>
                  <Text style={styles.dateText}>Birthday: {birthday.toDateString()}</Text>
                </Pressable>

                <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
                  <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                      <Text style={styles.modalTitle}>Select Birthday</Text>
                      
                      {showPicker && (
                        <DateTimePicker
                          value={birthday}
                          mode="date"
                          display="calendar"
                          onChange={onChange}
                          maximumDate={new Date()}
                        />
                      )}

                      <Pressable style={styles.modalButton} onPress={() => setShowPicker(true)}>
                        <Text style={styles.modalButtonText}>Pick Date</Text>
                      </Pressable>

                      <Pressable style={styles.modalButton} onPress={() => setModalVisible(false)}>
                        <Text style={styles.modalButtonText}>Done</Text>
                      </Pressable>
                    </View>
                  </View>
                </Modal>

                {/* Loading Indicator */}
                {loading && <ActivityIndicator size="large" color="#db2777" style={{ marginTop: 20 }} />}

                {/* Animated Sign Up Button */}
                {!loading && (
                  <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                    <Pressable
                      style={styles.saveButton}
                      onPress={handleSignUp}
                      onPressIn={() => animateButton(0.95)}
                      onPressOut={() => animateButton(1)}
                    >
                      <Text style={styles.saveButtonText}>Sign Up</Text>
                    </Pressable>
                  </Animated.View>
                )}

                {/* Navigate to SignIn */}
                <View style={styles.signInContainer}>
                  <Text style={styles.signInText}>Already have an account? </Text>
                  <Pressable onPress={() => navigation.navigate("SignIn")}>
                    <Text style={styles.signInLink}>Sign In</Text>
                  </Pressable>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
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
    paddingVertical: 30,
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
    marginBottom: 20,
    fontStyle: 'italic',
  },
  imgUploader: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fce7f3',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#db2777',
    borderStyle: 'dashed',
    marginBottom: 20,
  },
  profileImg: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  imgPlaceholder: {
    alignItems: 'center',
  },
  imgTxt: {
    fontSize: 36,
    color: '#db2777',
    marginBottom: 5,
  },
  imgLabel: {
    fontSize: 14,
    color: '#9d174d',
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
  dateInput: {
    width: '100%',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f9a8d4',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginVertical: 6,
  },
  dateText: {
    fontSize: 16,
    color: '#9d174d',
  },
  saveButton: {
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
  saveButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(255,192,203,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: 300,
    backgroundColor: '#fff0f6',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#be123c',
    marginBottom: 15,
  },
  modalButton: {
    backgroundColor: '#db2777',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    paddingBottom: 50, 
  },
  signInText: {
    fontSize: 16,
    color: '#9d174d',
  },
  signInLink: {
    fontSize: 16,
    color: '#db2777',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    marginLeft: 4,
  },
});
