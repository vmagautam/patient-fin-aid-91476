export interface Patient {
  id: string;
  name: string;
  registrationNumber: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  contact: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  rehabProgram?: string;
}

export interface ExpenseType {
  id: string;
  name: string;
  description: string;
}

export interface RestockRecord {
  id: string;
  date: string;
  quantity: number;
  unitPrice: number;
  expiryDate?: string;
  batchNumber?: string;
  notes?: string;
}

export interface Medicine {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  minStockLevel: number;
  thresholdLevel?: number;
  expiryDate?: string;
  batchNumber?: string;
  dateAdded: string;
  restockHistory?: RestockRecord[];
}

export interface Expense {
  id: string;
  patientId: string;
  registrationNumber: string;
  expenseTypeId: string;
  expenseTypeName: string;
  date: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  medicineId?: string;
}

export interface Payment {
  id: string;
  patientId: string;
  expenseId: string;
  amount: number;
  date: string;
  method: 'Cash' | 'Card' | 'UPI' | 'Insurance';
  notes?: string;
}
