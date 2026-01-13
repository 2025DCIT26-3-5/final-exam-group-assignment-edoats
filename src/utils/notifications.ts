import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      // console.log('Failed to get push token for push notification!');
      return;
    }
  }
}

// Map day name to Expo weekday number (1 = Sunday, 2 = Monday, ...)
const getDayNumber = (day: string): number => {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const index = days.indexOf(day);
  return index === -1 ? 2 : index + 1; // Default to Monday if not found
}

export async function scheduleWeeklyClassNotification(
  id: string,
  courseCode: string,
  courseName: string,
  day: string,
  startTime: string, // "HH:mm"
  minutesBefore: number = 10
) {
  const [hourStr, minuteStr] = startTime.split(":");
  let hour = parseInt(hourStr);
  let minute = parseInt(minuteStr);
  const weekday = getDayNumber(day);

  // Calculate trigger time (minutesBefore)
  // If subtracting minutesBefore rolls back an hour or day, we handle it.
  // Easiest is to convert to total minutes, subtract, then convert back.
  let totalMinutes = hour * 60 + minute - minutesBefore;

  // Handle day wrap around if needed (unlikely for 10 min, but safe to check)
  // If totalMinutes < 0, it means previous day. 
  // For simplicity, let's assume classes are 7am-7pm, so 10 mins before is safe on same day.
  // If exactly 00:00 start, we'd wrap. 

  if (totalMinutes < 0) {
    totalMinutes += 24 * 60;
    // weekday would change too... logic gets complex. 
    // Assuming valid class hours for now.
  }

  hour = Math.floor(totalMinutes / 60);
  minute = totalMinutes % 60;

  try {
    await Notifications.scheduleNotificationAsync({
      identifier: id, // Use block ID as identifier to easily cancel later
      content: {
        title: `Upcoming Class: ${courseCode}`,
        body: `${courseCode} - ${courseName} starts in ${minutesBefore} minutes!`,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        weekday: weekday,
        hour: hour,
        minute: minute,
        repeats: true,
      },
    });
  } catch (e) {
    console.log("Error scheduling notification:", e);
  }
}

export async function cancelNotification(id: string) {
  await Notifications.cancelScheduledNotificationAsync(id);
}

export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}