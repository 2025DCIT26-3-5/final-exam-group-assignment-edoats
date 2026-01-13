import React, { useState } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { Text, Card, FAB, Dialog, Portal, TextInput, Button, useTheme, List } from "react-native-paper";
import { useScheduleStore, CourseBlock } from "../store/useScheduleStore";
import { schedulePushNotification } from "../utils/notifications";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown, Layout } from "react-native-reanimated";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const COLORS = ["#7D5260", "#4F6D7A", "#6A8EAE", "#9A8C98", "#C9ADA7"]; // Muted pastels

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CourseCard = React.memo(({ item, onDelete, theme, index }: { item: CourseBlock, onDelete: (id: string) => void, theme: any, index: number }) => (
  <Animated.View entering={FadeInDown.delay(index * 100).duration(400)} layout={Layout.springify()}>
    <Card style={[styles.card, { backgroundColor: theme.colors.surfaceVariant }]}>
        <Card.Content>
        <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text variant="titleMedium" style={{ fontWeight: "bold" }}>{item.code}</Text>
                    {item.note && <List.Icon icon="note-text" style={{ margin: 0, padding: 0 }} color={theme.colors.primary} />}
                </View>
                <Text variant="bodyMedium">{item.name}</Text>
            </View>
            <View style={[styles.colorBadge, { backgroundColor: item.color }]} />
        </View>
        {item.note && <Text variant="bodySmall" style={{ fontStyle: 'italic', marginTop: 4 }}>Note: {item.note}</Text>}
        <Text variant="bodySmall" style={{ opacity: 0.7, marginTop: 4 }}>
            {item.day} • {item.startTime} - {item.endTime}
        </Text>
        </Card.Content>
        <Card.Actions>
        <Button onPress={() => {
            onDelete(item.id);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }}>Delete</Button>
        </Card.Actions>
    </Card>
  </Animated.View>
));
CourseCard.displayName = "CourseCard";

export function CourseListScreen() {
  const theme = useTheme();
  const { blocks, addBlock, deleteBlock } = useScheduleStore();
  const [visible, setVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Form State
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [day, setDay] = useState(DAYS[0]);
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("10:00");

  const showDialog = () => setVisible(true);
  const hideDialog = () => setVisible(false);

  const filteredBlocks = blocks.filter(b => 
    b.code.toLowerCase().includes(searchQuery.toLowerCase()) || 
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdd = () => {
    if (code && name) {
      const newBlock: CourseBlock = {
        id: Date.now().toString(),
        code,
        name,
        day,
        note: note || undefined,
        startTime,
        endTime,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      };
      addBlock(newBlock);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      schedulePushNotification(
        "Course Added",
        `You have successfully added ${code}: ${name} to your schedule.`
      );
      hideDialog();
      // Reset form
      setCode("");
      setName("");
      setNote("");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
            <Text variant="headlineMedium" style={{color: theme.colors.primary, fontFamily: 'serif', marginBottom: 16}}>My Courses</Text>
            <TextInput 
                mode="outlined" 
                placeholder="Search courses" 
                value={searchQuery}
                onChangeText={setSearchQuery}
                left={<TextInput.Icon icon="magnify" />}
                style={styles.searchBar}
                theme={{ roundness: 12 }}
            />
        </View>

      <FlatList
        data={filteredBlocks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => (
          <CourseCard item={item} onDelete={deleteBlock} theme={theme} index={index} />
        )}
      />

      <Portal>
        <Dialog visible={visible} onDismiss={hideDialog}>
          <Dialog.Title>Add Course Block</Dialog.Title>
          <Dialog.Content>
            <TextInput label="Course Code" value={code} onChangeText={setCode} style={styles.input} />
            <TextInput label="Course Name" value={name} onChangeText={setName} style={styles.input} />
            <TextInput label="Notes" value={note} onChangeText={setNote} style={styles.input} placeholder="Optional notes" />
            <Text variant="bodySmall" style={{ marginTop: 10 }}>Simple Time Input (HH:mm)</Text>
            <View style={styles.row}>
                <TextInput label="Start" value={startTime} onChangeText={setStartTime} style={[styles.input, {flex:1, marginRight: 5}]} />
                <TextInput label="End" value={endTime} onChangeText={setEndTime} style={[styles.input, {flex:1, marginLeft: 5}]} />
            </View>
             {/* Simple Day Picker - ideally a dropdown */}
             <View style={styles.daySelector}>
                {DAYS.slice(0, 3).map(d => (
                    <Button key={d} mode={day === d ? "contained" : "outlined"} onPress={() => setDay(d)} compact style={{margin:2}}>{d.substring(0,3)}</Button>
                ))}
             </View>
             <View style={styles.daySelector}>
                {DAYS.slice(3).map(d => (
                    <Button key={d} mode={day === d ? "contained" : "outlined"} onPress={() => setDay(d)} compact style={{margin:2}}>{d.substring(0,3)}</Button>
                ))}
             </View>

          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideDialog}>Cancel</Button>
            <Button onPress={handleAdd}>Add</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <FAB icon="plus" style={[styles.fab, { backgroundColor: theme.colors.primary }]} onPress={showDialog} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20 },
  list: { padding: 16 },
  card: { marginBottom: 12 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  colorBadge: { width: 12, height: 12, borderRadius: 6 },
  fab: { position: "absolute", margin: 16, right: 0, bottom: 0 },
  input: { marginBottom: 12, backgroundColor: 'transparent' },
  searchBar: { backgroundColor: 'transparent', height: 45 },
  row: { flexDirection: "row" },
  daySelector: { flexDirection: "row", justifyContent: "center", marginVertical: 4 }
});