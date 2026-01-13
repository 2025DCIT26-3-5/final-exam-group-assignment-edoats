import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, FlatList, Animated, ScrollView, TouchableOpacity } from "react-native";
import { Text, Card, FAB, Modal, Portal, TextInput, Button, useTheme, IconButton, SegmentedButtons } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useScheduleStore, CourseBlock } from "../store/useScheduleStore";
import { useThemeStore, formatTimeRange } from "../store/useThemeStore";
import { COURSE_CATALOG, findCatalogCourse, CatalogCourse } from "../data/courseCatalog";
import { schedulePushNotification } from "../utils/notifications";
import * as Haptics from "expo-haptics";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "gned", label: "GNED" },
  { value: "dcit", label: "IT" },
  { value: "fitt", label: "PE" },
  { value: "nstp", label: "NSTP" },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CourseCard = React.memo(({ item, onDelete, onEdit, theme, index, use24HourFormat }: { item: CourseBlock, onDelete: (id: string) => void, onEdit: (block: CourseBlock) => void, theme: any, index: number, use24HourFormat: boolean }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, index]);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={2}>
        <View style={[styles.cardAccent, { backgroundColor: item.color }]} />
        <Card.Content style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <Text variant="titleMedium" style={{ fontWeight: "bold", fontSize: 16 }}>{item.code}</Text>
              <Text variant="bodyMedium" style={{ opacity: 0.7, marginTop: 2 }}>{item.name}</Text>
              {item.instructor && <Text variant="bodySmall" style={{ opacity: 0.5, marginTop: 2 }}>👤 {item.instructor}</Text>}
            </View>
            {item.creditUnits && (
              <View style={[styles.creditBadge, { backgroundColor: item.color }]}>
                <Text style={styles.creditText}>{item.creditUnits}</Text>
                <Text style={styles.creditLabel}>units</Text>
              </View>
            )}
          </View>
          <View style={styles.cardFooter}>
            <View style={[styles.infoPill, { backgroundColor: 'rgba(0,0,0,0.05)' }]}>
              <Text style={styles.pillText}>📅 {item.day}</Text>
            </View>
            <View style={[styles.infoPill, { backgroundColor: 'rgba(0,0,0,0.05)' }]}>
              <Text style={styles.pillText}>🕐 {formatTimeRange(item.startTime, item.endTime, use24HourFormat)}</Text>
            </View>
          </View>
        </Card.Content>
        <Card.Actions style={{ paddingTop: 0 }}>
          <Button onPress={() => onEdit(item)} compact icon="pencil">Edit</Button>
          <Button
            onPress={() => {
              onDelete(item.id);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }}
            textColor={theme.colors.onSurfaceVariant}
            compact
          >
            Delete
          </Button>
        </Card.Actions>
      </Card>
    </Animated.View>
  );
});
CourseCard.displayName = "CourseCard";

// Catalog Course Item for search results
function CatalogCourseItem({ course, onSelect, theme }: { course: CatalogCourse, onSelect: (course: CatalogCourse) => void, theme: any }) {
  return (
    <TouchableOpacity
      style={[styles.catalogItem, { borderBottomColor: 'rgba(255,255,255,0.1)' }]}
      onPress={() => {
        onSelect(course);
        Haptics.selectionAsync();
      }}
      activeOpacity={0.7}
    >
      <View style={{ flex: 1 }}>
        <Text variant="titleSmall" style={{ fontWeight: "bold" }}>{course.code}</Text>
        <Text variant="bodySmall" style={{ opacity: 0.7, marginTop: 2 }} numberOfLines={2}>{course.title}</Text>
      </View>
      <View style={styles.catalogUnits}>
        <Text style={{ fontWeight: 'bold', fontSize: 14 }}>{course.creditUnits}</Text>
        <Text style={{ fontSize: 9, opacity: 0.6 }}>units</Text>
      </View>
    </TouchableOpacity>
  );
}

// Time Picker Component
function TimePicker({ label, value, onChange, theme }: { label: string, value: string, onChange: (time: string) => void, theme: any }) {
  const [hour, minute] = value.split(":").map(Number);

  const formatTime = (h: number, m: number) => {
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  };

  const adjustHour = (delta: number) => {
    let newHour = hour + delta;
    if (newHour < 7) newHour = 20;
    if (newHour > 20) newHour = 7;
    onChange(formatTime(newHour, minute));
    Haptics.selectionAsync();
  };

  const adjustMinute = (delta: number) => {
    let newMinute = minute + delta;
    if (newMinute < 0) newMinute = 45;
    if (newMinute > 45) newMinute = 0;
    onChange(formatTime(hour, newMinute));
    Haptics.selectionAsync();
  };

  return (
    <View style={styles.timePickerContainer}>
      <Text variant="labelMedium" style={{ color: theme.colors.secondary, marginBottom: 8 }}>{label}</Text>
      <View style={styles.timePicker}>
        <View style={styles.timeUnit}>
          <IconButton icon="chevron-up" size={20} onPress={() => adjustHour(1)} />
          <Text variant="headlineMedium" style={styles.timeValue}>{hour.toString().padStart(2, "0")}</Text>
          <IconButton icon="chevron-down" size={20} onPress={() => adjustHour(-1)} />
        </View>
        <Text variant="headlineMedium" style={{ marginHorizontal: 4 }}>:</Text>
        <View style={styles.timeUnit}>
          <IconButton icon="chevron-up" size={20} onPress={() => adjustMinute(15)} />
          <Text variant="headlineMedium" style={styles.timeValue}>{minute.toString().padStart(2, "0")}</Text>
          <IconButton icon="chevron-down" size={20} onPress={() => adjustMinute(-15)} />
        </View>
        <Text variant="bodyLarge" style={{ marginLeft: 8, opacity: 0.6 }}>{hour >= 12 ? "PM" : "AM"}</Text>
      </View>
    </View>
  );
}

export function CourseListScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { blocks, addBlock, deleteBlock, updateBlock, getColorForCourse } = useScheduleStore();
  const { use24HourFormat } = useThemeStore();
  const [visible, setVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [editingBlock, setEditingBlock] = useState<CourseBlock | null>(null);

  // Form State
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [instructor, setInstructor] = useState("");
  const [note, setNote] = useState("");
  const [day, setDay] = useState(DAYS[0]);
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("10:00");

  const showAddDialog = () => {
    setEditingBlock(null);
    resetForm();
    setVisible(true);
  };

  const showEditDialog = (block: CourseBlock) => {
    setEditingBlock(block);
    setCode(block.code);
    setName(block.name);
    setInstructor(block.instructor || "");
    setNote(block.note || "");
    setDay(block.day);
    setStartTime(block.startTime);
    setEndTime(block.endTime);
    setVisible(true);
  };

  const hideDialog = () => {
    setVisible(false);
    setEditingBlock(null);
    resetForm();
  };

  const resetForm = () => {
    setCode("");
    setName("");
    setInstructor("");
    setNote("");
    setDay(DAYS[0]);
    setStartTime("08:00");
    setEndTime("10:00");
  };

  // Filter enrolled blocks
  const filteredBlocks = blocks.filter(b =>
    b.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter catalog courses for search suggestions
  const filteredCatalog = searchQuery.length > 0
    ? COURSE_CATALOG.filter(c => {
      const matchesSearch = c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = category === "all" ||
        c.code.toLowerCase().startsWith(category.toLowerCase());
      return matchesSearch && matchesCategory;
    }).slice(0, 8)
    : [];

  const handleAdd = () => {
    if (code && name) {
      const courseColor = getColorForCourse(code);
      const catalogCourse = findCatalogCourse(code);
      const creditUnits = catalogCourse?.creditUnits;

      const newBlock: CourseBlock = {
        id: Date.now().toString(),
        code,
        name,
        instructor: instructor || undefined,
        day,
        note: note || undefined,
        startTime,
        endTime,
        color: courseColor,
        creditUnits,
      };
      addBlock(newBlock);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      schedulePushNotification(
        "Course Added",
        `You have successfully added ${code}: ${name} to your schedule.`
      );
      hideDialog();
    }
  };

  const handleUpdate = () => {
    if (editingBlock && code && name) {
      updateBlock(editingBlock.id, {
        code,
        name,
        instructor: instructor || undefined,
        note: note || undefined,
        day,
        startTime,
        endTime,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      hideDialog();
    }
  };

  const selectCatalogCourse = (course: CatalogCourse) => {
    setCode(course.code);
    setName(course.title);
    setSearchQuery("");
  };

  // Calculate total credits
  const totalCredits = blocks.reduce((sum, b) => sum + (b.creditUnits || 0), 0);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text variant="headlineMedium" style={{ color: theme.colors.primary, fontFamily: 'serif' }}>My Courses</Text>
          <View style={styles.statsBadge}>
            <Text style={styles.statsText}>{blocks.length} courses • {totalCredits} units</Text>
          </View>
        </View>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <TextInput
            mode="outlined"
            placeholder="Search courses..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            left={<TextInput.Icon icon="magnify" />}
            right={searchQuery.length > 0 ? <TextInput.Icon icon="close" onPress={() => setSearchQuery("")} /> : undefined}
            style={styles.searchBar}
            theme={{ roundness: 12 }}
          />
        </View>

        {/* Category Filters */}
        {searchQuery.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
            <SegmentedButtons
              value={category}
              onValueChange={setCategory}
              buttons={CATEGORIES}
              style={{ marginRight: 16 }}
              density="small"
            />
          </ScrollView>
        )}

        {/* Catalog Search Results */}
        {filteredCatalog.length > 0 && (
          <View style={[styles.catalogResults, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Text variant="labelSmall" style={{ opacity: 0.6, marginBottom: 8, paddingHorizontal: 12 }}>COURSE CATALOG</Text>
            {filteredCatalog.map((course) => (
              <CatalogCourseItem
                key={course.code}
                course={course}
                onSelect={selectCatalogCourse}
                theme={theme}
              />
            ))}
          </View>
        )}
      </View>

      {/* Enrolled Courses List */}
      <FlatList
        data={filteredBlocks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => (
          <CourseCard
            item={item}
            onDelete={deleteBlock}
            onEdit={showEditDialog}
            theme={theme}
            index={index}
            use24HourFormat={use24HourFormat}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text variant="bodyLarge" style={{ opacity: 0.5, textAlign: "center" }}>
              No courses yet.{"\n"}Search above to find courses!
            </Text>
          </View>
        }
      />

      <Portal>
        <Modal
          visible={visible}
          onDismiss={hideDialog}
          contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text variant="headlineSmall" style={{ fontWeight: "bold" }}>
                {editingBlock ? "Edit Course" : "Add New Course"}
              </Text>
              <IconButton icon="close" onPress={hideDialog} />
            </View>

            {/* Course Info */}
            <View style={styles.section}>
              <Text variant="labelLarge" style={[styles.sectionTitle, { color: theme.colors.primary }]}>Course Information</Text>
              <TextInput
                label="Course Code"
                placeholder="e.g. DCIT 21"
                value={code}
                onChangeText={setCode}
                mode="outlined"
                style={styles.input}
                left={<TextInput.Icon icon="book" />}
                disabled={!!editingBlock}
              />
              <TextInput
                label="Course Name"
                placeholder="e.g. Introduction to Computing"
                value={name}
                onChangeText={setName}
                mode="outlined"
                style={styles.input}
                left={<TextInput.Icon icon="text" />}
              />
              <TextInput
                label="Instructor (Optional)"
                placeholder="e.g. Prof. Santos"
                value={instructor}
                onChangeText={setInstructor}
                mode="outlined"
                style={styles.input}
                left={<TextInput.Icon icon="account" />}
              />
            </View>

            {/* Day Selection */}
            <View style={styles.section}>
              <Text variant="labelLarge" style={[styles.sectionTitle, { color: theme.colors.primary }]}>Day</Text>
              <View style={styles.dayGrid}>
                {DAYS.map(d => (
                  <Button
                    key={d}
                    mode={day === d ? "contained" : "outlined"}
                    onPress={() => {
                      setDay(d);
                      Haptics.selectionAsync();
                    }}
                    compact
                    style={styles.dayButton}
                    labelStyle={{ fontSize: 12 }}
                  >
                    {d.substring(0, 3)}
                  </Button>
                ))}
              </View>
            </View>

            {/* Time Selection */}
            <View style={styles.section}>
              <Text variant="labelLarge" style={[styles.sectionTitle, { color: theme.colors.primary }]}>Time</Text>
              <View style={styles.timeRow}>
                <TimePicker label="Start Time" value={startTime} onChange={setStartTime} theme={theme} />
                <View style={styles.timeDivider}>
                  <Text variant="titleLarge" style={{ opacity: 0.3 }}>→</Text>
                </View>
                <TimePicker label="End Time" value={endTime} onChange={setEndTime} theme={theme} />
              </View>
            </View>

            {/* Notes */}
            <View style={styles.section}>
              <Text variant="labelLarge" style={[styles.sectionTitle, { color: theme.colors.primary }]}>Notes (Optional)</Text>
              <TextInput
                placeholder="Add any notes..."
                value={note}
                onChangeText={setNote}
                mode="outlined"
                style={styles.input}
                multiline
                numberOfLines={2}
              />
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <Button mode="outlined" onPress={hideDialog} style={{ flex: 1 }}>
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={editingBlock ? handleUpdate : handleAdd}
                style={{ flex: 1, marginLeft: 12 }}
                disabled={!code || !name}
              >
                {editingBlock ? "Save Changes" : "Add Course"}
              </Button>
            </View>
          </ScrollView>
        </Modal>
      </Portal>

      <FAB icon="plus" style={styles.fab} color="#FFFFFF" onPress={showAddDialog} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingBottom: 0 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  statsBadge: { backgroundColor: 'rgba(5,123,6,0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statsText: { color: '#057b06', fontSize: 12, fontWeight: '600' },
  list: { padding: 20, paddingBottom: 100 },

  // Search
  searchContainer: { marginBottom: 0 },
  searchBar: { backgroundColor: 'transparent', height: 45 },

  // Catalog results
  catalogResults: { marginTop: 12, borderRadius: 12, paddingVertical: 12, maxHeight: 280 },
  catalogItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1 },
  catalogUnits: { alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },

  // Card styles
  card: { marginBottom: 14, borderRadius: 16, overflow: 'hidden' },
  cardAccent: { width: 4, height: '100%', position: 'absolute', left: 0, top: 0, bottom: 0 },
  cardContent: { paddingLeft: 16 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  cardFooter: { flexDirection: "row", marginTop: 14, gap: 10, flexWrap: 'wrap' },

  // Credit badge
  creditBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, alignItems: 'center', justifyContent: 'center', minWidth: 50 },
  creditText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 18 },
  creditLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 10, textTransform: 'uppercase' },

  // Info pills
  infoPill: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  pillText: { fontSize: 13 },

  fab: { position: "absolute", margin: 16, right: 0, bottom: 0, backgroundColor: '#057b06' },
  emptyState: { flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 100 },

  // Modal styles
  modal: { margin: 16, borderRadius: 16, padding: 20, maxHeight: "90%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  section: { marginBottom: 20 },
  sectionTitle: { fontWeight: "600", marginBottom: 12 },
  input: { marginBottom: 8, backgroundColor: "transparent" },

  // Day selection
  dayGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  dayButton: { minWidth: 50 },

  // Time picker
  timeRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  timeDivider: { paddingHorizontal: 8 },
  timePickerContainer: { flex: 1, alignItems: "center" },
  timePicker: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 12, padding: 8 },
  timeUnit: { alignItems: "center" },
  timeValue: { fontWeight: "bold", minWidth: 40, textAlign: "center" },

  // Actions
  actions: { flexDirection: "row", marginTop: 8 },
});