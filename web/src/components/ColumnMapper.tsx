interface ColumnMapperProps {
  columns: string[];
  mappings: {
    employeeName: number;
    employeeId: number;
    date: number;
    timeIn: number;
    timeOut: number;
    timeIn2: number;
    timeOut2: number;
  };
  onMappingChange: (field: string, columnIndex: number) => void;
}

export const ColumnMapper = ({ columns, mappings, onMappingChange }: ColumnMapperProps) => {
  const fields = [
    { key: 'employeeName', label: 'Employee Name', required: true },
    { key: 'employeeId', label: 'Employee ID', required: false },
    { key: 'date', label: 'Date', required: true },
    { key: 'timeIn', label: 'Morning Time In', required: true },
    { key: 'timeOut', label: 'Morning Time Out', required: false },
    { key: 'timeIn2', label: 'Afternoon Time In', required: false },
    { key: 'timeOut2', label: 'Afternoon Time Out', required: false },
  ];

  return (
    <div className="w-full space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Map Columns</h3>

      {fields.map((field) => (
        <div key={field.key}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          <select
            value={mappings[field.key as keyof typeof mappings]}
            onChange={(e) => onMappingChange(field.key, parseInt(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={-1}>-- Select Column --</option>
            {columns.map((col, idx) => (
              <option key={idx} value={idx}>
                Column {idx + 1}: {col}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
};
