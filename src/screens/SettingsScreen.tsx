import React, { useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { List, Switch, Button, useTheme, Divider, Text, TextInput, Dialog, Portal } from "react-native-paper";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import * as DocumentPicker from "expo-document-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeStore } from "../store/useThemeStore";
import { useUserStore } from "../store/useUserStore";
import { useScheduleStore } from "../store/useScheduleStore";
import { useSettingsStore } from "../store/useSettingsStore";
import { ExportModal } from "../components/ExportModal";

export function SettingsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { isDarkMode, toggleTheme, use24HourFormat, toggleTimeFormat } = useThemeStore();
  const { name, setName } = useUserStore();
  const { blocks, importSchedule } = useScheduleStore();
  const { notificationsEnabled, reminderMinutes, setNotificationsEnabled, setReminderMinutes } = useSettingsStore();

  const [nameDialogVisible, setNameDialogVisible] = useState(false);
  const [reminderDialogVisible, setReminderDialogVisible] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [newName, setNewName] = useState(name);
  const [tempReminderMinutes, setTempReminderMinutes] = useState(reminderMinutes.toString());

  const handleExportJSON = async () => {
    try {
      const fileName = "cvsked_backup.json";
      const fileUri = FileSystem.Paths.document.uri + fileName;
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(blocks));
      await Sharing.shareAsync(fileUri);
    } catch {
      Alert.alert("Error", "Could not export schedule");
    }
  };

  const handleImportJSON = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/json",
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const fileContent = await FileSystem.readAsStringAsync(result.assets[0].uri);
        const importedBlocks = JSON.parse(fileContent);
        if (Array.isArray(importedBlocks)) {
          importSchedule(importedBlocks);
          Alert.alert("Success", "Schedule imported successfully!");
        } else {
          throw new Error("Invalid format");
        }
      }
    } catch {
      Alert.alert("Error", "Could not import schedule. Ensure the file is a valid CVSked JSON.");
    }
  };

  const handleExportPDF = async () => {
    try {
      const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: 'Helvetica', sans-serif; padding: 20px; }
              h1 { text-align: center; color: #333; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
              th { background-color: #057b06; color: white; }
              tr:nth-child(even) { background-color: #f2f2f2; }
              .time { width: 100px; font-weight: bold; }
            </style>
          </head>
          <body>
            <h1>Class Schedule</h1>
            <table>
              <tr>
                <th>Course</th>
                <th>Name</th>
                <th>Day</th>
                <th>Time</th>
              </tr>
              ${blocks
          .map(
            (b) => `
                <tr>
                  <td>${b.code}</td>
                  <td>${b.name}</td>
                  <td>${b.day}</td>
                  <td>${b.startTime} - ${b.endTime}</td>
                </tr>
              `
          )
          .join("")}
            </table>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri, { UTI: ".pdf", mimeType: "application/pdf" });
    } catch {
      Alert.alert("Error", "Could not generate PDF");
    }
  };

  const saveName = () => {
    setName(newName);
    setNameDialogVisible(false);
  };

  const saveReminderMinutes = () => {
    const minutes = parseInt(tempReminderMinutes);
    if (!isNaN(minutes) && minutes > 0) {
      setReminderMinutes(minutes);
    }
    setReminderDialogVisible(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background, paddingTop: insets.top }]}>
      <Text variant="headlineMedium" style={[styles.header, { fontFamily: 'serif', color: theme.colors.primary }]}>Settings</Text>

      <List.Section>
        <List.Subheader>Profile</List.Subheader>
        <List.Item
          title="Display Name"
          description={name}
          left={() => <List.Icon icon="account" />}
          onPress={() => setNameDialogVisible(true)}
        />
        <Divider />

        <List.Subheader>Appearance</List.Subheader>
        <List.Item
          title="Dark Mode"
          left={() => <List.Icon icon="theme-light-dark" />}
          right={() => <Switch value={isDarkMode} onValueChange={toggleTheme} />}
        />
        <List.Item
          title="24-Hour Time Format"
          description={use24HourFormat ? "14:00" : "2:00 PM"}
          left={() => <List.Icon icon="clock-outline" />}
          right={() => <Switch value={use24HourFormat} onValueChange={toggleTimeFormat} />}
        />
        <Divider />

        <List.Subheader>Data</List.Subheader>
        <List.Item
          title="Notifications"
          description={notificationsEnabled ? `Alert ${reminderMinutes} min before class` : "Disabled"}
          left={() => <List.Icon icon="bell" />}
          right={() => <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} />}
          onPress={() => {
            if (notificationsEnabled) {
              setTempReminderMinutes(reminderMinutes.toString());
              setReminderDialogVisible(true);
            }
          }}
        />
        <Divider />

        <List.Item
          title="Export as Image"
          description="Save as PNG with custom resolution"
          left={() => <List.Icon icon="image" />}
          onPress={() => setExportModalVisible(true)}
        />
        <List.Item
          title="Export as PDF"
          description="Generate a printable schedule"
          left={() => <List.Icon icon="file-pdf-box" />}
          onPress={handleExportPDF}
        />
        <List.Item
          title="Export JSON"
          description="Share your schedule file"
          left={() => <List.Icon icon="code-json" />}
          onPress={handleExportJSON}
        />
        <List.Item
          title="Import JSON"
          description="Load a schedule from a file"
          left={() => <List.Icon icon="file-import" />}
          onPress={handleImportJSON}
        />
      </List.Section>

      <Portal>
        <Dialog visible={nameDialogVisible} onDismiss={() => setNameDialogVisible(false)}>
          <Dialog.Title>Edit Name</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Name"
              value={newName}
              onChangeText={setNewName}
              mode="outlined"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setNameDialogVisible(false)}>Cancel</Button>
            <Button onPress={saveName}>Save</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={reminderDialogVisible} onDismiss={() => setReminderDialogVisible(false)}>
          <Dialog.Title>Reminder Time</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={{ marginBottom: 16 }}>
              Notify me this many minutes before class starts:
            </Text>
            <TextInput
              label="Minutes"
              value={tempReminderMinutes}
              onChangeText={setTempReminderMinutes}
              keyboardType="numeric"
              mode="outlined"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setReminderDialogVisible(false)}>Cancel</Button>
            <Button onPress={saveReminderMinutes}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Export Modal */}
      <ExportModal
        visible={exportModalVisible}
        onDismiss={() => setExportModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { marginBottom: 20 },
});