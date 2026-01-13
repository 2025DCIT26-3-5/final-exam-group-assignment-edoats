import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { PaperProvider } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

// Stores & Theme
import { useThemeStore } from "../store/useThemeStore";
import { CVSkedLightTheme, CVSkedDarkTheme } from "../theme";

// Screens
import { DashboardScreen } from "../screens/DashboardScreen";
import { CourseListScreen } from "../screens/CourseListScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import { SplashScreen } from "../screens/SplashScreen";

const Tab = createBottomTabNavigator();

function AppTabs() {
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? CVSkedDarkTheme : CVSkedLightTheme;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.outline,
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.secondary,
        tabBarIcon: ({ color, size, focused }) => {
          let iconName: keyof typeof MaterialCommunityIcons.glyphMap = "view-dashboard";

          if (route.name === "Dashboard") {
            iconName = focused ? "view-dashboard" : "view-dashboard-outline";
          } else if (route.name === "Courses") {
            iconName = focused ? "book-open-variant" : "book-open-variant";
          } else if (route.name === "Settings") {
            iconName = focused ? "cog" : "cog-outline";
          }

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarLabelStyle: {
            fontSize: 12,
            fontFamily: 'sans-serif',
        },
        animation: 'shift',
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        listeners={{
            tabPress: () => Haptics.selectionAsync(),
        }}
      />
      <Tab.Screen 
        name="Courses" 
        component={CourseListScreen} 
        listeners={{
            tabPress: () => Haptics.selectionAsync(),
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen} 
        listeners={{
            tabPress: () => Haptics.selectionAsync(),
        }}
      />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const [isSplashVisible, setSplashVisible] = useState(true);
  const { isDarkMode } = useThemeStore();
  const paperTheme = isDarkMode ? CVSkedDarkTheme : CVSkedLightTheme;

  // Adapt Paper theme to Navigation theme
  const navTheme = {
    ...paperTheme,
    colors: {
      ...paperTheme.colors,
      primary: paperTheme.colors.primary,
      background: paperTheme.colors.background,
      card: paperTheme.colors.surface,
      text: paperTheme.colors.onSurface,
      border: paperTheme.colors.outline,
      notification: paperTheme.colors.error,
    },
  };

  return (
    <PaperProvider theme={paperTheme}>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <NavigationContainer theme={navTheme as any}>
        {isSplashVisible ? (
            <SplashScreen onFinish={() => setSplashVisible(false)} />
        ) : (
            <AppTabs />
        )}
      </NavigationContainer>
    </PaperProvider>
  );
}