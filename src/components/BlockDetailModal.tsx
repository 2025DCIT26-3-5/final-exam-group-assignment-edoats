import React, { useState } from "react";
import { View, StyleSheet, Alert, ScrollView, TouchableOpacity } from "react-native";
import { Modal, Portal, Text, Button, TextInput, useTheme, IconButton, Divider } from "react-native-paper";
import { CourseBlock, useScheduleStore } from "../store/useScheduleStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const COLORS = [
    { name: "Sage", hex: "#7D5260" },
    { name: "Teal", hex: "#4F6D7A" },
    { name: "Blue", hex: "#6A8EAE" },
    { name: "Mauve", hex: "#9A8C98" },
    { name: "Rose", hex: "#C9ADA7" },
    { name: "Green", hex: "#5D7B6F" },
    { name: "Orange", hex: "#B56B45" },
    { name: "Purple", hex: "#7B5EA7" },
];

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
                    <IconButton icon="chevron-up" size={18} onPress={() => adjustHour(1)} />
                    <Text variant="titleLarge" style={styles.timeValue}>{hour.toString().padStart(2, "0")}</Text>
                    <IconButton icon="chevron-down" size={18} onPress={() => adjustHour(-1)} />
                </View>
                <Text variant="titleLarge" style={{ marginHorizontal: 2 }}>:</Text>
                <View style={styles.timeUnit}>
                    <IconButton icon="chevron-up" size={18} onPress={() => adjustMinute(15)} />
                    <Text variant="titleLarge" style={styles.timeValue}>{minute.toString().padStart(2, "0")}</Text>
                    <IconButton icon="chevron-down" size={18} onPress={() => adjustMinute(-15)} />
                </View>
                <Text variant="bodyMedium" style={{ marginLeft: 6, opacity: 0.6 }}>{hour >= 12 ? "PM" : "AM"}</Text>
            </View>
        </View>
    );
}

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
    const [color, setColor] = useState("");

    // Initialize form
    React.useEffect(() => {
        if (block) {
            setCode(block.code);
            setName(block.name);
            setInstructor(block.instructor || "");
            setNote(block.note || "");
            setDay(block.day);
            setStartTime(block.startTime);
            setEndTime(block.endTime);
            setColor(block.color);
        }
        setIsEditing(false);
    }, [block]);

    if (!block) return null;

    const handleSave = () => {
        updateBlock(block.id, { code, name, instructor: instructor || undefined, note: note || undefined, day, startTime, endTime, color });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setIsEditing(false);
        onDismiss();
    };

    const handleDelete = () => {
        Alert.alert(
            "Delete Course",
            `Delete ${block.code}?`,
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
                contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}
            >
                {/* Header Strip */}
                <View style={[styles.headerStrip, { backgroundColor: block.color }]} />

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={{ flex: 1 }}>
                            {isEditing ? (
                                <View style={{ gap: 8 }}>
                                    <TextInput label="Code" value={code} onChangeText={setCode} mode="outlined" dense style={styles.input} />
                                    <TextInput label="Name" value={name} onChangeText={setName} mode="outlined" dense style={styles.input} />
                                </View>
                            ) : (
                                <>
                                    <Text variant="headlineMedium" style={{ fontWeight: "bold", fontFamily: "serif" }}>{block.code}</Text>
                                    <Text variant="bodyLarge" style={{ color: theme.colors.secondary, marginTop: 4 }}>{block.name}</Text>
                                </>
                            )}
                        </View>
                        <IconButton
                            icon={isEditing ? "close" : "pencil"}
                            mode={isEditing ? "contained" : "default"}
                            onPress={() => setIsEditing(!isEditing)}
                            style={{ marginLeft: 8 }}
                        />
                    </View>

                    <Divider style={{ marginVertical: 16 }} />

                    {/* Content */}
                    {isEditing ? (
                        <View style={styles.editForm}>
                            <View style={styles.section}>
                                <Text variant="labelMedium" style={{ marginBottom: 8, color: theme.colors.primary }}>Day & Time</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                                    {DAYS.map((d) => (
                                        <TouchableOpacity
                                            key={d}
                                            onPress={() => { setDay(d); Haptics.selectionAsync(); }}
                                            style={[
                                                styles.dayChip,
                                                { backgroundColor: day === d ? theme.colors.primary : theme.colors.surfaceVariant }
                                            ]}
                                        >
                                            <Text style={{ color: day === d ? theme.colors.onPrimary : theme.colors.onSurfaceVariant }}>{d.substring(0, 3)}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                                <View style={styles.timeRow}>
                                    <TimePicker label="Start" value={startTime} onChange={setStartTime} theme={theme} />
                                    <TimePicker label="End" value={endTime} onChange={setEndTime} theme={theme} />
                                </View>
                            </View>

                            <View style={styles.section}>
                                <Text variant="labelMedium" style={{ marginBottom: 8, color: theme.colors.primary }}>Color</Text>
                                <View style={styles.colorGrid}>
                                    {COLORS.map(c => (
                                        <TouchableOpacity
                                            key={c.hex}
                                            onPress={() => { setColor(c.hex); Haptics.selectionAsync(); }}
                                            style={[
                                                styles.colorDot,
                                                { backgroundColor: c.hex, borderColor: color === c.hex ? theme.colors.onSurface : "transparent" }
                                            ]}
                                        />
                                    ))}
                                </View>
                            </View>

                            <View style={styles.section}>
                                <TextInput
                                    label="Instructor"
                                    value={instructor}
                                    onChangeText={setInstructor}
                                    mode="outlined"
                                    dense
                                    style={styles.input}
                                />
                                <TextInput
                                    label="Notes"
                                    value={note}
                                    onChangeText={setNote}
                                    mode="outlined"
                                    dense
                                    multiline
                                    style={[styles.input, { marginTop: 8 }]}
                                />
                            </View>

                            <Button mode="contained" onPress={handleSave} style={{ marginTop: 16 }}>
                                Save Changes
                            </Button>
                        </View>
                    ) : (
                        <View style={styles.detailsList}>
                            {/* Detail Rows */}
                            <DetailRow icon="calendar-clock" label="Schedule" value={`${block.day}, ${block.startTime} - ${block.endTime}`} theme={theme} />

                            {block.instructor && (
                                <DetailRow icon="account-tie" label="Instructor" value={block.instructor} theme={theme} />
                            )}

                            {block.creditUnits && (
                                <DetailRow icon="school" label="Credits" value={`${block.creditUnits} Units`} theme={theme} />
                            )}

                            {block.note && (
                                <View style={[styles.noteBox, { backgroundColor: hexToRgba(block.color, 0.1) }]}>
                                    <MaterialCommunityIcons name="note-text-outline" size={20} color={block.color} style={{ marginRight: 8, marginTop: 2 }} />
                                    <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>{block.note}</Text>
                                </View>
                            )}

                            {/* Action Buttons - Fixed Design */}
                            <View style={styles.actionButtonsContainer}>
                                <Button
                                    mode="outlined"
                                    onPress={handleDelete}
                                    style={styles.actionButton}
                                    textColor={theme.colors.error}
                                    contentStyle={{ height: 48 }}
                                >
                                    Delete
                                </Button>
                                <Button
                                    mode="contained"
                                    onPress={() => setIsEditing(true)}
                                    style={[styles.actionButton, { backgroundColor: '#057b06' }]}
                                    contentStyle={{ height: 48 }}
                                >
                                    Edit
                                </Button>
                            </View>
                        </View>
                    )}
                </ScrollView>
            </Modal>
        </Portal>
    );
}

function DetailRow({ icon, label, value, theme }: { icon: any, label: string, value: string, theme: any }) {
    return (
        <View style={styles.detailRow}>
            <View style={[styles.iconBox, { backgroundColor: theme.colors.surfaceVariant }]}>
                <MaterialCommunityIcons name={icon} size={22} color={theme.colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
                <Text variant="labelMedium" style={{ color: theme.colors.secondary }}>{label}</Text>
                <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>{value}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    modal: {
        margin: 20,
        borderRadius: 24,
        overflow: "hidden",
        maxHeight: "85%",
        padding: 0,
        paddingBottom: 24,
    },
    headerStrip: {
        height: 6,
        width: "100%",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        paddingHorizontal: 24,
        marginTop: 24,
    },
    detailsList: {
        paddingHorizontal: 24,
        gap: 20,
    },
    detailRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    noteBox: {
        flexDirection: "row",
        padding: 16,
        borderRadius: 12,
        marginTop: 8,
    },
    actionButtonsContainer: {
        flexDirection: "row",
        gap: 12,
        marginTop: 24,
    },
    actionButton: {
        flex: 1,
        borderRadius: 12,
    },
    editForm: {
        paddingHorizontal: 24,
        gap: 20,
    },
    section: {
        gap: 8,
    },
    input: {
        backgroundColor: "transparent",
    },
    dayChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
    },
    colorGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    colorDot: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 2,
    },
    timeRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 12,
    },
    timePickerContainer: {
        flex: 1,
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.03)",
        padding: 12,
        borderRadius: 12,
    },
    timePicker: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    timeUnit: {
        alignItems: "center",
    },
    timeValue: {
        fontWeight: "bold",
        fontSize: 18,
    },
});
