interface SheetSelectorProps {
  sheets: string[];
  selectedSheet: string;
  onSheetChange: (sheet: string) => void;
}

export const SheetSelector = ({ sheets, selectedSheet, onSheetChange }: SheetSelectorProps) => {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select Sheet
      </label>
      <select
        value={selectedSheet}
        onChange={(e) => onSheetChange(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        {sheets.map((sheet) => (
          <option key={sheet} value={sheet}>
            {sheet}
          </option>
        ))}
      </select>
    </div>
  );
};
