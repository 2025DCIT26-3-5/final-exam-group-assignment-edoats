import React, { useState, useRef } from "react";
import { View, StyleSheet, ScrollView, Dimensions } from "react-native";
import { Modal, Portal, Text, Button, useTheme, SegmentedButtons, ActivityIndicator, TextInput, Divider } from "react-native-paper";
import { useScheduleStore, CourseBlock } from "../store/useScheduleStore";
import { useUserStore } from "../store/useUserStore";
import ViewShot from "react-native-view-shot";
import * as Sharing from "expo-sharing";
// @ts-ignore
import * as FileSystem from "expo-file-system/legacy";
import * as Haptics from "expo-haptics";

const HOURS = Array.from({ length: 12 }, (_, i) => i + 7);
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface Resolution {
    label: string;
    width: number;
    height: number;
    value: string;
}

const RESOLUTIONS: Resolution[] = [
    { label: "Story", value: "story", width: 1080, height: 1920 },
    { label: "Square", value: "square", width: 1080, height: 1080 },
    { label: "Desktop", value: "desktop", width: 1920, height: 1080 },
    { label: "4K", value: "4k", width: 3840, height: 2160 },
];

interface ExportModalProps {
    visible: boolean;
    onDismiss: () => void;
}

export function ExportModal({ visible, onDismiss }: ExportModalProps) {
    const theme = useTheme();
    const { blocks } = useScheduleStore();
    const { name } = useUserStore();
    const viewShotRef = useRef<ViewShot>(null);
    const [selectedRes, setSelectedRes] = useState("story");
    const [isExporting, setIsExporting] = useState(false);
    const [exportTitle, setExportTitle] = useState(`${name}'s Schedule`);
    const [exportTheme, setExportTheme] = useState<"light" | "dark">("dark");

    const currentRes = RESOLUTIONS.find((r) => r.value === selectedRes) || RESOLUTIONS[0];

    // Export Theme Colors
    const isDarkExport = exportTheme === "dark";
    const exportColors = {
        background: isDarkExport ? "#121212" : "#FFFFFF",
        textPrimary: isDarkExport ? "#FFFFFF" : "#000000",
        textSecondary: isDarkExport ? "#888888" : "#666666",
        gridLine: isDarkExport ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
        brand: "#057b06",
        blockText: "#FFFFFF", // Keep block text white as blocks are colored
        blockSubtext: "rgba(255,255,255,0.8)",
    };

    // Calculate scale for preview
    const screenWidth = Dimensions.get("window").width - 80;
    const previewScale = screenWidth / currentRes.width;
    const previewHeight = currentRes.height * previewScale;

    const hexToRgba = (hex: string, alpha: number) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    // Grid dimensions for export
    const ROW_HEIGHT = currentRes.height / 14;
    const COL_WIDTH = (currentRes.width - 80) / 6;
    const TIME_COL_WIDTH = 80;

    const getBlockStyle = (block: CourseBlock) => {
        const startHour = parseInt(block.startTime.split(":")[0]);
        const startMin = parseInt(block.startTime.split(":")[1]);
        const endHour = parseInt(block.endTime.split(":")[0]);
        const endMin = parseInt(block.endTime.split(":")[1]);

        const startOffset = (startHour - 7) * ROW_HEIGHT + (startMin / 60) * ROW_HEIGHT + 60;
        const durationHours = (endHour + endMin / 60) - (startHour + startMin / 60);
        const height = durationHours * ROW_HEIGHT;

        const dayIndex = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].indexOf(block.day);
        if (dayIndex === -1) return null;

        return {
            position: "absolute" as const,
            top: startOffset,
            left: TIME_COL_WIDTH + dayIndex * COL_WIDTH + 2,
            width: COL_WIDTH - 4,
            height: height - 2,
            backgroundColor: hexToRgba(block.color, 0.3),
            borderLeftWidth: 4,
            borderLeftColor: block.color,
            borderRadius: 4,
            padding: 8,
        };
    };

    const handleExport = async () => {
        if (!viewShotRef.current) return;

        setIsExporting(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        try {
            const uri = await viewShotRef.current.capture?.();
            if (uri) {
                const fileName = `schedule_${selectedRes}_${Date.now()}.png`;
                const newUri = FileSystem.cacheDirectory + fileName;
                await FileSystem.copyAsync({ from: uri, to: newUri });
                await Sharing.shareAsync(newUri, { mimeType: "image/png" });
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
        } catch (error) {
            console.error("Export failed:", error);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <Portal>
            <Modal
                visible={visible}
                onDismiss={onDismiss}
                contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}
            >
                <Text variant="headlineSmall" style={styles.title}>Export Schedule</Text>

                <View style={styles.controlsContainer}>
                    <TextInput
                        label="Title"
                        value={exportTitle}
                        onChangeText={setExportTitle}
                        mode="outlined"
                        dense
                        style={{ marginBottom: 12, backgroundColor: theme.colors.surface }}
                    />

                    <SegmentedButtons
                        value={exportTheme}
                        onValueChange={(val) => setExportTheme(val as "light" | "dark")}
                        buttons={[
                            { value: "light", label: "Light", icon: "white-balance-sunny" },
                            { value: "dark", label: "Dark", icon: "weather-night" },
                        ]}
                        style={{ marginBottom: 12 }}
                    />
                </View>

                {/* Resolution Picker */}
                <SegmentedButtons
                    value={selectedRes}
                    onValueChange={setSelectedRes}
                    buttons={RESOLUTIONS.map((r) => ({
                        value: r.value,
                        label: r.label,
                    }))}
                    style={styles.segmented}
                />

                <Text variant="bodySmall" style={[styles.resInfo, { color: theme.colors.secondary }]}>
                    {currentRes.width} × {currentRes.height}px
                </Text>

                {/* Preview */}
                <ScrollView
                    style={[styles.previewContainer, { height: Math.min(previewHeight, 400) }]}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={[styles.previewWrapper, { transform: [{ scale: previewScale }], width: currentRes.width, height: currentRes.height }]}>
                        <ViewShot
                            ref={viewShotRef}
                            options={{ format: "png", quality: 1, width: currentRes.width, height: currentRes.height }}
                            style={{ width: currentRes.width, height: currentRes.height, backgroundColor: exportColors.background }}
                        >
                            {/* Export Content */}
                            <View style={{ flex: 1, padding: 40 }}>
                                {/* Header */}
                                <Text style={{ color: exportColors.brand, fontSize: 48, fontWeight: "bold", marginBottom: 8, fontFamily: 'serif' }}>
                                    {exportTitle}
                                </Text>
                                <Text style={{ color: exportColors.textSecondary, fontSize: 24, marginBottom: 32 }}>
                                    {blocks.length} Classes • {blocks.reduce((acc, b) => acc + (b.creditUnits || 0), 0)} Units
                                </Text>

                                {/* Days Header */}
                                <View style={{ flexDirection: "row", marginBottom: 16 }}>
                                    <View style={{ width: TIME_COL_WIDTH }} />
                                    {DAYS.map((day) => (
                                        <View key={day} style={{ width: COL_WIDTH, alignItems: "center" }}>
                                            <Text style={{ color: exportColors.textSecondary, fontSize: 20, fontWeight: "500" }}>{day}</Text>
                                        </View>
                                    ))}
                                </View>

                                {/* Grid */}
                                <View style={{ flex: 1, position: "relative" }}>
                                    {/* Time labels and lines */}
                                    {HOURS.map((hour, i) => (
                                        <View key={hour} style={{ position: "absolute", top: i * ROW_HEIGHT, left: 0, right: 0, flexDirection: "row" }}>
                                            <View style={{ width: TIME_COL_WIDTH, alignItems: "flex-end", paddingRight: 16 }}>
                                                <Text style={{ color: exportColors.textSecondary, fontSize: 16 }}>
                                                    {hour > 12 ? `${hour - 12}PM` : hour === 12 ? "12PM" : `${hour}AM`}
                                                </Text>
                                            </View>
                                            <View style={{ flex: 1, height: 1, backgroundColor: exportColors.gridLine, marginTop: 10 }} />
                                        </View>
                                    ))}

                                    {/* Blocks */}
                                    {blocks.map((block) => {
                                        const style = getBlockStyle(block);
                                        if (!style) return null;
                                        return (
                                            <View key={block.id} style={style}>
                                                <Text style={{ color: exportColors.blockText, fontWeight: "bold", fontSize: 18, marginBottom: 4 }} numberOfLines={1}>
                                                    {block.code}
                                                </Text>
                                                <Text style={{ color: exportColors.blockSubtext, fontSize: 14 }} numberOfLines={2}>
                                                    {block.name}
                                                </Text>
                                                {block.instructor && (
                                                    <Text style={{ color: exportColors.blockSubtext, fontSize: 12, marginTop: 2, fontStyle: 'italic' }} numberOfLines={1}>
                                                        {block.instructor}
                                                    </Text>
                                                )}
                                            </View>
                                        );
                                    })}
                                </View>
                            </View>
                        </ViewShot>
                    </View>
                </ScrollView>

                {/* Actions */}
                <View style={styles.actions}>
                    <Button mode="outlined" onPress={onDismiss} style={{ flex: 1 }}>
                        Cancel
                    </Button>
                    <Button
                        mode="contained"
                        onPress={handleExport}
                        style={{ flex: 1, marginLeft: 12 }}
                        disabled={isExporting}
                        icon={isExporting ? undefined : "download"}
                    >
                        {isExporting ? <ActivityIndicator size="small" color="#fff" /> : "Export"}
                    </Button>
                </View>
            </Modal>
        </Portal>
    );
}

const styles = StyleSheet.create({
    modal: {
        margin: 20,
        borderRadius: 12,
        padding: 20,
        maxHeight: "90%",
    },
    title: {
        fontWeight: "bold",
        marginBottom: 16,
        textAlign: "center",
    },
    segmented: {
        marginBottom: 8,
    },
    resInfo: {
        textAlign: "center",
        marginBottom: 16,
    },
    previewContainer: {
        borderRadius: 8,
        overflow: "hidden",
        backgroundColor: "#000",
    },
    previewWrapper: {
        transformOrigin: "top left",
    },
    actions: {
        flexDirection: "row",
        marginTop: 16,
    },
    controlsContainer: {
        marginBottom: 8,
    },
});
