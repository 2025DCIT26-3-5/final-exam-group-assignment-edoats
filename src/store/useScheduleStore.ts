import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

      addBlock: (block) => set((state) => ({ blocks: [...state.blocks, block] })),

      updateBlock: (id, updatedBlock) =>
        set((state) => ({
          blocks: state.blocks.map((b) => (b.id === id ? { ...b, ...updatedBlock } : b)),
        })),

      deleteBlock: (id) =>
        set((state) => ({ blocks: state.blocks.filter((b) => b.id !== id) })),

      importSchedule: (newBlocks) => set({ blocks: newBlocks }),
    }),
    {
      name: "schedule-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
