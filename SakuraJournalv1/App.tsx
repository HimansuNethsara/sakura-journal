import React, { useEffect, useState, createContext } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";

import SignInScreen from "./src/screens/SignInScreen";
import SignUpScreen from "./src/screens/SignUpScreen";
import HomeTabs from "./src/navigation/HomeTabs";
import { AuthContext } from "./src/context/AuthContext";

export type RootParamList = {
  SignIn: undefined;
  SignUp: undefined;
  HomeTabs: undefined;
};

const Stack = createNativeStackNavigator<RootParamList>();

export default function App() {
  const [userData, setUserData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLogin = async () => {
      const user = await AsyncStorage.getItem("userData");
      if (user) setUserData(JSON.parse(user));
      setLoading(false);
    };
    checkLogin();
  }, []);

  if (loading) return null; // optional splash screen

  return (
    <AuthContext.Provider value={{ userData, setUserData }}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {userData ? (
              // User is logged in
              <Stack.Screen name="HomeTabs" component={HomeTabs} />
            ) : (
              // User is not logged in
              <>
                <Stack.Screen name="SignIn" component={SignInScreen} />
                <Stack.Screen name="SignUp" component={SignUpScreen} />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </GestureHandlerRootView>
    </AuthContext.Provider>
  );
}
