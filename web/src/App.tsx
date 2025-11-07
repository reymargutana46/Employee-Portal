import { useState } from 'react';
import { Database, CheckCircle, AlertCircle } from 'lucide-react';
import { FileUploader } from './components/FileUploader';
import { SheetSelector } from './components/SheetSelector';
import { ColumnMapper } from './components/ColumnMapper';
import { DataPreview } from './components/DataPreview';
import { parseFile, ParsedData } from './utils/fileParser';
import { mapRowToRecord, ColumnMappings } from './utils/dataMapper';
import {  dtrecords, insertDTRRecords } from './lib/supabase';
import { useDTRStore } from "@/store/useDTRStore";


function App() {
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [startRow, setStartRow] = useState<number>(1);
  const [columnMappings, setColumnMappings] = useState<ColumnMappings>({
    employeeName: -1,
    employeeId: -1,
    date: -1,
    timeIn: -1,
    timeOut: -1,
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const handleFileSelect = async (file: File) => {
    try {
      const data = await parseFile(file);
      setParsedData(data);
      setSelectedSheet(data.sheets[0]);
      setUploadStatus({ type: null, message: '' });
    } catch (error) {
      setUploadStatus({
        type: 'error',
        message: `Failed to parse file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  };

  const handleMappingChange = (field: string, columnIndex: number) => {
    setColumnMappings((prev) => ({
      ...prev,
      [field]: columnIndex,
    }));
  };

  const getHeaderRow = (): string[] => {
    if (!parsedData || !selectedSheet) return [];
    const sheetData = parsedData.data[selectedSheet];
    if (!sheetData || sheetData.length === 0) return [];

    const headerRowIndex = Math.max(0, startRow - 1);
    const headerRow = sheetData[headerRowIndex];

    return Array.isArray(headerRow)
      ? headerRow.map((cell) => String(cell ?? ''))
      : [];
  };

  const handleMigrate = async () => {
    if (!parsedData || !selectedSheet) return;

    if (columnMappings.employeeName === -1 || columnMappings.date === -1 || columnMappings.timeIn === -1) {
      setUploadStatus({
        type: 'error',
        message: 'Please map all required fields (Employee Name, Date, Time In)',
      });
      return;
    }

    setIsUploading(true);
    setUploadStatus({ type: null, message: '' });

    try {
      const sheetData = parsedData.data[selectedSheet];
      const dataRows = sheetData.slice(startRow);

      const records: dtrecords[] = [];
      for (const row of dataRows) {
        if (!Array.isArray(row) || row.length === 0) continue;
        const record = mapRowToRecord(row, columnMappings);
        if (record) {
          records.push(record);
        }
      }

      if (records.length === 0) {
        setUploadStatus({
          type: 'error',
          message: 'No valid records found to import',
        });
        setIsUploading(false);
        return;
      }

      try {
  const count = await insertDTRRecords(records);
  setUploadStatus({
    type: 'success',
    message: `Successfully imported ${count} records!`,
  });
} catch (error: any) {
  setUploadStatus({
    type: 'error',
    message: `Failed to import data: ${error.message}`,
  });
}
      setUploadStatus({
        type: 'success',
        message: `Successfully imported ${records.length} records!`,
      });

      setParsedData(null);
      setSelectedSheet('');
      setColumnMappings({
        employeeName: -1,
        employeeId: -1,
        date: -1,
        timeIn: -1,
        timeOut: -1,
      });
      setStartRow(1);
    } catch (error) {
      setUploadStatus({
        type: 'error',
        message: `Failed to import data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Database className="w-12 h-12 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">DTR Data Migration</h1>
            <p className="text-gray-600">Import your time records from CSV, XLS, or XLSX files</p>
          </div>

          {uploadStatus.type && (
            <div
              className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                uploadStatus.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {uploadStatus.type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <p>{uploadStatus.message}</p>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-lg p-8">
            {!parsedData ? (
              <FileUploader onFileSelect={handleFileSelect} />
            ) : (
              <div className="space-y-6">
                <SheetSelector
                  sheets={parsedData.sheets}
                  selectedSheet={selectedSheet}
                  onSheetChange={setSelectedSheet}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Starting Row (data begins)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={startRow}
                    onChange={(e) => setStartRow(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Row number where actual data starts (skip headers)
                  </p>
                </div>

                <ColumnMapper
                  columns={getHeaderRow()}
                  mappings={columnMappings}
                  onMappingChange={handleMappingChange}
                />

                {parsedData.data[selectedSheet] && parsedData.data[selectedSheet].length > 0 && (
                  <DataPreview data={parsedData.data[selectedSheet]} startRow={startRow} />
                )}

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => {
                      setParsedData(null);
                      setSelectedSheet('');
                      setColumnMappings({
                        employeeName: -1,
                        employeeId: -1,
                        date: -1,
                        timeIn: -1,
                        timeOut: -1,
                      });
                      setStartRow(1);
                      setUploadStatus({ type: null, message: '' });
                    }}
                    className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleMigrate}
                    disabled={isUploading}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
                  >
                    {isUploading ? 'Importing...' : 'Import to Database'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
