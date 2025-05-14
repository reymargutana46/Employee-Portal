
import { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { DateRangePicker } from './DateRangePicker';

interface DateRangeFilterProps {
  onApply: (startDate: Date | null, endDate: Date | null) => void;
}

const DateRangeFilter = ({ onApply }: DateRangeFilterProps) => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const handleDateRangeChange = (newDateRange: DateRange | undefined) => {
    setDateRange(newDateRange);
    onApply(
      newDateRange?.from || null,
      newDateRange?.to || null
    );
  };

  return (
    <DateRangePicker
      dateRange={dateRange}
      onDateRangeChange={handleDateRangeChange}
      className="w-[300px]"
    />
  );
};

export default DateRangeFilter;
