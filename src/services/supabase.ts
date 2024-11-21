import { createClient } from "@supabase/supabase-js";
import { useSupabaseConfigStore } from "./globalVariables";
import { Participant } from "@/schema/databaseItems";
import { toast } from "sonner";

/* Main supabase client */
let supabase: any; // Initialize supabase as any
let supabaseParticipantsTableName: any;

export const initializeSupabase = (url: string, key: string) => {
  let supabaseUrlAux = url;
  let supabaseKeyAux = key;
  supabaseParticipantsTableName =
    useSupabaseConfigStore.getState().supabaseParticipantsTableName;
  supabase = createClient(supabaseUrlAux, supabaseKeyAux);
};

export const getSupabaseClient = () => {
  if (!supabase) {
    throw new Error(
      "Supabase client not initialized. Please call initializeSupabase first."
    );
  }
  return supabase;
};

export default { initializeSupabase, getSupabaseClient };

// Auto initialise supabase in developement where .env is supplied
if (import.meta.env.VITE_SUPABASE_URL !== undefined) {
  initializeSupabase(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_KEY
  );
}

export const loginSupabase = async (email: string, password: string) => {
  const { data, error } = await getSupabaseClient().auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error(error);
    toast.error("Cannot login: " + error.message);
  } else {
    toast.success("Logged in successfully.");
  }
};

// initializeSupabase(supabaseUrl, supabaseKey);
// For getting the participants with filters
export interface GetParticipantsOptions {
  rangeBegin?: number;
  rangeEnd?: number;
  registered?: boolean;
  isDrawn?: boolean;
  category?: string;
  serviceline?: string;
}

export const getNameFromId = async (id: string) => {
  try {
    let res = await getSupabaseClient()
      .from(supabaseParticipantsTableName)
      .select("*")
      .eq("empid", id);
    return res.data[0].name;
  } catch (error) {
    toast.error("Cannot get name for employee ID: " + id);
    throw error;
  }
};

export const getParticipants = async (
  options: GetParticipantsOptions = {}
): Promise<Participant[]> => {
  const {
    rangeBegin = 0,
    rangeEnd = 1000,
    registered = true,
    isDrawn = false,
    category = "",
    serviceline = "",
  } = options;
  const query = getSupabaseClient()
    .from(supabaseParticipantsTableName)
    .select("*")
    .range(rangeBegin, rangeEnd)
    .is("isdrawn", isDrawn);

  category == "" ? "" : query.eq("category", category);
  serviceline == "" ? "" : query.eq("serviceline", serviceline);
  registered ? query.eq("registered", true) : "";

  const { data } = await query;

  return data || [];
};

export const handleCheckIn = async (
  id: string,
  successfullyusedfacerecognition: boolean | null = true,
  status: boolean = true,
  silentAccept: boolean = false
) => {
  const { data, error } = await getSupabaseClient()
    .from(supabaseParticipantsTableName)
    .update({
      registered: status,
      registereddatetime: status ? new Date() : null,
      successfullyusedfacerecognition: successfullyusedfacerecognition,
    })
    .eq("empid", id)
    .select();

  if (error) {
    toast.error("Error while checking in: " + error.message);
    throw error;
  }

  if (status === false) {
    toast.success("Checked out successfully.");
  }

  if (!silentAccept && status === true) {
    toast.success("Checked in successfully.");
  }

  console.error(error);
  return data;
};

// Mark a particular participant as a winner
export const markParticipantAsWinner = async (
  id: number,
  prizeNumberWon: number | null,
  winner: boolean = true
): Promise<Participant[]> => {
  const { data, error } = await getSupabaseClient()
    .from(supabaseParticipantsTableName)
    .update({ isdrawn: winner, prizewon: prizeNumberWon })
    .eq("id", id)
    .select();

  if (data) {
    return data as Participant[];
  } else if (error?.message) {
    throw new Error(error.message);
  }

  // Optional: add a fallback in case no conditions are met
  throw new Error("Unknown error occurred");
};

// Gets a list of all the available servicelines in the database
// DO NOT RUN REPEATEDLY. VERY INEFFICIENT.
export const getListOfServicelines = async (): Promise<string[]> => {
  const { data } = await getSupabaseClient()
    .from(supabaseParticipantsTableName)
    .select("serviceline");

  const groupSet = new Set<string>();
  if (data != null) {
    data.forEach((obj: { serviceline: string }) =>
      groupSet.add(obj.serviceline)
    );
    return Array.from(groupSet);
  }

  return [];
};
