import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useScheduleStore } from "./useScheduleStore";
import { cancelAllNotifications, scheduleWeeklyClassNotification } from "../utils/notifications";

interface SettingsState {
    notificationsEnabled: boolean;
    reminderMinutes: number; // Minutes before class to notify
    setNotificationsEnabled: (enabled: boolean) => void;
    setReminderMinutes: (minutes: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set, get) => ({
            notificationsEnabled: true,
            reminderMinutes: 10,

            setNotificationsEnabled: (enabled: boolean) => {
                set({ notificationsEnabled: enabled });

                // Trigger reschedule logic
                // If disabled, cancel all.
                // If enabled, reschedule all using current reminderMinutes.
                const { blocks } = useScheduleStore.getState();
                if (!enabled) {
                    cancelAllNotifications();
                } else {
                    // Cancel first to be safe/clean, then schedule
                    cancelAllNotifications().then(() => {
                        const { reminderMinutes } = get();
                        blocks.forEach(block => {
                            scheduleWeeklyClassNotification(
                                block.id,
                                block.code,
                                block.name,
                                block.day,
                                block.startTime,
                                reminderMinutes
                            );
                        });
                    });
                }
            },

            setReminderMinutes: (minutes: number) => {
                set({ reminderMinutes: minutes });

                // Trigger reschedule if enabled
                const { notificationsEnabled } = get();
                if (notificationsEnabled) {
                    const { blocks } = useScheduleStore.getState();
                    cancelAllNotifications().then(() => {
                        blocks.forEach(block => {
                            scheduleWeeklyClassNotification(
                                block.id,
                                block.code,
                                block.name,
                                block.day,
                                block.startTime,
                                minutes
                            );
                        });
                    });
                }
            },
        }),
        {
            name: "settings-storage",
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
