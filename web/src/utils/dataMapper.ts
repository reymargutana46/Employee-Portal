import { DTRRecord } from '../lib/supabase';

export interface ColumnMappings {
  employeeName: number;
  employeeId: number;
  date: number;
  timeIn: number;
  timeOut: number;
}

const parseDateTime = (dateValue: unknown, timeValue: unknown): string => {
  try {
    let dateStr = '';
    let timeStr = '';

    if (typeof dateValue === 'number') {
      const date = new Date((dateValue - 25569) * 86400 * 1000);
      dateStr = date.toISOString().split('T')[0];
    } else if (dateValue instanceof Date) {
      dateStr = dateValue.toISOString().split('T')[0];
    } else if (typeof dateValue === 'string') {
      dateStr = new Date(dateValue).toISOString().split('T')[0];
    }

    if (typeof timeValue === 'number') {
      const totalSeconds = Math.round(timeValue * 24 * 60 * 60);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    } else if (timeValue instanceof Date) {
      timeStr = timeValue.toTimeString().split(' ')[0];
    } else if (typeof timeValue === 'string') {
      timeStr = timeValue;
    }

    if (dateStr && timeStr) {
      return `${dateStr}T${timeStr}Z`;
    } else if (dateStr) {
      return `${dateStr}T00:00:00Z`;
    }

    return new Date().toISOString();
  } catch (error) {
    console.error('Error parsing date/time:', error);
    return new Date().toISOString();
  }
};

export const mapRowToRecord = (
  row: unknown[],
  mappings: ColumnMappings
): DTRRecord | null => {
  try {
    if (mappings.employeeName === -1 || mappings.date === -1 || mappings.timeIn === -1) {
      return null;
    }

    const employeeName = String(row[mappings.employeeName] ?? '').trim();
    if (!employeeName) return null;

    const date = row[mappings.date];
    const timeIn = row[mappings.timeIn];

    const dateStr = typeof date === 'number'
      ? new Date((date - 25569) * 86400 * 1000).toISOString().split('T')[0]
      : date instanceof Date
      ? date.toISOString().split('T')[0]
      : String(date);

    const record: DTRRecord = {
      employee_name: employeeName,
      employee_id: mappings.employeeId !== -1 ? String(row[mappings.employeeId] ?? '') : undefined,
      date: dateStr,
      time_in: parseDateTime(date, timeIn),
      time_out: mappings.timeOut !== -1 ? parseDateTime(date, row[mappings.timeOut]) : undefined,
    };

    return record;
  } catch (error) {
    console.error('Error mapping row to record:', error);
    return null;
  }
};
