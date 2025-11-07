/**
 * API Service Layer
 * 
 * This file provides a centralized API service for easy backend integration.
 * Replace mock implementations with actual API calls when backend is ready.
 * 
 * Usage:
 * import { patientAPI, expenseAPI, billingAPI, inventoryAPI, authAPI } from '@/services/api';
 */

import { Patient, Expense, Medicine, Payment } from '@/types';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Generic API request handler
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}

// ==================== AUTH API ====================
export const authAPI = {
  /**
   * Login user
   * POST /auth/login
   */
  login: async (email: string, password: string) => {
    // TODO: Replace with actual API call
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  /**
   * Logout user
   * POST /auth/logout
   */
  logout: async () => {
    // TODO: Replace with actual API call
    return apiRequest('/auth/logout', { method: 'POST' });
  },

  /**
   * Get current user
   * GET /auth/me
   */
  getCurrentUser: async () => {
    // TODO: Replace with actual API call
    return apiRequest('/auth/me');
  },
};

// ==================== PATIENT API ====================
export const patientAPI = {
  /**
   * Get all patients
   * GET /patients
   */
  getAll: async (): Promise<Patient[]> => {
    // TODO: Replace with actual API call
    return apiRequest('/patients');
  },

  /**
   * Get patient by ID
   * GET /patients/:id
   */
  getById: async (id: string): Promise<Patient> => {
    // TODO: Replace with actual API call
    return apiRequest(`/patients/${id}`);
  },

  /**
   * Get patient by registration number
   * GET /patients/registration/:regNumber
   */
  getByRegistration: async (regNumber: string): Promise<Patient> => {
    // TODO: Replace with actual API call
    return apiRequest(`/patients/registration/${regNumber}`);
  },

  /**
   * Create new patient
   * POST /patients
   */
  create: async (patient: Omit<Patient, 'id'>): Promise<Patient> => {
    // TODO: Replace with actual API call
    return apiRequest('/patients', {
      method: 'POST',
      body: JSON.stringify(patient),
    });
  },

  /**
   * Update patient
   * PUT /patients/:id
   */
  update: async (id: string, patient: Partial<Patient>): Promise<Patient> => {
    // TODO: Replace with actual API call
    return apiRequest(`/patients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(patient),
    });
  },

  /**
   * Delete patient
   * DELETE /patients/:id
   */
  delete: async (id: string): Promise<void> => {
    // TODO: Replace with actual API call
    return apiRequest(`/patients/${id}`, { method: 'DELETE' });
  },
};

// ==================== EXPENSE API ====================
export const expenseAPI = {
  /**
   * Get all expenses
   * GET /expenses
   */
  getAll: async (): Promise<Expense[]> => {
    // TODO: Replace with actual API call
    return apiRequest('/expenses');
  },

  /**
   * Get expenses by patient ID
   * GET /expenses/patient/:patientId
   */
  getByPatient: async (patientId: string): Promise<Expense[]> => {
    // TODO: Replace with actual API call
    return apiRequest(`/expenses/patient/${patientId}`);
  },

  /**
   * Get expenses by registration number
   * GET /expenses/registration/:regNumber
   */
  getByRegistration: async (regNumber: string): Promise<Expense[]> => {
    // TODO: Replace with actual API call
    return apiRequest(`/expenses/registration/${regNumber}`);
  },

  /**
   * Create new expense
   * POST /expenses
   */
  create: async (expense: Omit<Expense, 'id'>): Promise<Expense> => {
    // TODO: Replace with actual API call
    return apiRequest('/expenses', {
      method: 'POST',
      body: JSON.stringify(expense),
    });
  },

  /**
   * Update expense
   * PUT /expenses/:id
   */
  update: async (id: string, expense: Partial<Expense>): Promise<Expense> => {
    // TODO: Replace with actual API call
    return apiRequest(`/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(expense),
    });
  },

  /**
   * Delete expense
   * DELETE /expenses/:id
   */
  delete: async (id: string): Promise<void> => {
    // TODO: Replace with actual API call
    return apiRequest(`/expenses/${id}`, { method: 'DELETE' });
  },
};

// ==================== BILLING API ====================
export const billingAPI = {
  /**
   * Generate bill for patient
   * POST /billing/generate
   */
  generateBill: async (data: {
    patientId: string;
    registrationNumber: string;
    expenseIds: string[];
  }) => {
    // TODO: Replace with actual API call
    return apiRequest('/billing/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Process payment
   * POST /billing/payment
   */
  processPayment: async (payment: Omit<Payment, 'id'>): Promise<Payment> => {
    // TODO: Replace with actual API call
    return apiRequest('/billing/payment', {
      method: 'POST',
      body: JSON.stringify(payment),
    });
  },

  /**
   * Get payment history
   * GET /billing/payments/:patientId
   */
  getPaymentHistory: async (patientId: string): Promise<Payment[]> => {
    // TODO: Replace with actual API call
    return apiRequest(`/billing/payments/${patientId}`);
  },
};

// ==================== INVENTORY API ====================
export const inventoryAPI = {
  /**
   * Get all medicines
   * GET /inventory
   */
  getAll: async (): Promise<Medicine[]> => {
    // TODO: Replace with actual API call
    return apiRequest('/inventory');
  },

  /**
   * Get medicine by ID
   * GET /inventory/:id
   */
  getById: async (id: string): Promise<Medicine> => {
    // TODO: Replace with actual API call
    return apiRequest(`/inventory/${id}`);
  },

  /**
   * Create new medicine
   * POST /inventory
   */
  create: async (medicine: Omit<Medicine, 'id'>): Promise<Medicine> => {
    // TODO: Replace with actual API call
    return apiRequest('/inventory', {
      method: 'POST',
      body: JSON.stringify(medicine),
    });
  },

  /**
   * Update medicine
   * PUT /inventory/:id
   */
  update: async (id: string, medicine: Partial<Medicine>): Promise<Medicine> => {
    // TODO: Replace with actual API call
    return apiRequest(`/inventory/${id}`, {
      method: 'PUT',
      body: JSON.stringify(medicine),
    });
  },

  /**
   * Delete medicine
   * DELETE /inventory/:id
   */
  delete: async (id: string): Promise<void> => {
    // TODO: Replace with actual API call
    return apiRequest(`/inventory/${id}`, { method: 'DELETE' });
  },

  /**
   * Restock medicine
   * POST /inventory/:id/restock
   */
  restock: async (id: string, quantity: number, details: any) => {
    // TODO: Replace with actual API call
    return apiRequest(`/inventory/${id}/restock`, {
      method: 'POST',
      body: JSON.stringify({ quantity, ...details }),
    });
  },
};

// ==================== REPORTS API ====================
export const reportsAPI = {
  /**
   * Get patient financial summary
   * GET /reports/patient/:patientId/financial
   */
  getPatientFinancial: async (patientId: string) => {
    // TODO: Replace with actual API call
    return apiRequest(`/reports/patient/${patientId}/financial`);
  },

  /**
   * Get dashboard stats
   * GET /reports/dashboard
   */
  getDashboardStats: async () => {
    // TODO: Replace with actual API call
    return apiRequest('/reports/dashboard');
  },
};
