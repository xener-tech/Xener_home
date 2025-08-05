import Tesseract from 'tesseract.js';

export interface ExtractedBillData {
  energySupplier: string;
  monthlyBill: number;
  billingMonth: string;
  unitsConsumed: number;
  billTotal: number;
  billBreakdown: string;
  tariffRate: number;
  connectionType: string;
  userAddress: string;
  areaTariff: string;
  dueDate: string;
  isPaid: boolean;
  customerID: string;
  meterNumber: string;
  sanctionedLoad: number;
  confidence: number;
  
  // Additional detailed fields
  readingDate: string;
  billDate: string;
  userName: string;
  securityDeposit: number;
  unitsBilled: number;
  unitsCredited: number;
  
  // Bill breakdown details
  energyCharges: number;
  fpppaCharges: number;
  governmentDuty: number;
  fixedCharges: number;
  previousDue: number;
  
  // Support information
  complaintNumber: string;
  helplineNumber: string;
}

// PDF.js types for PDF processing
declare global {
  interface Window {
    pdfjsLib: any;
  }
}

export async function extractFromPDF(file: File): Promise<ExtractedBillData> {
  try {
    // Load PDF.js library if not already loaded
    if (!window.pdfjsLib) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      document.head.appendChild(script);
      await new Promise(resolve => script.onload = resolve);
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await window.pdfjsLib.getDocument(arrayBuffer).promise;
    
    let allText = '';
    
    // Extract text from all pages
    for (let i = 1; i <= Math.min(pdf.numPages, 5); i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      allText += pageText + ' ';
    }
    
    // Parse the extracted text for bill information
    return parseTextForBillData(allText);
    
  } catch (error) {
    console.error('PDF extraction failed:', error);
    return getDefaultBillData();
  }
}

export async function extractBillData(file: File): Promise<ExtractedBillData> {
  try {
    const { data: { text } } = await Tesseract.recognize(file, 'eng', {
      logger: m => console.log(m)
    });

    console.log('Extracted OCR text:', text);
    return parseTextForBillData(text);
  } catch (error) {
    console.error('OCR extraction failed:', error);
    return getDefaultBillData();
  }
}

export async function extractFromMultiplePages(files: File[]): Promise<ExtractedBillData> {
  const results: ExtractedBillData[] = [];
  
  for (const file of files) {
    const result = await extractBillData(file);
    results.push(result);
  }
  
  // Merge results from multiple pages
  return mergeBillData(results);
}

function parseTextForBillData(text: string): ExtractedBillData {
  const lowerText = text.toLowerCase();
  
  // Extract energy supplier
  const supplierPatterns = [
    /(?:torrent|adani|tata|mseb|bescom|kseb|tneb|pspcl|uhbvn|dvvnl|uppcl|wbsedcl|pseb|mppkvvcl|paschim gujarat|dakshin gujarat|madhya gujarat|uttar gujarat)/i
  ];
  let energySupplier = '';
  for (const pattern of supplierPatterns) {
    const match = text.match(pattern);
    if (match) {
      energySupplier = match[0];
      break;
    }
  }
  
  // Extract bill total
  const billTotalMatch = text.match(/(?:total|amount|bill\s*amount|payable)\s*:?\s*₹?\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i);
  const billTotal = billTotalMatch ? parseFloat(billTotalMatch[1].replace(/,/g, '')) : 0;
  
  // Extract units consumed
  const unitsMatch = text.match(/(?:units|kwh|consumption)\s*:?\s*(\d+(?:,\d+)*(?:\.\d+)?)/i);
  const unitsConsumed = unitsMatch ? parseFloat(unitsMatch[1].replace(/,/g, '')) : 0;
  
  // Extract month
  const monthMatch = text.match(/(?:month|period|bill\s*for)\s*:?\s*([a-z]+\s*\d{4}|\d{2}\/\d{4}|\d{4}-\d{2})/i);
  let billingMonth = new Date().toISOString().substr(0, 7);
  if (monthMatch) {
    try {
      const monthStr = monthMatch[1];
      if (monthStr.includes('/')) {
        const [month, year] = monthStr.split('/');
        billingMonth = `${year}-${month.padStart(2, '0')}`;
      } else if (monthStr.includes('-')) {
        billingMonth = monthStr;
      }
    } catch (e) {
      // Keep default
    }
  }
  
  // Extract customer details
  const customerIdMatch = text.match(/(?:customer|consumer|account)\s*(?:id|no|number)\s*:?\s*([A-Z0-9]+)/i);
  const customerID = customerIdMatch ? customerIdMatch[1] : '';
  
  const meterMatch = text.match(/(?:meter|device)\s*(?:no|number)\s*:?\s*([A-Z0-9]+)/i);
  const meterNumber = meterMatch ? meterMatch[1] : '';
  
  const userNameMatch = text.match(/(?:name|consumer)\s*:?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i);
  const userName = userNameMatch ? userNameMatch[1] : '';
  
  // Calculate confidence based on how much data we extracted
  let confidence = 0.3;
  if (energySupplier) confidence += 0.2;
  if (billTotal > 0) confidence += 0.2;
  if (unitsConsumed > 0) confidence += 0.2;
  if (customerID) confidence += 0.1;
  
  return {
    energySupplier,
    monthlyBill: billTotal,
    billingMonth,
    unitsConsumed,
    billTotal,
    billBreakdown: `Extracted data for ${billingMonth}`,
    tariffRate: billTotal > 0 && unitsConsumed > 0 ? billTotal / unitsConsumed : 7,
    connectionType: 'Domestic',
    userAddress: '',
    areaTariff: '',
    dueDate: '',
    isPaid: false,
    customerID,
    meterNumber,
    sanctionedLoad: 0,
    confidence,
    
    // Additional detailed fields
    readingDate: '',
    billDate: '',
    userName,
    securityDeposit: 0,
    unitsBilled: unitsConsumed,
    unitsCredited: 0,
    
    // Bill breakdown details (estimated)
    energyCharges: billTotal * 0.7,
    fpppaCharges: billTotal * 0.1,
    governmentDuty: billTotal * 0.1,
    fixedCharges: billTotal * 0.05,
    previousDue: 0,
    
    // Support information
    complaintNumber: '',
    helplineNumber: ''
  };
}

function getDefaultBillData(): ExtractedBillData {
  return {
    energySupplier: '',
    monthlyBill: 0,
    billingMonth: new Date().toISOString().substr(0, 7),
    unitsConsumed: 0,
    billTotal: 0,
    billBreakdown: '',
    tariffRate: 7,
    connectionType: 'Domestic',
    userAddress: '',
    areaTariff: '',
    dueDate: '',
    isPaid: false,
    customerID: '',
    meterNumber: '',
    sanctionedLoad: 0,
    confidence: 0.0,
    readingDate: '',
    billDate: '',
    userName: '',
    securityDeposit: 0,
    unitsBilled: 0,
    unitsCredited: 0,
    energyCharges: 0,
    fpppaCharges: 0,
    governmentDuty: 0,
    fixedCharges: 0,
    previousDue: 0,
    complaintNumber: '',
    helplineNumber: ''
  };
}

function mergeBillData(results: ExtractedBillData[]): ExtractedBillData {
  if (results.length === 0) return getDefaultBillData();
  
  // Use the result with highest confidence
  return results.reduce((best, current) => 
    current.confidence > best.confidence ? current : best
  );
}