// Employee ID mapping utilities for DTR import
export interface EmployeeMappingConfig {
  biometricId: number;
  employeeId: number;
  employeeName: string;
}

// Default biometric ID to employee ID mappings
// Update these based on your actual biometric system data
// The employeeName here is the name that appears in your CSV file
export const DEFAULT_BIOMETRIC_MAPPINGS: EmployeeMappingConfig[] = [
  { biometricId: 4570035, employeeId: 58, employeeName: "SEVEN" }, // CSV name "SEVEN" maps to employee ID 58 (Suzy Garcia)
  { biometricId: 4991247, employeeId: 3, employeeName: "IRISH" }, // CSV name "IRISH" maps to employee ID 3
  
  // TEMPORARY: Add more mappings here as you discover them from your CSV
  // Copy the mappings from the browser console after importing your CSV
  // Example format:
  // { biometricId: 1234567, employeeId: 59, employeeName: "JOHN" },
  // { biometricId: 2345678, employeeId: 60, employeeName: "MARY" },
  
  // Add more mappings as you discover them from your CSV:
  // { biometricId: BIOMETRIC_ID_FROM_CSV, employeeId: DATABASE_EMPLOYEE_ID, employeeName: "NAME_IN_CSV" },
];

/**
 * Creates a mapping from biometric IDs to database employee IDs
 */
export function createBiometricMapping(
  employees: any[], 
  customMappings: EmployeeMappingConfig[] = []
): { [key: number]: number } {
  const mapping: { [key: number]: number } = {};
  
  // Apply default mappings
  DEFAULT_BIOMETRIC_MAPPINGS.forEach(config => {
    mapping[config.biometricId] = config.employeeId;
  });
  
  // Apply custom mappings (overrides defaults)
  customMappings.forEach(config => {
    mapping[config.biometricId] = config.employeeId;
  });
  
  // Try to auto-map based on employee data if biometric_id field exists
  employees.forEach(emp => {
    if (emp.biometric_id) {
      mapping[emp.biometric_id] = emp.id;
    }
  });
  
  return mapping;
}

/**
 * Attempts to find employee ID by name matching
 */
export function findEmployeeByName(
  employeeName: string, 
  employees: any[]
): number | null {
  const name = employeeName.toLowerCase().trim();
  
  // Try exact match first
  const exactMatch = employees.find(emp => 
    `${emp.fname} ${emp.lname}`.toLowerCase() === name ||
    emp.fname.toLowerCase() === name ||
    emp.lname.toLowerCase() === name
  );
  
  if (exactMatch) return exactMatch.id;
  
  // Try partial match
  const partialMatch = employees.find(emp => 
    name.includes(emp.fname.toLowerCase()) ||
    name.includes(emp.lname.toLowerCase()) ||
    emp.fname.toLowerCase().includes(name) ||
    emp.lname.toLowerCase().includes(name)
  );
  
  return partialMatch ? partialMatch.id : null;
}

/**
 * Discovers all unique biometric IDs and names from CSV data
 */
export function discoverBiometricIds(csvData: any[]): { biometricId: number; csvName: string }[] {
  const discovered: { biometricId: number; csvName: string }[] = [];
  const seen = new Set<number>();
  
  // Find header row and data start
  let dataStartRow = 0;
  for (let i = 0; i < Math.min(csvData.length, 10); i++) {
    if (csvData[i] && csvData[i].length > 0) {
      const firstCell = String(csvData[i][0] || "").toLowerCase();
      if (firstCell.includes("id") || firstCell.includes("name") || firstCell.includes("employee")) {
        dataStartRow = i + 1;
        continue;
      }
      if (!isNaN(Number(csvData[i][0])) && Number(csvData[i][0]) > 0) {
        dataStartRow = i;
        break;
      }
    }
  }
  
  // Process each data row to find unique biometric IDs
  for (let i = dataStartRow; i < csvData.length; i++) {
    const row = csvData[i];
    if (!row || row.length < 2) continue;
    
    const biometricIdRaw = String(row[0] || "").trim();
    const employeeName = String(row[1] || "").trim();
    
    if (!biometricIdRaw || isNaN(Number(biometricIdRaw)) || !employeeName) continue;
    
    const biometricId = parseInt(biometricIdRaw);
    
    if (!seen.has(biometricId)) {
      seen.add(biometricId);
      discovered.push({ biometricId, csvName: employeeName });
    }
  }
  
  return discovered;
}

/**
 * Creates a comprehensive mapping that handles unmapped biometric IDs
 */
export function createComprehensiveMapping(
  csvData: any[],
  employees: any[],
  customMappings: EmployeeMappingConfig[] = []
): { 
  mapping: { [key: number]: number };
  unmappedIds: { biometricId: number; csvName: string }[];
  mappedCount: number;
} {
  const mapping: { [key: number]: number } = {};
  const unmappedIds: { biometricId: number; csvName: string }[] = [];
  
  // Apply default mappings
  DEFAULT_BIOMETRIC_MAPPINGS.forEach(config => {
    mapping[config.biometricId] = config.employeeId;
  });
  
  // Apply custom mappings (overrides defaults)
  customMappings.forEach(config => {
    mapping[config.biometricId] = config.employeeId;
  });
  
  // Discover all biometric IDs from CSV
  const discoveredIds = discoverBiometricIds(csvData);
  
  console.log(`=== DISCOVERED ${discoveredIds.length} UNIQUE EMPLOYEES IN CSV ===`);
  
  // Check which ones are not mapped
  discoveredIds.forEach(({ biometricId, csvName }) => {
    if (!mapping[biometricId]) {
      // Try to find by name matching
      const employeeId = findEmployeeByName(csvName, employees);
      if (employeeId) {
        mapping[biometricId] = employeeId;
        console.log(`✅ Auto-mapped: ${csvName} (${biometricId}) -> Employee ID ${employeeId}`);
      } else {
        unmappedIds.push({ biometricId, csvName });
        console.warn(`❌ UNMAPPED: ${csvName} (${biometricId}) - Add this mapping manually`);
      }
    } else {
      console.log(`✅ Pre-mapped: ${csvName} (${biometricId}) -> Employee ID ${mapping[biometricId]}`);
    }
  });
  
  // Show mapping instructions for unmapped employees
  if (unmappedIds.length > 0) {
    console.log(`\n=== ${unmappedIds.length} EMPLOYEES NEED MAPPING ===`);
    console.log(`📝 ACTION REQUIRED: Add these mappings to employeeMapping.ts (or ensure employees table has matching biometric_id values):`);
    unmappedIds.forEach(({ biometricId, csvName }) => {
      console.log(`{ biometricId: ${biometricId}, employeeId: ?, employeeName: "${csvName}" }, // Find correct employee_id from database`);
    });
    console.log(`\n=== AVAILABLE EMPLOYEES IN DATABASE ===`);
    employees.forEach(emp => {
      console.log(`Employee ID: ${emp.id} - ${emp.fname} ${emp.lname}`);
    });
  }

  return {
    mapping,
    unmappedIds,
    mappedCount: Object.keys(mapping).length
  };
}

/**
 * Validates if a biometric ID is mapped to a valid employee
 */
export function validateBiometricMapping(
  biometricId: number,
  mapping: { [key: number]: number },
  employees: any[]
): { isValid: boolean; employeeId?: number; employeeName?: string } {
  const employeeId = mapping[biometricId];
  
  if (!employeeId) {
    return { isValid: false };
  }
  
  const employee = employees.find(emp => emp.id === employeeId);
  
  if (!employee) {
    return { isValid: false };
  }
  
  return {
    isValid: true,
    employeeId: employee.id,
    employeeName: `${employee.fname} ${employee.lname}`
  };
}
