import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
export const supabase = createClient(supabaseUrl, supabaseKey);

export interface dtrecords {
  id?: number;
  employee_name: string;
  employee_id: number;
  date: string;
  time_in: string;
  time_out?: string | null;
  time_in2?: string;
  time_out2?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type DTRRecord = dtrecords;

function formatDate(input: any): string {
  if (!input) return '';
  const d = new Date(input);
  if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];

  // Handle Excel serial dates (numeric)
  if (typeof input === 'number') {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const date = new Date(excelEpoch.getTime() + input * 86400000);
    return date.toISOString().split('T')[0];
  }

  return String(input).trim();
}

function formatTime(input: any): string {
  if (!input) return "00:00:00";

  // 🧠 Case 1: Excel numeric time (e.g., 0.305555556 = 7:20 AM)
  if (typeof input === "number" && input >= 0 && input < 1) {
    const totalSeconds = Math.round(input * 24 * 60 * 60);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  // 🧠 Case 2: ISO or timestamp-like string (e.g., "2025-08-04T07:13Z")
  if (typeof input === "string" && input.includes("T")) {
    const parts = input.split("T")[1]?.replace("Z", "") || "";
    const [h, m] = parts.split(":");
    if (h && m) {
      return `${h.padStart(2, "0")}:${m.padStart(2, "0")}:00`;
    }
  }

  // 🧠 Case 3: Regular text time (e.g., "7:13", "7:13 AM", "12:10 PM")
  const timeRegex = /^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM|am|pm)?$/;
  const match = String(input).trim().match(timeRegex);
  if (match) {
    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const seconds = match[3] ? parseInt(match[3]) : 0;
    const meridian = match[4]?.toLowerCase();

    if (meridian === "pm" && hours < 12) hours += 12;
    if (meridian === "am" && hours === 12) hours = 0;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  // 🧠 Case 4: Fallback — if parsing fails
  return "00:00:00";
}



export function cleanDTRRecordPayload(record: any): dtrecords | null {
  if (!record) return null;

  // Skip incomplete rows
  if (!record.employee_name || !record.date || !record.time_in) return null;

  const timeIn = formatTime(record.time_in);
  const timeOut = formatTime(record.time_out);
  const timeIn2 = formatTime(record.time_in2);
  const timeOut2 = formatTime(record.time_out2);

  // Skip invalid time strings that failed to format
  if (!timeIn || timeIn.includes('T')) return null;

  return {
    employee_name: String(record.employee_name).trim(),
    employee_id: Number(record.employee_id) || 0,
    date: formatDate(record.date),
    time_in: timeIn,
    time_out: timeOut && !timeOut.includes('T') ? timeOut : null,
    time_in2: timeIn2,
    time_out2: timeOut && !timeOut2.includes('T') ? timeOut2 : null,
  };
}



export async function insertDTRRecords(rawRecords: any[]) {
  const cleanedRecords = rawRecords
    .map(cleanDTRRecordPayload)
    .filter((r): r is dtrecords => r !== null);

  console.log("🧹 Cleaned records to insert:", cleanedRecords); // <— ADD THIS LINE

  if (cleanedRecords.length === 0) {
    throw new Error('No valid records to insert.');
  }
  console.log(cleanedRecords);
  console.log("🧩 Inserting into table: dtrecords");

  const { data, error, status } = await supabase
    .from('dtrecords')
    .insert(cleanedRecords)
    .select('*');

  console.log("📤 Supabase response:", { status, data, error }); // <— ADD THIS LINE

  if (error) throw error;

  return cleanedRecords.length;
}
