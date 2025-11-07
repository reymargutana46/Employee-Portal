import * as XLSX from 'xlsx';
import Papa from 'papaparse';

export interface ParsedData {
  sheets: string[];
  data: Record<string, unknown[][]>;
}

export const parseExcelFile = (file: File): Promise<ParsedData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });

        const parsedData: ParsedData = {
          sheets: workbook.SheetNames,
          data: {}
        };

        workbook.SheetNames.forEach((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          parsedData.data[sheetName] = jsonData as unknown[][];
        });

        resolve(parsedData);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(reader.error);
    reader.readAsBinaryString(file);
  });
};

export const parseCSVFile = (file: File): Promise<ParsedData> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      complete: (results) => {
        resolve({
          sheets: ['Sheet1'],
          data: {
            'Sheet1': results.data as unknown[][]
          }
        });
      },
      error: (error) => reject(error)
    });
  });
};

export const parseFile = async (file: File): Promise<ParsedData> => {
  const fileExtension = file.name.split('.').pop()?.toLowerCase();

  if (fileExtension === 'csv') {
    return parseCSVFile(file);
  } else if (['xls', 'xlsx'].includes(fileExtension || '')) {
    return parseExcelFile(file);
  } else {
    throw new Error('Unsupported file format. Please use CSV, XLS, or XLSX files.');
  }
};
