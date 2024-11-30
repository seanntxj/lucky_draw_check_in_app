import { Prize } from "@/schema/prizesSchema";
import { create } from "zustand";

/* Get the supabase credentials from .env */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
const supabaseParticipantsTableName = import.meta.env
  .VITE_PARTICIPANTS_TABLE_NAME;
const faceAPILink = import.meta.env.VITE_FACE_API_ADDRESS;

export const usePrizeStore = create<{
  prizes: Prize[];
  setPrizes: (newPrizes: Prize[]) => void;
  resetPrizes: () => void;
}>((set) => ({
  prizes: [],
  setPrizes: (newPrizes) => set(() => ({ prizes: newPrizes })),
  resetPrizes: () => set({ prizes: [] }),
}));

interface SupabaseConfig {
  supabaseUrl: string;
  setSupabaseUrl: (url: string) => void;
  supabaseKey: string;
  setSupabaseKey: (key: string) => void;
  supabaseParticipantsTableName: string;
  setSupabaseParticipantsTableName: (key: string) => void;
}

export const useSupabaseConfigStore = create<SupabaseConfig>((set) => ({
  supabaseUrl: supabaseUrl,
  setSupabaseUrl: (url) => set(() => ({ supabaseUrl: url })),
  supabaseKey: supabaseKey,
  setSupabaseKey: (key) => set(() => ({ supabaseKey: key })),
  supabaseParticipantsTableName: supabaseParticipantsTableName,
  setSupabaseParticipantsTableName: (tablename) =>
    set(() => ({ supabaseParticipantsTableName: tablename })),
}));

export const useFaceAPIStore = create<{
  faceAPILink: string;
  setFaceAPILink: (link: string) => void;
}>((set) => ({
  faceAPILink: faceAPILink || `http://localhost:9001/check-face`,
  setFaceAPILink: (link) => set(() => ({ faceAPILink: link })),
}));

export const useDrawingSettingsStore = create<{
  category: string;
  setCategory: (newCategory: string) => void;
}>((set) => ({
  category: "general", 
  setCategory: (newCategory) => set(() => ({category: newCategory}))
}))