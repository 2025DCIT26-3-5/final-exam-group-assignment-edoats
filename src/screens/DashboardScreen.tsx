import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, Animated, PanResponder, LayoutChangeEvent } from "react-native";
import { Text, useTheme, Card } from "react-native-paper";
import { useScheduleStore, CourseBlock } from "../store/useScheduleStore";
import { useThemeStore, formatTime, formatTimeRange } from "../store/useThemeStore";
import { useUserStore } from "../store/useUserStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlockDetailModal } from "../components/BlockDetailModal";
import * as Haptics from "expo-haptics";

const HOURS = Array.from({ length: 12 }, (_, i) => i + 7); // 7 AM to 6 PM
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const FULL_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const ROW_HEIGHT = 70;
const COL_WIDTH = 90;
const TIME_COL_WIDTH = 50;

// Helper to convert hex to rgba
const hexToRgba = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Draggable Block Component
const DraggableBlock = React.memo(({
  block,
  style,
  onPress,
  onDragStart,
  onDragEnd
}: {
  block: CourseBlock,
  style: any,
  onPress: () => void,
  onDragStart: (id: string) => void,
  onDragEnd: (id: string, gesture: any) => void
}) => {
  const pan = useRef(new Animated.ValueXY()).current;
  const isDragging = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false, // Let normal touch/scroll work initially
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only start drag if long press logic triggered or explicit movement after long press
        // BUT to simplify: we use long press to activate "drag mode" usually.
        // Here, let's try immediate drag if movement > threshold? 
        // Better: Long press to pick up.
        return isDragging.current;
      },
      onPanResponderGrant: () => {
        pan.setOffset({
          x: (pan.x as any)._value,
          y: (pan.y as any)._value
        });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (_, gestureState) => {
        isDragging.current = false;
        pan.flattenOffset();
        onDragEnd(block.id, gestureState);
        Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
      }
    })
  ).current;

  // Since we want LONG PRESS to pick up, we wrap the Touchable
  // We can't easily mix PanResponder with ScrollView unless we disable ScrollView.
  // Strategy: 
  // 1. LongPress on Touchable triggers "Drag Mode" in parent.
  // 2. Parent disables ScrollView.
  // 3. This block becomes the responder.

  // Actually, standard pattern is:
  // Render a separate "Dragging Layer" on top for the active block.
  // The items in the grid are just static Touchables with onLongPress.

  return (
    <TouchableOpacity
      style={[styles.blockContainer, style, { backgroundColor: hexToRgba(block.color, 0.25), borderLeftColor: block.color }]}
      activeOpacity={0.7}
      onPress={onPress}
      onLongPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        onDragStart(block.id);
      }}
      delayLongPress={300}
    >
      <Text numberOfLines={1} style={styles.blockCode}>{block.code}</Text>
      <Text numberOfLines={1} style={styles.blockName}>{block.instructor || block.name}</Text>
      {block.note && <Text numberOfLines={1} style={styles.blockNote}>{block.note}</Text>}
    </TouchableOpacity>
  );
});
DraggableBlock.displayName = "DraggableBlock";

// Ghost Block Component
const GhostBlock = ({ style, valid }: { style: any, valid: boolean }) => (
  <View style={[
    style,
    styles.ghostBlock,
    {
      backgroundColor: valid ? 'rgba(5, 123, 6, 0.1)' : 'rgba(176, 0, 32, 0.1)',
      borderColor: valid ? '#057b06' : '#B00020',
    }
  ]}>
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <MaterialCommunityIcons
        name={valid ? "check" : "close"}
        size={24}
        color={valid ? '#057b06' : '#B00020'}
      />
    </View>
  </View>
);

function UpNextWidget({ blocks, use24HourFormat }: { blocks: CourseBlock[], use24HourFormat: boolean }) {
  const theme = useTheme();
  const [now, setNow] = useState(new Date());
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, delay: 300, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, delay: 300, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const currentDay = FULL_DAYS[now.getDay()];
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const todayBlocks = blocks.filter((b) => b.day === currentDay).sort((a, b) => {
    const [h1, m1] = a.startTime.split(":").map(Number);
    const [h2, m2] = b.startTime.split(":").map(Number);
    return h1 * 60 + m1 - (h2 * 60 + m2);
  });

  const currentBlock = todayBlocks.find((b) => {
    const [h1, m1] = b.startTime.split(":").map(Number);
    const [h2, m2] = b.endTime.split(":").map(Number);
    const start = h1 * 60 + m1;
    const end = h2 * 60 + m2;
    return currentMinutes >= start && currentMinutes < end;
  });

  const nextBlock = todayBlocks.find((b) => {
    const [h1, m1] = b.startTime.split(":").map(Number);
    const start = h1 * 60 + m1;
    return start > currentMinutes;
  });

  if (!currentBlock && !nextBlock) return null;

  return (
    <Animated.View style={[styles.widgetContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      {currentBlock && (
        <Card style={[styles.widgetCard, { backgroundColor: theme.colors.primaryContainer }]}>
          <Card.Content style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons name="clock-check-outline" size={24} color={theme.colors.onPrimaryContainer} style={{ marginRight: 10 }} />
            <View>
              <Text variant="labelSmall" style={{ color: theme.colors.onPrimaryContainer, fontWeight: 'bold', textTransform: 'uppercase' }}>Happening Now</Text>
              <Text variant="titleMedium" style={{ color: theme.colors.onPrimaryContainer, fontWeight: 'bold' }}>{currentBlock.code}</Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onPrimaryContainer }}>{formatTimeRange(currentBlock.startTime, currentBlock.endTime, use24HourFormat)} • {currentBlock.name}</Text>
            </View>
          </Card.Content>
        </Card>
      )}
      {nextBlock && (
        <Card style={[styles.widgetCard, { backgroundColor: theme.colors.surfaceVariant, marginTop: currentBlock ? 8 : 0 }]}>
          <Card.Content style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons name="clock-start" size={24} color={theme.colors.onSurfaceVariant} style={{ marginRight: 10 }} />
            <View>
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, fontWeight: 'bold', textTransform: 'uppercase' }}>Up Next</Text>
              <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant, fontWeight: 'bold' }}>{nextBlock.code}</Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>Starts at {formatTime(nextBlock.startTime, use24HourFormat)}</Text>
            </View>
          </Card.Content>
        </Card>
      )}
    </Animated.View>
  );
}

export function DashboardScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { blocks, moveBlock } = useScheduleStore();
  const { use24HourFormat } = useThemeStore();
  const { name } = useUserStore();
  const headerFadeAnim = useRef(new Animated.Value(0)).current;
  const headerSlideAnim = useRef(new Animated.Value(20)).current;

  // Modal state
  const [selectedBlock, setSelectedBlock] = useState<CourseBlock | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Drag State
  const [draggingBlockId, setDraggingBlockId] = useState<string | null>(null);
  const [ghostStyle, setGhostStyle] = useState<any>(null);
  const pan = useRef(new Animated.ValueXY()).current;
  const gridLayout = useRef<{ x: number, y: number, width: number, height: number } | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const [scrollEnabled, setScrollEnabled] = useState(true);

  // Drag PanResponder
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !!draggingBlockId,
      onMoveShouldSetPanResponder: () => !!draggingBlockId,
      onPanResponderGrant: () => {
        pan.setOffset({
          // @ts-ignore
          x: pan.x._value,
          // @ts-ignore
          y: pan.y._value
        });
      },
      onPanResponderMove: (e, gesture) => {
        // Update pan value
        pan.setValue({ x: gesture.dx, y: gesture.dy });

        // Calculate ghost position
        if (gridLayout.current && draggingBlockId) {
          // Absolute touch position relative to grid
          // We need to account for ScrollView offset but we can't easily access current scroll offset synchronously in RN without native driver.
          // Simplified: Assume grid is visible. 
          // Re-calculation:
          // gesture.moveX/moveY are absolute. 
          // We need coords relative to the grid container

          // NOTE: Implementing precise drop geometry in raw RN without Reanimated is tricky due to scroll offset.
          // Strategy: Use moveX/moveY - gridLayout.pageX/pageY
          // But we need pageX/pageY from layout measurement.
          const rawX = gesture.moveX - (gridLayout.current.x || 0); // This assumes grid is at 0,0 relative to screen which is false
          // Getting absolute page coordinates of grid is hard without onLayout providing it (it provides relative).
          // Workaround: Use relative gestures (dx, dy) + initial block position?

          // Simpler approach:
          // 1. When drag starts, record the initial block's position.
          // 2. Add dx, dy to it.
          // 3. Round to nearest COL_WIDTH/ROW_HEIGHT.
        }
      },
      onPanResponderRelease: (e, gesture) => {
        if (!draggingBlockId) return;

        // Finalize drop
        // Logic:
        // 1. Get initial block
        const block = blocks.find(b => b.id === draggingBlockId);
        if (block) {
          const initialStyle = getBlockStyle(block);
          if (initialStyle) {
            const newLeft = initialStyle.left + gesture.dx;
            const newTop = initialStyle.top + gesture.dy;

            // Snap logic
            const dayIndex = Math.round(newLeft / COL_WIDTH);
            const timeIndex = Math.round(newTop / ROW_HEIGHT);

            // Validate bounds
            if (dayIndex >= 0 && dayIndex < 6 && timeIndex >= 0 && timeIndex < 12) {
              const newDay = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][dayIndex];
              const newStartHour = 7 + timeIndex;
              const newStartTime = `${newStartHour.toString().padStart(2, '0')}:00`;

              // Execute Move
              moveBlock(block.id, newDay, newStartTime);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } else {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            }
          }
        }

        setDraggingBlockId(null);
        setGhostStyle(null);
        setScrollEnabled(true);
        pan.setValue({ x: 0, y: 0 }); // Reset for next time (critical!)
      }
    })
  ).current;

  // Manual Ghost/Drag Logic Loop using listener since PanResponderMove is tricky with state
  useEffect(() => {
    if (draggingBlockId) {
      const id = pan.addListener(({ x, y }) => {
        const block = blocks.find(b => b.id === draggingBlockId);
        if (!block) return;
        const style = getBlockStyle(block);
        if (!style) return;

        const newLeft = style.left + x;
        const newTop = style.top + y;

        const dayIndex = Math.round(newLeft / COL_WIDTH);
        const timeIndex = Math.round(newTop / ROW_HEIGHT);

        // Clamp
        const clamperDay = Math.max(0, Math.min(5, dayIndex));
        const clampedTime = Math.max(0, Math.min(11, timeIndex));

        setGhostStyle({
          position: 'absolute',
          left: clamperDay * COL_WIDTH,
          top: clampedTime * ROW_HEIGHT,
          width: COL_WIDTH,
          height: style.height,
          zIndex: 5
        });
      });
      return () => pan.removeListener(id);
    }
  }, [draggingBlockId, blocks]);

  const openBlockDetail = (block: CourseBlock) => {
    setSelectedBlock(block);
    setModalVisible(true);
  };

  const handleDragStart = (id: string) => {
    setDraggingBlockId(id);
    setScrollEnabled(false);
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerFadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(headerSlideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, [headerFadeAnim, headerSlideAnim]);

  const getBlockStyle = (block: CourseBlock) => {
    const startHour = parseInt(block.startTime.split(":")[0]);
    const startMin = parseInt(block.startTime.split(":")[1]);
    const endHour = parseInt(block.endTime.split(":")[0]);
    const endMin = parseInt(block.endTime.split(":")[1]);

    const startOffset = (startHour - 7) * ROW_HEIGHT + (startMin / 60) * ROW_HEIGHT;
    const durationHours = (endHour + endMin / 60) - (startHour + startMin / 60);
    const height = durationHours * ROW_HEIGHT;

    const dayIndex = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].indexOf(block.day);

    if (dayIndex === -1) return null;

    return {
      position: "absolute" as const,
      top: startOffset + 1,
      left: dayIndex * COL_WIDTH + 2,
      width: COL_WIDTH - 4,
      height: height - 2,
      zIndex: 10,
    };
  };

  // Calculate total credits
  const totalCredits = blocks.reduce((sum, block) => sum + (block.creditUnits || 0), 0);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background, paddingTop: insets.top }]}>
      <Animated.View style={[styles.header, { opacity: headerFadeAnim, transform: [{ translateY: headerSlideAnim }] }]}>
        <Text variant="headlineSmall" style={{ fontFamily: "serif", color: theme.colors.primary }}>
          {name}&apos;s Schedule
        </Text>
        <Text variant="bodySmall" style={{ color: theme.colors.secondary }}>
          {blocks.length} Classes • {totalCredits} Credit Units
        </Text>
      </Animated.View>

      <UpNextWidget blocks={blocks} use24HourFormat={use24HourFormat} />

      {/* DRAG LAYER - Overlay when dragging */}
      {draggingBlockId && (
        <View style={StyleSheet.absoluteFill} zIndex={100} {...panResponder.panHandlers}>
          {/* We can put the Follower Block here if we want it to float above everything else */}
        </View>
      )}

      <View style={styles.scheduleContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} scrollEnabled={scrollEnabled}>
          <View>
            <View style={styles.daysHeader}>
              <View style={{ width: TIME_COL_WIDTH }} />
              {DAYS.map((day) => (
                <View key={day} style={styles.dayHeaderCell}>
                  <Text style={[styles.dayHeaderText, { color: theme.colors.onSurfaceVariant }]}>{day}</Text>
                </View>
              ))}
            </View>

            <ScrollView
              ref={scrollViewRef}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
              scrollEnabled={scrollEnabled}
            >
              <View style={styles.gridContainer}>
                <View style={styles.timeColumn}>
                  {HOURS.map((hour) => (
                    <View key={hour} style={styles.timeCell}>
                      <Text style={[styles.timeText, { color: theme.colors.onSurfaceVariant }]}>
                        {hour > 12 ? `${hour - 12}PM` : hour === 12 ? '12PM' : `${hour}AM`}
                      </Text>
                    </View>
                  ))}
                </View>

                <View style={styles.gridContent}>
                  {/* Grid Lines */}
                  {HOURS.map((h, i) => (
                    <View key={`hline-${h}`} style={[styles.horizontalLine, { top: i * ROW_HEIGHT, backgroundColor: theme.colors.outline }]} />
                  ))}
                  {DAYS.map((d, i) => (
                    <View key={`vline-${d}`} style={[styles.verticalLine, { left: i * COL_WIDTH, backgroundColor: theme.colors.outline }]} />
                  ))}

                  {/* Move Ghost Block & Dragged Block to here for correct context */}

                  {/* Ghost */}
                  {ghostStyle && draggingBlockId && (
                    <GhostBlock style={ghostStyle} valid={true} />
                  )}

                  {/* Blocks */}
                  {blocks.map((block) => {
                    const style = getBlockStyle(block);
                    if (!style) return null;

                    const isDragging = block.id === draggingBlockId;

                    if (isDragging) {
                      return (
                        <Animated.View
                          key={block.id}
                          style={[
                            style,
                            {
                              zIndex: 999,
                              opacity: 0.9,
                              transform: [{ translateX: pan.x }, { translateY: pan.y }, { scale: 1.05 }],
                              shadowColor: '#000',
                              shadowOffset: { width: 0, height: 10 },
                              shadowOpacity: 0.5,
                              shadowRadius: 10,
                              elevation: 10
                            }
                          ]}
                        >
                          <DraggableBlock
                            block={block}
                            style={{ flex: 1, margin: 0 }} // Fill the animated wrapper
                            onPress={() => { }}
                            onDragStart={() => { }} // Handled by LongPress on original? No, handled by wrapper?
                            onDragEnd={() => { }}
                          />
                        </Animated.View>
                      );
                    }

                    return (
                      <DraggableBlock
                        key={block.id}
                        block={block}
                        style={style}
                        onPress={() => openBlockDetail(block)}
                        onDragStart={handleDragStart}
                        onDragEnd={() => { }}
                      />
                    );
                  })}
                </View>
              </View>
            </ScrollView>
          </View>
        </ScrollView>
      </View>

      {/* Global Pan Responder overlay? No, we attached it to the Draggable/Animated View */}
      {/* Wait, we attached panResponder to a full screen view? 
          Actually, the dragging block itself should accept the pan responder handlers when active.
      */}
      {draggingBlockId && (
        <View
          style={[StyleSheet.absoluteFill, { zIndex: 99 }]}
          {...panResponder.panHandlers}
        />
      )}

      <BlockDetailModal
        visible={modalVisible}
        block={selectedBlock}
        onDismiss={() => setModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingVertical: 12 },
  widgetContainer: { paddingHorizontal: 20, paddingBottom: 12 },
  widgetCard: { borderRadius: 8 },
  scheduleContainer: { flex: 1 },
  daysHeader: { flexDirection: 'row', paddingBottom: 8, borderBottomWidth: 1, borderColor: 'rgba(0,0,0,0.1)' },
  dayHeaderCell: { width: COL_WIDTH, alignItems: 'center' },
  dayHeaderText: { fontSize: 14, fontWeight: '500', opacity: 0.7 },
  gridContainer: { flexDirection: 'row' },
  timeColumn: { width: TIME_COL_WIDTH },
  timeCell: { height: ROW_HEIGHT, justifyContent: 'flex-start', alignItems: 'flex-end', paddingRight: 8, paddingTop: 2 },
  timeText: { fontSize: 11, fontWeight: '500', opacity: 0.6 },
  gridContent: { width: DAYS.length * COL_WIDTH, height: HOURS.length * ROW_HEIGHT },
  horizontalLine: { position: 'absolute', left: 0, right: 0, height: 1, opacity: 0.15 },
  verticalLine: { position: 'absolute', top: 0, bottom: 0, width: 1, opacity: 0.15 },
  blockContainer: { flex: 1, borderLeftWidth: 3, borderRadius: 4, padding: 6, overflow: 'hidden' },
  blockCode: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 12, marginBottom: 2 },
  blockName: { color: 'rgba(255,255,255,0.8)', fontSize: 10 },
  blockNote: { color: 'rgba(255,255,255,0.6)', fontSize: 9, marginTop: 2, fontStyle: 'italic' },
  ghostBlock: { position: 'absolute', borderRadius: 4, borderStyle: 'dashed', borderWidth: 2, zIndex: 5 },
});