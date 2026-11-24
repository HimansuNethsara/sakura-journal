import React, { useEffect, useState, useContext } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AlertNotificationRoot } from "react-native-alert-notification";
import { Feather } from "@expo/vector-icons";
import { AuthContext } from "../context/AuthContext";

export default function SettingsScreen() {
  const { userData, setUserData } = useContext(AuthContext);

  const handleSignOut = async () => {
    await AsyncStorage.removeItem("userData");
    setUserData(null); // triggers App.tsx to show SignIn/SignUp stack
  };

  if (!userData) return null; // or loader

  return (
    <AlertNotificationRoot>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>⚙️ Settings</Text>

        <View style={styles.profileCard}>
          <View style={styles.avatarWrapper}>
            <Image
              source={{ uri: userData.profile_image }}
              style={styles.profilePic}
            />
            <View style={styles.editIcon}>
              <Feather name="edit-3" size={20} color="#fff" />
            </View>
          </View>
          <Text style={styles.username}>{userData.username}</Text>
          <Text style={styles.email}>{userData.email}</Text>
        </View>

        <View style={styles.infoCard}>
          <Feather name="user" size={18} color="#9d174d" style={{ marginRight: 8 }} />
          <Text style={styles.infoText}>Username: {userData.username}</Text>
        </View>

        <View style={styles.infoCard}>
          <Feather name="mail" size={18} color="#9d174d" style={{ marginRight: 8 }} />
          <Text style={styles.infoText}>Email: {userData.email}</Text>
        </View>

        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Feather name="log-out" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </AlertNotificationRoot>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff0f6",
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#be123c",
    marginBottom: 20,
    textAlign: "center",
  },
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: "center",
    shadowColor: "#f9a8d4",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: 12,
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#db2777",
  },
  editIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#db2777",
    borderRadius: 12,
    padding: 4,
  },
  username: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#9d174d",
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: "#444",
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: "#f9a8d4",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  infoText: {
    fontSize: 16,
    color: "#444",
  },
  signOutBtn: {
    flexDirection: "row",
    backgroundColor: "#ef4444",
    paddingVertical: 16,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#f9a8d4",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  signOutText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
