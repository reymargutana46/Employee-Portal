// Local interface for DTR records
export interface DTRRecord {
  employee_name: string;
  employee_id?: number;
  date: string;
  time_in: string;
  time_out?: string;
  time_in2?: string;
  time_out2?: string;
}

export interface ColumnMappings {
  employeeName: number;
  employeeId: number;
  date: number;
  timeIn: number;
  timeOut: number;
  timeIn2: number;
  timeOut2: number;
}

const parseDateTime = (dateValue: unknown, timeValue: unknown): string => {
  try {
    // Handle time value
    if (typeof timeValue === 'number') {
      const totalSeconds = Math.round(timeValue * 24 * 60 * 60);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      
      // Convert to 12-hour format
      const displayHours = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const minutesStr = String(minutes).padStart(2, '0');
      
      return `${displayHours}:${minutesStr} ${ampm}`;
    } else if (timeValue instanceof Date) {
      let hours = timeValue.getHours();
      const minutes = timeValue.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours || 12;
      const minutesStr = minutes < 10 ? '0' + minutes : minutes;
      return `${hours}:${minutesStr} ${ampm}`;
    } else if (typeof timeValue === 'string') {
      // If already in time format, return as is
      if (timeValue.includes('AM') || timeValue.includes('PM')) {
        return timeValue;
      }
      // Try to parse as time string
      const [time, ampm] = timeValue.split(' ');
      if (ampm && (ampm.toUpperCase() === 'AM' || ampm.toUpperCase() === 'PM')) {
        return timeValue.toUpperCase();
      }
      // If just time like "8:30", assume it's in 24-hour format
      const parts = time.split(':');
      if (parts.length >= 2) {
        let hours = parseInt(parts[0]);
        const minutes = parts[1];
        const displayAmpm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours || 12;
        return `${hours}:${minutes} ${displayAmpm}`;
      }
    }
    
    return '';
  } catch (error) {
    console.error('Error parsing time:', error);
    return '';
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
      employee_id: mappings.employeeId !== -1 ? Number(row[mappings.employeeId] ?? 0) || 0 : undefined,
      date: dateStr,
      time_in: parseDateTime(date, timeIn),
      time_out: mappings.timeOut !== -1 ? parseDateTime(date, row[mappings.timeOut]) : undefined,
      time_in2: mappings.timeIn2 !== -1 ? parseDateTime(date, row[mappings.timeIn2]) : undefined,
      time_out2: mappings.timeOut2 !== -1 ? parseDateTime(date, row[mappings.timeOut2]) : undefined,
    };

    return record;
  } catch (error) {
    console.error('Error mapping row to record:', error);
    return null;
  }
};
