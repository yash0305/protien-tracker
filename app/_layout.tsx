import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useState } from "react";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AnimatedSplash } from "../components/AnimatedSplash";
import { AppProvider, useApp } from "../context/AppContext";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

function tabIcon(active: IconName, inactive: IconName) {
  return ({
    color,
    size,
    focused,
  }: {
    color: string;
    size: number;
    focused: boolean;
  }) => (
    <Ionicons name={focused ? active : inactive} size={size} color={color} />
  );
}

function TabsShell() {
  const { isLoading, colors, isDark } = useApp();
  const [splashDone, setSplashDone] = useState(false);
  const handleFinish = useCallback(() => setSplashDone(true), []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {!isLoading && (
        <>
          <StatusBar style={isDark ? "light" : "dark"} />
          <Tabs
            screenOptions={{
              headerShown: false,
              tabBarActiveTintColor: colors.accentStrong,
              tabBarInactiveTintColor: colors.textSecondary,
              tabBarStyle: {
                backgroundColor: colors.card,
                borderTopColor: colors.border,
              },
              tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
              sceneStyle: { backgroundColor: colors.background },
            }}
          >
            <Tabs.Screen
              name="index"
              options={{
                title: "Home",
                tabBarIcon: tabIcon("home", "home-outline"),
              }}
            />
            <Tabs.Screen
              name="history"
              options={{
                title: "History",
                tabBarIcon: tabIcon("time", "time-outline"),
              }}
            />
            <Tabs.Screen
              name="settings"
              options={{
                title: "Settings",
                tabBarIcon: tabIcon("settings", "settings-outline"),
              }}
            />
          </Tabs>
        </>
      )}
      {!splashDone && <AnimatedSplash onFinish={handleFinish} />}
    </View>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <TabsShell />
      </AppProvider>
    </SafeAreaProvider>
  );
}
