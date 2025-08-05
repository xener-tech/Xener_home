import { google } from 'googleapis';

const SHEET_ID = '1yRxlWdCYnbiVzMHKI1FFHgpKovnjg2zpJv2ygCoBF5c';

// Initialize Google Sheets API
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

interface UserData {
  userId: string;
  name: string;
  email: string;
  energyScore: number;
  timestamp: string;
}

interface ApplianceData {
  userId: string;
  name: string;
  type: string;
  powerRating: number;
  starRating: number;
  usageHours: number;
  timestamp: string;
}

interface BillData {
  userId: string;
  energySupplier: string;
  monthlyBill: number;
  unitsConsumed: number;
  billTotal: number;
  dueDate: string;
  isPaid: boolean;
  confidence: number;
  timestamp: string;
}

export class GoogleSheetsService {
  private async ensureSheetExists(sheetName: string): Promise<void> {
    try {
      const response = await sheets.spreadsheets.get({
        spreadsheetId: SHEET_ID,
      });
      
      const sheetExists = response.data.sheets?.some(
        sheet => sheet.properties?.title === sheetName
      );
      
      if (!sheetExists) {
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId: SHEET_ID,
          requestBody: {
            requests: [{
              addSheet: {
                properties: {
                  title: sheetName,
                },
              },
            }],
          },
        });
        
        // Add headers for the new sheet
        await this.addHeaders(sheetName);
      }
    } catch (error) {
      console.error('Error ensuring sheet exists:', error);
    }
  }
  
  private async addHeaders(sheetName: string): Promise<void> {
    const headers = [
      'Timestamp',
      'User ID',
      'User Name', 
      'User Email',
      'Energy Score',
      'Appliance Name',
      'Appliance Type',
      'Power Rating',
      'Star Rating',
      'Usage Hours',
      'Energy Supplier',
      'Monthly Bill',
      'Units Consumed',
      'Bill Total',
      'Due Date',
      'Is Paid',
      'OCR Confidence'
    ];
    
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${sheetName}!A1:Q1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [headers],
      },
    });
  }
  
  async saveUserData(userData: UserData): Promise<void> {
    const sheetName = `User_${userData.userId}`;
    await this.ensureSheetExists(sheetName);
    
    const values = [
      userData.timestamp,
      userData.userId,
      userData.name,
      userData.email,
      userData.energyScore,
      '', '', '', '', '', '', '', '', '', '', '', '' // Empty appliance and bill columns
    ];
    
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${sheetName}!A:Q`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [values],
      },
    });
  }
  
  async saveApplianceData(applianceData: ApplianceData): Promise<void> {
    const sheetName = `User_${applianceData.userId}`;
    await this.ensureSheetExists(sheetName);
    
    const values = [
      applianceData.timestamp,
      applianceData.userId,
      '', '', '', // Empty user columns
      applianceData.name,
      applianceData.type,
      applianceData.powerRating,
      applianceData.starRating,
      applianceData.usageHours,
      '', '', '', '', '', '', '' // Empty bill columns
    ];
    
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${sheetName}!A:Q`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [values],
      },
    });
  }
  
  async saveBillData(billData: BillData): Promise<void> {
    const sheetName = `User_${billData.userId}`;
    await this.ensureSheetExists(sheetName);
    
    const values = [
      billData.timestamp,
      billData.userId,
      '', '', '', '', '', '', '', '', // Empty user and appliance columns
      billData.energySupplier,
      billData.monthlyBill,
      billData.unitsConsumed,
      billData.billTotal,
      billData.dueDate,
      billData.isPaid,
      billData.confidence
    ];
    
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${sheetName}!A:Q`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [values],
      },
    });
  }
}

export const googleSheetsService = new GoogleSheetsService();