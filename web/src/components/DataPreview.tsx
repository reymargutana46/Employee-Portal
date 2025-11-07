interface DataPreviewProps {
  data: unknown[][];
  startRow: number;
}

export const DataPreview = ({ data, startRow }: DataPreviewProps) => {
  const previewData = data.slice(startRow, startRow + 5);

  if (previewData.length === 0) {
    return (
      <div className="w-full p-4 bg-gray-50 rounded-lg">
        <p className="text-gray-500 text-center">No data to preview</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Data Preview</h3>
      <div className="overflow-x-auto border border-gray-300 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {previewData[0] &&
                Array.isArray(previewData[0]) &&
                previewData[0].map((_, idx) => (
                  <th
                    key={idx}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Col {idx + 1}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {previewData.map((row, rowIdx) => (
              <tr key={rowIdx}>
                {Array.isArray(row) &&
                  row.map((cell, cellIdx) => (
                    <td key={cellIdx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {String(cell ?? '')}
                    </td>
                  ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-500 mt-2">Showing first 5 rows from starting row</p>
    </div>
  );
};
