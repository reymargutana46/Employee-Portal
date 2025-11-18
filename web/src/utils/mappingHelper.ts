// Helper to generate employee mapping configurations
// Run this in browser console after importing CSV to see what mappings you need

export function generateMappingConfig(csvData: any[], employees: any[]) {
  console.log("=== EMPLOYEE MAPPING GENERATOR ===");
  console.log("Copy the following mappings to your employeeMapping.ts file:");
  console.log("");
  
  // Find all unique biometric IDs from CSV
  const discovered = new Set<string>();
  let dataStartRow = 0;
  
  // Find data start
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
  
  // Collect unique employees from CSV
  for (let i = dataStartRow; i < csvData.length; i++) {
    const row = csvData[i];
    if (!row || row.length < 2) continue;
    
    const biometricId = String(row[0] || "").trim();
    const csvName = String(row[1] || "").trim();
    
    if (!biometricId || isNaN(Number(biometricId)) || !csvName) continue;
    
    const key = `${biometricId}|${csvName}`;
    if (!discovered.has(key)) {
      discovered.add(key);
      
      // Try to find matching employee in database
      const matchedEmployee = employees.find(emp => 
        emp.fname.toLowerCase().includes(csvName.toLowerCase()) ||
        emp.lname.toLowerCase().includes(csvName.toLowerCase()) ||
        csvName.toLowerCase().includes(emp.fname.toLowerCase()) ||
        csvName.toLowerCase().includes(emp.lname.toLowerCase())
      );
      
      if (matchedEmployee) {
        console.log(`  { biometricId: ${biometricId}, employeeId: ${matchedEmployee.id}, employeeName: "${csvName}" }, // Maps to: ${matchedEmployee.fname} ${matchedEmployee.lname}`);
      } else {
        console.log(`  // UNMAPPED: { biometricId: ${biometricId}, employeeId: ?, employeeName: "${csvName}" }, // No match found in database`);
      }
    }
  }
  
  console.log("");
  console.log("=== DATABASE EMPLOYEES ===");
  console.log("Available employees in your database:");
  employees.forEach(emp => {
    console.log(`  ID: ${emp.id} - ${emp.fname} ${emp.lname}`);
  });
}

// Call this function in browser console after importing CSV
// Example: generateMappingConfig(csvData, employees)
