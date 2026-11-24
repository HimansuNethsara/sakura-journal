import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/HomeScreen"; 
import NoteScreen from "../screens/NoteScreen"; 
import { Ionicons } from "@expo/vector-icons";
import SettingsScreen from "../screens/SettingsScreen";

const Tab = createBottomTabNavigator();

export default function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#db2777",
        tabBarInactiveTintColor: "#9d174d",
        tabBarStyle: { backgroundColor: "#fff0f6" },
        tabBarIcon: ({ color, size }) => {
          let iconName: any;

          if (route.name === "Todo") iconName = "list";
          else if (route.name === "Notes") iconName = "document-text";
          else if (route.name === "Settings") iconName = "settings";

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Todo" component={HomeScreen} />
      <Tab.Screen name="Notes" component={NoteScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
