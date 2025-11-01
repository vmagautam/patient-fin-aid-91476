import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/Layout/PageHeader';
import BottomNav from '@/components/Layout/BottomNav';
import PatientExpenseCard from '@/components/Reports/PatientExpenseCard';
import DateRangeFilter from '@/components/Reports/DateRangeFilter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, TrendingUp, Users, Package, Download, Plus } from 'lucide-react';
import { Patient, Expense } from '@/types';
import { isWithinInterval } from 'date-fns';

// Mock data
const mockPatients: Patient[] = [
  {
    id: '1',
    name: 'John Smith',
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
];

const Reports = () => {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  // Filter expenses by date range
  const filteredExpenses = useMemo(() => {
    if (!startDate && !endDate) return mockExpenses;

    return mockExpenses.filter((exp) => {
      const expenseDate = new Date(exp.date);
      if (startDate && endDate) {
        return isWithinInterval(expenseDate, { start: startDate, end: endDate });
      } else if (startDate) {
        return expenseDate >= startDate;
      } else if (endDate) {
        return expenseDate <= endDate;
      }
      return true;
    });
  }, [startDate, endDate]);

  // Calculate patient-specific statistics
  const patientStats = useMemo(() => {
    return mockPatients.map((patient) => {
      const expenses = filteredExpenses.filter((exp) => exp.patientId === patient.id);
      const totalExpenses = expenses.reduce((sum, exp) => sum + exp.totalAmount, 0);
      const paidAmount = expenses.reduce((sum, exp) => sum + exp.paidAmount, 0);
      const unpaidAmount = totalExpenses - paidAmount;

      return {
        patient,
        totalExpenses,
        paidAmount,
        unpaidAmount,
        expenseCount: expenses.length,
      };
    });
  }, [filteredExpenses]);

  const totalRevenue = filteredExpenses.reduce((sum, exp) => sum + exp.paidAmount, 0);
  const pendingPayments = filteredExpenses.reduce((sum, exp) => sum + (exp.totalAmount - exp.paidAmount), 0);
  const activePatients = mockPatients.filter((p) => p.isActive).length;

  const stats = [
    { label: 'Total Revenue', value: `$${totalRevenue.toFixed(0)}`, icon: DollarSign, trend: '+12%', color: 'text-primary' },
    { label: 'Active Patients', value: activePatients.toString(), icon: Users, trend: '+3', color: 'text-secondary' },
    { label: 'Pending Payments', value: `$${pendingPayments.toFixed(0)}`, icon: TrendingUp, trend: '-5%', color: 'text-warning' },
    { label: 'Total Expenses', value: filteredExpenses.length.toString(), icon: Package, trend: 'recorded', color: 'text-accent' },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader
        title="Reports & Analytics"
        subtitle={`${patientStats.length} patients • ${filteredExpenses.length} expenses`}
        action={
          <Button 
            size="icon" 
            className="bg-white/20 hover:bg-white/30 text-white"
            onClick={() => navigate('/expenses')}
          >
            <Plus className="h-5 w-5" />
          </Button>
        }
      />

      <div className="max-w-md mx-auto px-4 py-4">
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

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="p-4 shadow-soft">
                <div className="flex items-start justify-between mb-2">
                  <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-1">{stat.value}</h3>
                <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                <span className={`text-xs font-medium ${stat.color}`}>{stat.trend}</span>
              </Card>
            );
          })}
        </div>

        {/* Patient Reports */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Patient Reports</h2>
            <Button size="sm" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export All
            </Button>
          </div>

          {patientStats.map(({ patient, totalExpenses, paidAmount, unpaidAmount, expenseCount }) => (
            <PatientExpenseCard
              key={patient.id}
              patient={patient}
              totalExpenses={totalExpenses}
              paidAmount={paidAmount}
              unpaidAmount={unpaidAmount}
              expenseCount={expenseCount}
              onClick={() => navigate(`/reports/patient/${patient.id}`)}
            />
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Reports;
