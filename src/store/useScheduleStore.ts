import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { scheduleWeeklyClassNotification, cancelNotification } from "../utils/notifications";
import { useSettingsStore } from "./useSettingsStore";

export interface CourseBlock {
  id: string;
  code: string; // e.g., "IT 101"
  name: string; // e.g., "Intro to Computing"
  instructor?: string;
  day: string; // "Monday", "Tuesday", etc.
  startTime: string; // HH:mm format (24h)
  endTime: string;   // HH:mm format (24h)
  color: string;
  note?: string;
  creditUnits?: number; // Credit units for the course
}

// Color palette for courses
const COURSE_COLORS = [
  "#7D5260", "#4F6D7A", "#6A8EAE", "#9A8C98", "#C9ADA7",
  "#5D7B6F", "#B56B45", "#7B5EA7", "#5C7A99", "#8B6B5B",
];

interface ScheduleState {
  blocks: CourseBlock[];
  courseColors: Record<string, string>; // Maps course code to color
  addBlock: (block: CourseBlock) => void;
  updateBlock: (id: string, updatedBlock: Partial<CourseBlock>) => void;
  deleteBlock: (id: string) => void;
  importSchedule: (blocks: CourseBlock[]) => void;
  getColorForCourse: (code: string) => string;
  moveBlock: (id: string, newDay: string, newStartTime: string) => void; // New action
}

export const useScheduleStore = create<ScheduleState>()(
  persist(
    (set, get) => ({
      blocks: [],
      courseColors: {},

      getColorForCourse: (code: string) => {
        const { courseColors } = get();
        const normalizedCode = code.trim().toUpperCase();

        // If color already exists for this course code, return it
        if (courseColors[normalizedCode]) {
          return courseColors[normalizedCode];
        }

        // Otherwise, assign a new color based on hash
        const hash = normalizedCode.split("").reduce((acc, char) => {
          return char.charCodeAt(0) + ((acc << 5) - acc);
        }, 0);
        const colorIndex = Math.abs(hash) % COURSE_COLORS.length;
        const newColor = COURSE_COLORS[colorIndex];

        // Store the color mapping
        set((state) => ({
          courseColors: { ...state.courseColors, [normalizedCode]: newColor }
        }));

        return newColor;
      },

      addBlock: (block) => {
        set((state) => ({ blocks: [...state.blocks, block] }));
        const { notificationsEnabled, reminderMinutes } = useSettingsStore.getState();
        if (notificationsEnabled) {
          scheduleWeeklyClassNotification(block.id, block.code, block.name, block.day, block.startTime, reminderMinutes);
        }
      },

      updateBlock: (id, updatedBlock) => {
        set((state) => {
          const oldBlock = state.blocks.find(b => b.id === id);
          const newBlocks = state.blocks.map((b) => (b.id === id ? { ...b, ...updatedBlock } : b));
          const newBlock = newBlocks.find(b => b.id === id);

          if (oldBlock && newBlock) {
            const { notificationsEnabled, reminderMinutes } = useSettingsStore.getState();
            cancelNotification(id);
            if (notificationsEnabled) {
              scheduleWeeklyClassNotification(id, newBlock.code, newBlock.name, newBlock.day, newBlock.startTime, reminderMinutes);
            }
          }
          return { blocks: newBlocks };
        });
      },

      deleteBlock: (id) => {
        set((state) => ({
          blocks: state.blocks.filter((b) => b.id !== id),
        }));
        cancelNotification(id);
      },

      importSchedule: (newBlocks) => set({ blocks: newBlocks }),

      moveBlock: (id: string, newDay: string, newStartTime: string) => {
        set((state) => {
          const blockToMove = state.blocks.find(b => b.id === id);
          if (!blockToMove) return state;

          // Calculate duration
          const [startH, startM] = blockToMove.startTime.split(':').map(Number);
          const [endH, endM] = blockToMove.endTime.split(':').map(Number);
          const durationMinutes = (endH * 60 + endM) - (startH * 60 + startM);

          // Calculate new end time
          const [newStartH, newStartM] = newStartTime.split(':').map(Number);
          const newEndTotalMinutes = newStartH * 60 + newStartM + durationMinutes;
          const newEndH = Math.floor(newEndTotalMinutes / 60);
          const newEndM = newEndTotalMinutes % 60;
          const newEndTime = `${newEndH.toString().padStart(2, '0')}:${newEndM.toString().padStart(2, '0')}`;

          // Check for collision
          // We define collision as any overlap on the SAME DAY
          const targetStartTotal = newStartH * 60 + newStartM;
          const targetEndTotal = newEndTotalMinutes;

          let blocks = [...state.blocks];
          const collisionBlockIndex = blocks.findIndex(b => {
            if (b.id === id || b.day !== newDay) return false;
            const [bStartH, bStartM] = b.startTime.split(':').map(Number);
            const [bEndH, bEndM] = b.endTime.split(':').map(Number);
            const bStartTotal = bStartH * 60 + bStartM;
            const bEndTotal = bEndH * 60 + bEndM;

            const overlap = (targetStartTotal < bEndTotal) && (targetEndTotal > bStartTotal);
            return overlap;
          });

          const { notificationsEnabled, reminderMinutes } = useSettingsStore.getState();

          if (collisionBlockIndex !== -1) {
            // Determine logic: Swap? or shift? User asked for smart adjust or swap.
            // Simplest robust logic: SWAP positions.
            // Move the colliding block to the ORIGINAL position of the dragged block.
            const collidingBlock = blocks[collisionBlockIndex];

            // Calculate duration of colliding block
            const [cStartH, cStartM] = collidingBlock.startTime.split(':').map(Number);
            const [cEndH, cEndM] = collidingBlock.endTime.split(':').map(Number);
            const cDuration = (cEndH * 60 + cEndM) - (cStartH * 60 + cStartM);

            // Original slot start time
            // Caution: If multiple blocks, we swap with the first collision.

            // Set colliding block to original time/day of the moved block
            const originalStartTotal = startH * 60 + startM;
            // We keep duration of colliding block same, just move start time
            const swappedEndTotal = originalStartTotal + cDuration;

            const swappedStartH = Math.floor(originalStartTotal / 60);
            const swappedStartM = originalStartTotal % 60;
            const swappedEndH = Math.floor(swappedEndTotal / 60);
            const swappedEndM = swappedEndTotal % 60;

            const swappedStartTime = `${swappedStartH.toString().padStart(2, '0')}:${swappedStartM.toString().padStart(2, '0')}`;
            const swappedEndTime = `${swappedEndH.toString().padStart(2, '0')}:${swappedEndM.toString().padStart(2, '0')}`;

            blocks[collisionBlockIndex] = {
              ...collidingBlock,
              day: blockToMove.day, // Swap to old day
              startTime: swappedStartTime, // Swap to old start time
              endTime: swappedEndTime
            };

            // Reschedule swapped block notification
            cancelNotification(collidingBlock.id);
            if (notificationsEnabled) {
              scheduleWeeklyClassNotification(collidingBlock.id, collidingBlock.code, collidingBlock.name, blocks[collisionBlockIndex].day, blocks[collisionBlockIndex].startTime, reminderMinutes);
            }
          }

          // Move the dragged block
          const updatedBlock = {
            ...blockToMove,
            day: newDay,
            startTime: newStartTime,
            endTime: newEndTime
          };

          const updatedBlocks = blocks.map(b => b.id === id ? updatedBlock : b);

          // Re-schedule moved block notification
          cancelNotification(id);
          if (notificationsEnabled) {
            scheduleWeeklyClassNotification(id, updatedBlock.code, updatedBlock.name, updatedBlock.day, updatedBlock.startTime, reminderMinutes);
          }

          return { blocks: updatedBlocks };
        });
      },
    }),
    {
      name: "schedule-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
