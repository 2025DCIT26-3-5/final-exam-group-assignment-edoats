import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Text, useTheme, Card } from "react-native-paper";
import { useScheduleStore, CourseBlock } from "../store/useScheduleStore";
import { useUserStore } from "../store/useUserStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 7 AM to 8 PM
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const FULL_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const ROW_HEIGHT = 60;
const COL_WIDTH = 100;
const TIME_COL_WIDTH = 60;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ScheduleBlock = React.memo(({ block, style }: { block: CourseBlock, style: any }) => (
  <Animated.View entering={FadeIn.duration(500)} style={style}>
    <TouchableOpacity style={{ flex: 1 }}>
        <Text numberOfLines={1} variant="labelSmall" style={{ color: "#FFF", fontWeight: "bold" }}>
        {block.code}
        </Text>
        <Text numberOfLines={1} variant="labelSmall" style={{ color: "rgba(255,255,255,0.8)", fontSize: 8 }}>
        {block.name}
        </Text>
    </TouchableOpacity>
  </Animated.View>
));
ScheduleBlock.displayName = "ScheduleBlock";

function UpNextWidget({ blocks }: { blocks: CourseBlock[] }) {
  const theme = useTheme();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

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
    <Animated.View entering={FadeInDown.duration(600).delay(300)} style={styles.widgetContainer}>
      {currentBlock && (
        <Card style={[styles.widgetCard, { backgroundColor: theme.colors.primaryContainer }]}>
            <Card.Content style={{flexDirection:'row', alignItems:'center'}}>
                <MaterialCommunityIcons name="clock-check-outline" size={24} color={theme.colors.onPrimaryContainer} style={{marginRight:10}} />
                <View>
                    <Text variant="labelSmall" style={{color: theme.colors.onPrimaryContainer, fontWeight:'bold', textTransform:'uppercase'}}>Happening Now</Text>
                    <Text variant="titleMedium" style={{color: theme.colors.onPrimaryContainer, fontWeight:'bold'}}>{currentBlock.code}</Text>
                    <Text variant="bodySmall" style={{color: theme.colors.onPrimaryContainer}}>{currentBlock.startTime} - {currentBlock.endTime} • {currentBlock.name}</Text>
                </View>
            </Card.Content>
        </Card>
      )}
      
      {nextBlock && (
         <Card style={[styles.widgetCard, { backgroundColor: theme.colors.surfaceVariant, marginTop: currentBlock ? 8 : 0 }]}>
            <Card.Content style={{flexDirection:'row', alignItems:'center'}}>
                <MaterialCommunityIcons name="clock-start" size={24} color={theme.colors.onSurfaceVariant} style={{marginRight:10}} />
                <View>
                    <Text variant="labelSmall" style={{color: theme.colors.onSurfaceVariant, fontWeight:'bold', textTransform:'uppercase'}}>Up Next</Text>
                    <Text variant="titleMedium" style={{color: theme.colors.onSurfaceVariant, fontWeight:'bold'}}>{nextBlock.code}</Text>
                    <Text variant="bodySmall" style={{color: theme.colors.onSurfaceVariant}}>Starts at {nextBlock.startTime}</Text>
                </View>
            </Card.Content>
        </Card>
      )}
    </Animated.View>
  );
}

export function DashboardScreen() {
  const theme = useTheme();
  const { blocks } = useScheduleStore();
  const { name } = useUserStore();

  const getBlockStyle = (block: CourseBlock) => {
    const startHour = parseInt(block.startTime.split(":")[0]);
    const startMin = parseInt(block.startTime.split(":")[1]);
    const endHour = parseInt(block.endTime.split(":")[0]);
    const endMin = parseInt(block.endTime.split(":")[1]);

    const startOffset = (startHour - 7) * ROW_HEIGHT + (startMin / 60) * ROW_HEIGHT;
    const durationHours = (endHour + endMin / 60) - (startHour + startMin / 60);
    const height = durationHours * ROW_HEIGHT;

    // Map day string to index
    const dayIndex = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].indexOf(block.day);
    
    // If day not found (e.g. Sunday), hide it or put it somewhere else
    if (dayIndex === -1) return null;

    return {
      position: "absolute" as const,
      top: startOffset,
      left: TIME_COL_WIDTH + (dayIndex * COL_WIDTH),
      width: COL_WIDTH - 4, // Gutter
      height: height - 2, // Gutter
      backgroundColor: block.color,
      borderRadius: 4,
      padding: 4,
      zIndex: 10,
    };
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
        <Text variant="headlineSmall" style={{ fontFamily: "serif", color: theme.colors.primary }}>
          {name}&apos;s Schedule
        </Text>
        <Text variant="bodySmall" style={{ color: theme.colors.secondary }}>
            {blocks.length} Classes Enrolled
        </Text>
      </Animated.View>

      <UpNextWidget blocks={blocks} />

      <ScrollView stickyHeaderIndices={[0]} horizontal>
        <View>
          {/* Header Row (Days) */}
          <View style={[styles.row, { backgroundColor: theme.colors.surface }]}>
            <View style={{ width: TIME_COL_WIDTH, height: 40, borderRightWidth: 1, borderColor: theme.colors.outline }} />
            {DAYS.map((day) => (
              <View key={day} style={[styles.headerCell, { borderColor: theme.colors.outline }]}>
                <Text variant="labelMedium" style={{ fontWeight: "bold" }}>{day}</Text>
              </View>
            ))}
          </View>

          {/* Time Grid */}
          <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
            <View style={{ flexDirection: "row" }}>
              {/* Time Column */}
              <View style={{ width: TIME_COL_WIDTH }}>
                {HOURS.map((hour) => (
                  <View key={hour} style={[styles.timeCell, { height: ROW_HEIGHT, borderColor: theme.colors.outline }]}>
                    <Text variant="labelSmall">{hour}:00</Text>
                  </View>
                ))}
              </View>

              {/* Grid Content */}
              <View style={{ width: DAYS.length * COL_WIDTH, height: HOURS.length * ROW_HEIGHT }}>
                 {/* Horizontal Grid Lines */}
                 {HOURS.map((h, i) => (
                    <View key={`line-${h}`} style={{ 
                        position: 'absolute', 
                        top: i * ROW_HEIGHT, 
                        width: '100%', 
                        height: 1, 
                        backgroundColor: theme.colors.outline, 
                        opacity: 0.2 
                    }} />
                 ))}
                 
                 {/* Vertical Grid Lines */}
                 {DAYS.map((d, i) => (
                    <View key={`vline-${d}`} style={{ 
                        position: 'absolute', 
                        left: i * COL_WIDTH, 
                        height: '100%', 
                        width: 1, 
                        backgroundColor: theme.colors.outline, 
                        opacity: 0.2 
                    }} />
                 ))}

                {/* Blocks */}
                {blocks.map((block) => {
                    const style = getBlockStyle(block);
                    if (!style) return null;
                    return (
                        <ScheduleBlock key={block.id} block={block} style={style} />
                    );
                })}
              </View>
            </View>
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: "#333" },
  row: { flexDirection: "row" },
  headerCell: {
    width: COL_WIDTH,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderBottomWidth: 1,
  },
  timeCell: {
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 4,
    borderRightWidth: 1,
    borderBottomWidth: 1,
  },
  widgetContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  widgetCard: {
    borderRadius: 8,
  }
});