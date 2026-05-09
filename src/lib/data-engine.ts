import Papa from "papaparse";

export interface DataAuditReport {
  rows: number;
  columns: number;
  columnStats: {
    name: string;
    type: string;
    missingCount: number;
    missingPct: number;
    uniqueCount: number;
    mean?: number;
    std?: number;
    min?: number;
    max?: number;
    outlierCount?: number;
    lowerBound?: number;
    upperBound?: number;
    sampleValues: any[];
  }[];
  duplicates: number;
}

export async function generateAudit(file: File): Promise<{ report: DataAuditReport, data: any[] }> {
  let data: any[] = [];
  
  if (file.name.endsWith('.csv')) {
    const text = await file.text();
    const result = Papa.parse(text, { 
      header: true, 
      dynamicTyping: true, 
      skipEmptyLines: true,
      transform: (value) => {
        const val = String(value).trim().toLowerCase();
        if (val === 'n/a' || val === 'na' || val === 'null' || val === '') return null;
        return value;
      }
    });
    data = result.data.filter((row: any) => Object.values(row).some(v => v !== null && v !== undefined));
  } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
    const XLSX = await import('xlsx');
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer);
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    data = XLSX.utils.sheet_to_json(worksheet, { defval: null });
    // Sanitize Excel data for common null strings
    data = data.map(row => {
      const newRow: any = {};
      for (const key in row) {
        const value = (row as any)[key];
        if (typeof value === 'string') {
          const val = value.trim().toLowerCase();
          if (val === 'n/a' || val === 'na' || val === 'null') {
            newRow[key] = null;
          } else {
            newRow[key] = value;
          }
        } else {
          newRow[key] = value;
        }
      }
      return newRow;
    });
  } else {
    throw new Error('Unsupported file format');
  }

  if (!data || data.length === 0) {
    throw new Error('File is empty or could not be parsed');
  }

  const report = createAuditReport(data);
  return { report, data };
}

export function createAuditReport(data: any[]): DataAuditReport {
  if (!data || data.length === 0) {
    throw new Error('No data to audit');
  }

  const columns = Object.keys(data[0] || {});
  const rowCount = data.length;
  
  // Robust manual duplicate detection
  const seen = new Set();
  let duplicatesCount = 0;
  data.forEach(row => {
    const s = JSON.stringify(row);
    if (seen.has(s)) duplicatesCount++;
    else seen.add(s);
  });
  
  const report: DataAuditReport = {
    rows: rowCount,
    columns: columns.length,
    columnStats: [],
    duplicates: duplicatesCount,
  };

  for (const colName of columns) {
    const values = data.map(row => row[colName]);
    const nonNullValues = values.filter(v => v !== null && v !== undefined);
    const missing = rowCount - nonNullValues.length;
    const unique = new Set(nonNullValues).size;
    
    // Infer type
    let type = 'string';
    if (nonNullValues.length > 0) {
      const firstVal = nonNullValues[0];
      if (typeof firstVal === 'number') type = 'number';
      else if (typeof firstVal === 'boolean') type = 'boolean';
    }
    
    const stats: any = {
      name: colName,
      type: type,
      missingCount: missing,
      missingPct: (missing / rowCount) * 100,
      uniqueCount: unique,
      sampleValues: nonNullValues.slice(0, 5),
    };

    if (type === 'number') {
      try {
        const nums = nonNullValues as number[];
        const sum = nums.reduce((a, b) => a + b, 0);
        const mean = sum / nums.length;
        const squareDiffs = nums.map(v => Math.pow(v - mean, 2));
        const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / nums.length;
        const std = Math.sqrt(avgSquareDiff);
        
        stats.mean = mean;
        stats.std = std;
        stats.min = Math.min(...nums);
        stats.max = Math.max(...nums);

        // Simple outlier detection logic
        const sorted = [...nums].sort((a, b) => a - b);
        const q1 = sorted[Math.floor(sorted.length * 0.25)];
        const q3 = sorted[Math.floor(sorted.length * 0.75)];
        const iqr = q3 - q1;
        const lower = q1 - 1.5 * iqr;
        const upper = q3 + 1.5 * iqr;
        
        stats.lowerBound = lower;
        stats.upperBound = upper;
        stats.outlierCount = nums.filter(v => v < lower || v > upper).length;
      } catch (e) {
        console.warn(`Stat calculation failed for ${colName}:`, e);
      }
    }

    report.columnStats.push(stats);
  }

  return report;
}

export function applyTransformation(
  data: any[],
  columnName: string,
  action: 'fill_mean' | 'fill_median' | 'fill_constant' | 'drop_na',
  params?: { value?: any }
): any[] {
  if (action === 'drop_na') {
    return data.filter((row: any) => row[columnName] !== null && row[columnName] !== undefined);
  }

  const values = data.map(row => row[columnName]).filter(v => v !== null && v !== undefined);
  let fillValue: any = params?.value ?? 0;

  if (action === 'fill_mean') {
    const numericValues = values.filter(v => typeof v === 'number') as number[];
    if (numericValues.length > 0) {
      fillValue = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
    }
  } else if (action === 'fill_median') {
    const numericValues = values.filter(v => typeof v === 'number') as number[];
    if (numericValues.length > 0) {
      const sorted = [...numericValues].sort((a, b) => a - b);
      fillValue = sorted[Math.floor(sorted.length / 2)];
    }
  }

  return data.map(row => {
    if (row[columnName] === null || row[columnName] === undefined) {
      return { ...row, [columnName]: fillValue };
    }
    return row;
  });
}

export function exportToCSV(data: any[], fileName: string) {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName.replace(/\.[^/.]+$/, "") + "_cleaned.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export async function processData(
  csvString: string, 
  actions: { type: 'fill_null' | 'drop_null' | 'encode' | 'scale', params: any }[]
): Promise<string> {
  const result = Papa.parse(csvString, { header: true, dynamicTyping: true });
  let data = result.data as any[];

  for (const action of actions) {
    switch (action.type) {
      case 'fill_null':
        const { column } = action.params;
        data = applyTransformation(data, column, 'fill_mean');
        break;
      case 'drop_null':
        data = data.filter(row => Object.values(row).every(v => v !== null && v !== undefined));
        break;
    }
  }

  return Papa.unparse(data);
}
