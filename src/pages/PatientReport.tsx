import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '@/components/Layout/PageHeader';
import BottomNav from '@/components/Layout/BottomNav';
import DateRangeFilter from '@/components/Reports/DateRangeFilter';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DollarSign, Calendar, CheckCircle, XCircle, Download } from 'lucide-react';
import { Expense, Patient } from '@/types';
import { isWithinInterval } from 'date-fns';

// Mock data (same as other pages)
const mockPatients: Patient[] = [
  {
    id: '1',
    name: 'John Smith',
    registrationNumber: 'REG-2024-001',
    age: 45,
    gender: 'Male',
    contact: '+1 234-567-8900',
    startDate: '2024-01-15',
    isActive: true,
    rehabProgram: 'Physical Therapy',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    registrationNumber: 'REG-2024-002',
    age: 32,
    gender: 'Female',
    contact: '+1 234-567-8901',
    startDate: '2024-02-01',
    endDate: '2024-03-15',
    isActive: false,
    rehabProgram: 'Cardiac Rehab',
  },
  {
    id: '3',
    name: 'Michael Brown',
    registrationNumber: 'REG-2024-003',
    age: 58,
    gender: 'Male',
    contact: '+1 234-567-8902',
    startDate: '2024-02-20',
    isActive: true,
    rehabProgram: 'Neurological Rehab',
  },
];

const mockExpenses: Expense[] = [
  {
    id: '1',
    patientId: '1',
    registrationNumber: 'REG-2024-001',
    expenseTypeId: '1',
    expenseTypeName: 'Medicine',
    date: '2024-03-15',
    description: 'Paracetamol 500mg',
    quantity: 20,
    unitPrice: 2.5,
    totalAmount: 50,
    isPaid: true,
    paidAmount: 50,
  },
  {
    id: '2',
    patientId: '1',
    registrationNumber: 'REG-2024-001',
    expenseTypeId: '2',
    expenseTypeName: 'Rehab Session',
    date: '2024-03-14',
    description: 'Physical therapy session',
    quantity: 1,
    unitPrice: 150,
    totalAmount: 150,
    isPaid: false,
    paidAmount: 0,
  },
  {
    id: '3',
    patientId: '3',
    registrationNumber: 'REG-2024-003',
    expenseTypeId: '3',
    expenseTypeName: 'Doctor Test',
    date: '2024-03-13',
    description: 'MRI Scan',
    quantity: 1,
    unitPrice: 500,
    totalAmount: 500,
    isPaid: true,
    paidAmount: 500,
  },
  {
    id: '4',
    patientId: '2',
    registrationNumber: 'REG-2024-002',
    expenseTypeId: '1',
    expenseTypeName: 'Medicine',
    date: '2024-03-12',
    description: 'Blood pressure medication',
    quantity: 30,
    unitPrice: 3,
    totalAmount: 90,
    isPaid: false,
    paidAmount: 45,
  },
  {
    id: '5',
    patientId: '1',
    registrationNumber: 'REG-2024-001',
    expenseTypeId: '2',
    expenseTypeName: 'Rehab Session',
    date: '2024-02-28',
    description: 'Physical therapy session',
    quantity: 1,
    unitPrice: 150,
    totalAmount: 150,
    isPaid: true,
    paidAmount: 150,
  },
  {
    id: '6',
    patientId: '1',
    registrationNumber: 'REG-2024-001',
    expenseTypeId: '1',
    expenseTypeName: 'Medicine',
    date: '2024-02-15',
    description: 'Pain relief medication',
    quantity: 15,
    unitPrice: 4,
    totalAmount: 60,
    isPaid: true,
    paidAmount: 60,
  },
];

const PatientReport = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const patient = mockPatients.find((p) => p.id === patientId);

  const patientExpenses = useMemo(() => {
    let expenses = mockExpenses.filter((exp) => exp.patientId === patientId);

    // Apply date filter
    if (startDate && endDate) {
      expenses = expenses.filter((exp) => {
        const expenseDate = new Date(exp.date);
        return isWithinInterval(expenseDate, { start: startDate, end: endDate });
      });
    } else if (startDate) {
      expenses = expenses.filter((exp) => new Date(exp.date) >= startDate);
    } else if (endDate) {
      expenses = expenses.filter((exp) => new Date(exp.date) <= endDate);
    }

    return expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [patientId, startDate, endDate]);

  if (!patient) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Patient not found</h2>
          <Button onClick={() => navigate('/reports')}>Back to Reports</Button>
        </div>
      </div>
    );
  }

  const totalExpenses = patientExpenses.reduce((sum, exp) => sum + exp.totalAmount, 0);
  const paidAmount = patientExpenses.reduce((sum, exp) => sum + exp.paidAmount, 0);
  const unpaidAmount = totalExpenses - paidAmount;

  const expensesByType = patientExpenses.reduce((acc, exp) => {
    if (!acc[exp.expenseTypeName]) {
      acc[exp.expenseTypeName] = 0;
    }
    acc[exp.expenseTypeName] += exp.totalAmount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader
        title={patient.name}
        subtitle="Expense Report"
        showBack
      />

      <div className="max-w-md mx-auto px-4 py-4">
        {/* Patient Info Summary */}
        <Card className="p-4 mb-4 shadow-soft bg-gradient-primary text-primary-foreground">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-lg font-semibold">{patient.name}</h3>
              <p className="text-sm opacity-90">
                {patient.age} years • {patient.gender}
              </p>
            </div>
            <Badge variant={patient.isActive ? 'default' : 'secondary'} className="bg-white/20">
              {patient.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          {patient.rehabProgram && (
            <p className="text-sm opacity-90">{patient.rehabProgram}</p>
          )}
        </Card>

        {/* Date Range Filter */}
        <Card className="p-4 mb-4 shadow-soft">
          <DateRangeFilter
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onClear={() => {
              setStartDate(undefined);
              setEndDate(undefined);
            }}
          />
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <Card className="p-3 shadow-soft text-center">
            <div className="text-2xl font-bold text-foreground">${totalExpenses.toFixed(0)}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </Card>
          <Card className="p-3 shadow-soft text-center">
            <div className="text-2xl font-bold text-success">${paidAmount.toFixed(0)}</div>
            <div className="text-xs text-muted-foreground">Paid</div>
          </Card>
          <Card className="p-3 shadow-soft text-center">
            <div className="text-2xl font-bold text-warning">${unpaidAmount.toFixed(0)}</div>
            <div className="text-xs text-muted-foreground">Pending</div>
          </Card>
        </div>

        {/* Expense Breakdown by Type */}
        <Card className="p-4 mb-4 shadow-soft">
          <h3 className="font-semibold mb-3">Expense Breakdown</h3>
          <div className="space-y-3">
            {Object.entries(expensesByType).map(([type, amount]) => {
              const percentage = (amount / totalExpenses) * 100;
              return (
                <div key={type}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-muted-foreground">{type}</span>
                    <span className="font-medium">${amount.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Detailed Expense List */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">All Expenses ({patientExpenses.length})</h3>
            <Button size="sm" variant="outline">
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>

          <div className="space-y-3">
            {patientExpenses.map((expense) => (
              <Card key={expense.id} className="p-4 shadow-soft">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {expense.expenseTypeName}
                      </Badge>
                    </div>
                    <h4 className="font-semibold text-foreground">{expense.description}</h4>
                  </div>
                  {expense.isPaid ? (
                    <CheckCircle className="h-5 w-5 text-success" />
                  ) : (
                    <XCircle className="h-5 w-5 text-warning" />
                  )}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(expense.date).toLocaleDateString()}</span>
                    </div>
                    <span className="text-muted-foreground">
                      {expense.quantity} × ${expense.unitPrice.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-foreground">
                        ${expense.totalAmount.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-muted-foreground">Paid: </span>
                      <span className="font-medium text-success">
                        ${expense.paidAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            {patientExpenses.length === 0 && (
              <Card className="p-8 text-center shadow-soft">
                <p className="text-muted-foreground">
                  No expenses found for the selected date range
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default PatientReport;
