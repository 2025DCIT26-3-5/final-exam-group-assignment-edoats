import React, { useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { Modal, Portal, Text, Button, TextInput, useTheme, IconButton, Divider } from "react-native-paper";
import { CourseBlock, useScheduleStore } from "../store/useScheduleStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface BlockDetailModalProps {
    visible: boolean;
    block: CourseBlock | null;
    onDismiss: () => void;
}

export function BlockDetailModal({ visible, block, onDismiss }: BlockDetailModalProps) {
    const theme = useTheme();
    const { updateBlock, deleteBlock } = useScheduleStore();
    const [isEditing, setIsEditing] = useState(false);

    // Edit form state
    const [code, setCode] = useState("");
    const [name, setName] = useState("");
    const [instructor, setInstructor] = useState("");
    const [note, setNote] = useState("");
    const [day, setDay] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");

    // Initialize form when block changes
    React.useEffect(() => {
        if (block) {
            setCode(block.code);
            setName(block.name);
            setInstructor(block.instructor || "");
            setNote(block.note || "");
            setDay(block.day);
            setStartTime(block.startTime);
            setEndTime(block.endTime);
        }
        setIsEditing(false);
    }, [block]);

    if (!block) return null;

    const handleSave = () => {
        updateBlock(block.id, {
            code,
            name,
            instructor: instructor || undefined,
            note: note || undefined,
            day,
            startTime,
            endTime,
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setIsEditing(false);
        onDismiss();
    };

    const handleDelete = () => {
        Alert.alert(
            "Delete Course",
            `Are you sure you want to delete ${block.code}?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                        deleteBlock(block.id);
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                        onDismiss();
                    },
                },
            ]
        );
    };

    const hexToRgba = (hex: string, alpha: number) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    return (
        <Portal>
            <Modal
                visible={visible}
                onDismiss={onDismiss}
                contentContainerStyle={[
                    styles.modal,
                    { backgroundColor: theme.colors.surface }
                ]}
            >
                {/* Header with color accent */}
                <View style={[styles.header, { backgroundColor: hexToRgba(block.color, 0.3), borderLeftColor: block.color }]}>
                    <View style={styles.headerContent}>
                        <Text variant="headlineSmall" style={{ fontWeight: "bold", color: theme.colors.onSurface }}>
                            {isEditing ? "Edit Course" : block.code}
                        </Text>
                        {!isEditing && (
                            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                                {block.name}
                            </Text>
                        )}
                    </View>
                    <IconButton
                        icon={isEditing ? "close" : "pencil"}
                        onPress={() => setIsEditing(!isEditing)}
                    />
                </View>

                <Divider />

                {isEditing ? (
                    // Edit Form
                    <View style={styles.content}>
                        <TextInput
                            label="Course Code"
                            value={code}
                            onChangeText={setCode}
                            mode="outlined"
                            style={styles.input}
                            dense
                        />
                        <TextInput
                            label="Course Name"
                            value={name}
                            onChangeText={setName}
                            mode="outlined"
                            style={styles.input}
                            dense
                        />
                        <TextInput
                            label="Instructor"
                            value={instructor}
                            onChangeText={setInstructor}
                            mode="outlined"
                            style={styles.input}
                            dense
                        />
                        <TextInput
                            label="Notes"
                            value={note}
                            onChangeText={setNote}
                            mode="outlined"
                            style={styles.input}
                            dense
                            multiline
                        />

                        <View style={styles.timeRow}>
                            <TextInput
                                label="Start"
                                value={startTime}
                                onChangeText={setStartTime}
                                mode="outlined"
                                style={[styles.input, { flex: 1, marginRight: 8 }]}
                                dense
                            />
                            <TextInput
                                label="End"
                                value={endTime}
                                onChangeText={setEndTime}
                                mode="outlined"
                                style={[styles.input, { flex: 1 }]}
                                dense
                            />
                        </View>

                        <View style={styles.daySelector}>
                            {DAYS.slice(0, 3).map((d) => (
                                <Button
                                    key={d}
                                    mode={day === d ? "contained" : "outlined"}
                                    onPress={() => setDay(d)}
                                    compact
                                    style={styles.dayButton}
                                >
                                    {d.substring(0, 3)}
                                </Button>
                            ))}
                        </View>
                        <View style={styles.daySelector}>
                            {DAYS.slice(3).map((d) => (
                                <Button
                                    key={d}
                                    mode={day === d ? "contained" : "outlined"}
                                    onPress={() => setDay(d)}
                                    compact
                                    style={styles.dayButton}
                                >
                                    {d.substring(0, 3)}
                                </Button>
                            ))}
                        </View>

                        <View style={styles.actions}>
                            <Button mode="outlined" onPress={() => setIsEditing(false)}>
                                Cancel
                            </Button>
                            <Button mode="contained" onPress={handleSave}>
                                Save
                            </Button>
                        </View>
                    </View>
                ) : (
                    // Detail View
                    <View style={styles.content}>
                        <View style={styles.infoRow}>
                            <MaterialCommunityIcons name="calendar" size={20} color={theme.colors.primary} />
                            <Text variant="bodyLarge" style={styles.infoText}>{block.day}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <MaterialCommunityIcons name="clock-outline" size={20} color={theme.colors.primary} />
                            <Text variant="bodyLarge" style={styles.infoText}>
                                {block.startTime} - {block.endTime}
                            </Text>
                        </View>

                        {block.instructor && (
                            <View style={styles.infoRow}>
                                <MaterialCommunityIcons name="account" size={20} color={theme.colors.primary} />
                                <Text variant="bodyLarge" style={styles.infoText}>{block.instructor}</Text>
                            </View>
                        )}

                        {block.note && (
                            <View style={styles.noteContainer}>
                                <MaterialCommunityIcons name="note-text" size={20} color={theme.colors.primary} />
                                <Text variant="bodyMedium" style={[styles.infoText, { fontStyle: 'italic' }]}>
                                    {block.note}
                                </Text>
                            </View>
                        )}

                        <View style={styles.actions}>
                            <Button
                                mode="outlined"
                                onPress={handleDelete}
                                textColor={theme.colors.error}
                                icon="delete"
                            >
                                Delete
                            </Button>
                            <Button mode="contained" onPress={() => setIsEditing(true)} icon="pencil">
                                Edit
                            </Button>
                        </View>
                    </View>
                )}
            </Modal>
        </Portal>
    );
}

const styles = StyleSheet.create({
    modal: {
        margin: 20,
        borderRadius: 12,
        overflow: "hidden",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        borderLeftWidth: 4,
    },
    headerContent: {
        flex: 1,
    },
    content: {
        padding: 16,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    infoText: {
        marginLeft: 12,
    },
    noteContainer: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 12,
        padding: 12,
        backgroundColor: "rgba(255,255,255,0.05)",
        borderRadius: 8,
    },
    input: {
        marginBottom: 8,
        backgroundColor: "transparent",
    },
    timeRow: {
        flexDirection: "row",
    },
    daySelector: {
        flexDirection: "row",
        justifyContent: "center",
        marginVertical: 4,
    },
    dayButton: {
        margin: 2,
    },
    actions: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 16,
        gap: 12,
    },
});
