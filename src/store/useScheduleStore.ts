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
}

interface ScheduleState {
  blocks: CourseBlock[];
  addBlock: (block: CourseBlock) => void;
  updateBlock: (id: string, updatedBlock: Partial<CourseBlock>) => void;
  deleteBlock: (id: string) => void;
  importSchedule: (blocks: CourseBlock[]) => void;
}

export const useScheduleStore = create<ScheduleState>()(
  persist(
    (set) => ({
      blocks: [],
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
