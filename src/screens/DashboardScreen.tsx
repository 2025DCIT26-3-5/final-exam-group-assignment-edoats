import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, Animated } from "react-native";
import { Text, useTheme, Card } from "react-native-paper";
import { useScheduleStore, CourseBlock } from "../store/useScheduleStore";
import { useUserStore } from "../store/useUserStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlockDetailModal } from "../components/BlockDetailModal";

const HOURS = Array.from({ length: 12 }, (_, i) => i + 7); // 7 AM to 6 PM
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const FULL_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const ROW_HEIGHT = 70;
const COL_WIDTH = 90;
const TIME_COL_WIDTH = 50;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ScheduleBlock = React.memo(({ block, style, onPress }: { block: CourseBlock, style: any, onPress: () => void }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // Create a semi-transparent version of the block color
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return (
    <Animated.View style={[style, { opacity: fadeAnim }]}>
      <TouchableOpacity
        style={[
          styles.blockContainer,
          {
            backgroundColor: hexToRgba(block.color, 0.25),
            borderLeftColor: block.color,
          }
        ]}
        activeOpacity={0.7}
        onPress={onPress}
      >
        <Text
          numberOfLines={1}
          style={styles.blockCode}
        >
          {block.code}
        </Text>
        <Text
          numberOfLines={1}
          style={styles.blockName}
        >
          {block.instructor || block.name}
        </Text>
        {block.note && (
          <Text numberOfLines={1} style={styles.blockNote}>
            {block.note}
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
});
ScheduleBlock.displayName = "ScheduleBlock";

function UpNextWidget({ blocks }: { blocks: CourseBlock[] }) {
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
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const currentDay = FULL_DAYS[now.getDay()];
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const todayBlocks = blocks
    .filter((b) => b.day === currentDay)
    .sort((a, b) => {
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
              <Text variant="bodySmall" style={{ color: theme.colors.onPrimaryContainer }}>{currentBlock.startTime} - {currentBlock.endTime} • {currentBlock.name}</Text>
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
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>Starts at {nextBlock.startTime}</Text>
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
  const { blocks } = useScheduleStore();
  const { name } = useUserStore();
  const headerFadeAnim = useRef(new Animated.Value(0)).current;
  const headerSlideAnim = useRef(new Animated.Value(20)).current;

  // Modal state
  const [selectedBlock, setSelectedBlock] = useState<CourseBlock | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const openBlockDetail = (block: CourseBlock) => {
    setSelectedBlock(block);
    setModalVisible(true);
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerFadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(headerSlideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
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

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background, paddingTop: insets.top }]}>
      <Animated.View style={[styles.header, { opacity: headerFadeAnim, transform: [{ translateY: headerSlideAnim }] }]}>
        <Text variant="headlineSmall" style={{ fontFamily: "serif", color: theme.colors.primary }}>
          {name}&apos;s Schedule
        </Text>
        <Text variant="bodySmall" style={{ color: theme.colors.secondary }}>
          {blocks.length} Classes Enrolled
        </Text>
      </Animated.View>

      <UpNextWidget blocks={blocks} />

      <View style={styles.scheduleContainer}>
        {/* Horizontally and Vertically Scrollable Grid */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            {/* Days Header */}
            <View style={styles.daysHeader}>
              <View style={{ width: TIME_COL_WIDTH }} />
              {DAYS.map((day) => (
                <View key={day} style={styles.dayHeaderCell}>
                  <Text style={[styles.dayHeaderText, { color: theme.colors.onSurfaceVariant }]}>{day}</Text>
                </View>
              ))}
            </View>

            {/* Vertically Scrollable Grid */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              <View style={styles.gridContainer}>
                {/* Time Column */}
                <View style={styles.timeColumn}>
                  {HOURS.map((hour) => (
                    <View key={hour} style={styles.timeCell}>
                      <Text style={[styles.timeText, { color: theme.colors.onSurfaceVariant }]}>
                        {hour > 12 ? `${hour - 12}PM` : hour === 12 ? '12PM' : `${hour}AM`}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Grid with Blocks */}
                <View style={styles.gridContent}>
                  {/* Horizontal Grid Lines */}
                  {HOURS.map((h, i) => (
                    <View
                      key={`hline-${h}`}
                      style={[
                        styles.horizontalLine,
                        {
                          top: i * ROW_HEIGHT,
                          backgroundColor: theme.colors.outline,
                        }
                      ]}
                    />
                  ))}

                  {/* Vertical Grid Lines */}
                  {DAYS.map((d, i) => (
                    <View
                      key={`vline-${d}`}
                      style={[
                        styles.verticalLine,
                        {
                          left: i * COL_WIDTH,
                          backgroundColor: theme.colors.outline,
                        }
                      ]}
                    />
                  ))}

                  {/* Course Blocks */}
                  {blocks.map((block) => {
                    const style = getBlockStyle(block);
                    if (!style) return null;
                    return (
                      <ScheduleBlock
                        key={block.id}
                        block={block}
                        style={style}
                        onPress={() => openBlockDetail(block)}
                      />
                    );
                  })}
                </View>
              </View>
            </ScrollView>
          </View>
        </ScrollView>
      </View>

      {/* Block Detail Modal */}
      <BlockDetailModal
        visible={modalVisible}
        block={selectedBlock}
        onDismiss={() => setModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  widgetContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  widgetCard: {
    borderRadius: 8,
  },
  scheduleContainer: {
    flex: 1,
  },
  daysHeader: {
    flexDirection: 'row',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  dayHeaderCell: {
    width: COL_WIDTH,
    alignItems: 'center',
  },
  dayHeaderText: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.7,
  },
  gridContainer: {
    flexDirection: 'row',
  },
  timeColumn: {
    width: TIME_COL_WIDTH,
  },
  timeCell: {
    height: ROW_HEIGHT,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingRight: 8,
    paddingTop: 2,
  },
  timeText: {
    fontSize: 11,
    fontWeight: '500',
    opacity: 0.6,
  },
  gridContent: {
    width: DAYS.length * COL_WIDTH,
    height: HOURS.length * ROW_HEIGHT,
  },
  horizontalLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    opacity: 0.15,
  },
  verticalLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    opacity: 0.15,
  },
  blockContainer: {
    flex: 1,
    borderLeftWidth: 3,
    borderRadius: 4,
    padding: 6,
    overflow: 'hidden',
  },
  blockCode: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
    marginBottom: 2,
  },
  blockName: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
  },
  blockNote: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 9,
    marginTop: 2,
    fontStyle: 'italic',
  },
});