import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface ThemeState {
  isDarkMode: boolean;
  use24HourFormat: boolean;
  toggleTheme: () => void;
  toggleTimeFormat: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDarkMode: true, // Default to Dark Mode as per requirements
      use24HourFormat: false, // Default to 12-hour format with AM/PM
      toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      toggleTimeFormat: () => set((state) => ({ use24HourFormat: !state.use24HourFormat })),
    }),
    {
      name: "theme-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Utility function to format time based on settings
export function formatTime(time: string, use24HourFormat: boolean): string {
  const [hourStr, minuteStr] = time.split(":");
  const hour = parseInt(hourStr);
  const minute = minuteStr || "00";

  if (use24HourFormat) {
    return `${hour.toString().padStart(2, "0")}:${minute}`;
  } else {
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minute} ${period}`;
  }
}

// Utility function to format time range
export function formatTimeRange(startTime: string, endTime: string, use24HourFormat: boolean): string {
  return `${formatTime(startTime, use24HourFormat)} - ${formatTime(endTime, use24HourFormat)}`;
}
