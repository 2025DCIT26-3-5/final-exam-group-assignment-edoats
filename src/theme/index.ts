import {
  MD3DarkTheme as DefaultDarkTheme,
  MD3LightTheme as DefaultLightTheme,
  MD3Theme,
  configureFonts,
} from "react-native-paper";

// Brand Colors
const CVSU_GREEN = "#057b06";
const DARK_BG = "#121212";
const SURFACE_BG = "#252525";
const TEXT_PRIMARY = "#E0E0E0";
const TEXT_SECONDARY = "#A0A0A0";

// Font Configuration
const fontConfig = {
  displayLarge: { fontFamily: "serif" },
  displayMedium: { fontFamily: "serif" },
  displaySmall: { fontFamily: "serif" },
  headlineLarge: { fontFamily: "serif" },
  headlineMedium: { fontFamily: "serif" },
  headlineSmall: { fontFamily: "serif" },
  titleLarge: { fontFamily: "serif" },
  titleMedium: { fontFamily: "sans-serif" },
  titleSmall: { fontFamily: "sans-serif" },
  bodyLarge: { fontFamily: "sans-serif" },
  bodyMedium: { fontFamily: "sans-serif" },
  bodySmall: { fontFamily: "sans-serif" },
  labelLarge: { fontFamily: "sans-serif" },
  labelMedium: { fontFamily: "sans-serif" },
  labelSmall: { fontFamily: "sans-serif" },
};

export const CVSkedDarkTheme: MD3Theme = {
  ...DefaultDarkTheme,
  colors: {
    ...DefaultDarkTheme.colors,
    primary: CVSU_GREEN,
    onPrimary: "#FFFFFF",
    primaryContainer: "#003e00",
    onPrimaryContainer: "#99ff99",
    background: DARK_BG,
    surface: SURFACE_BG,
    onSurface: TEXT_PRIMARY,
    onBackground: TEXT_PRIMARY,
    surfaceVariant: "#333333",
    onSurfaceVariant: TEXT_SECONDARY,
    secondary: CVSU_GREEN, // User requested green for secondary
    tertiary: "#7d5260", // Muted pastel accent example
  },
  // Paper types might be strict about font config structure matches
  fonts: configureFonts({ config: fontConfig }),
};

export const CVSkedLightTheme: MD3Theme = {
  ...DefaultLightTheme,
  colors: {
    ...DefaultLightTheme.colors,
    primary: CVSU_GREEN,
    secondary: CVSU_GREEN,
    background: "#F5F5F5",
    surface: "#FFFFFF",
  },
  fonts: configureFonts({ config: fontConfig }),
};
