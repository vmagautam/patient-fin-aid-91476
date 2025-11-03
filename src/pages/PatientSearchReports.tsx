import { useState, useMemo } from 'react';
import PageHeader from '@/components/Layout/PageHeader';
import BottomNav from '@/components/Layout/BottomNav';
import GlobalSearchBar from '@/components/Search/GlobalSearchBar';
import DateRangeFilter from '@/components/Reports/DateRangeFilter';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { FileText, Calendar, DollarSign, CheckCircle, Clock, Download, User, Phone, Activity } from 'lucide-react';
import { Patient, Expense } from '@/types';
import { isWithinInterval } from 'date-fns';

// Mock data
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
  {
    id: '4',
    name: 'John Smith',
    registrationNumber: 'REG-2024-004',
    age: 46,
    gender: 'Male',
    contact: '+1 234-567-8900',
    startDate: '2024-11-01',
    isActive: true,
    rehabProgram: 'Physical Therapy',
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
    expenseTypeId: '4',
    expenseTypeName: 'Consultation',
    date: '2024-03-10',
    description: 'Doctor consultation',
    quantity: 1,
    unitPrice: 100,
    totalAmount: 100,
    isPaid: true,
    paidAmount: 100,
  },
  {
    id: '6',
    patientId: '4',
    registrationNumber: 'REG-2024-004',
    expenseTypeId: '2',
    expenseTypeName: 'Rehab Session',
    date: '2024-11-05',
    description: 'Physical therapy session - readmission',
    quantity: 1,
    unitPrice: 150,
    totalAmount: 150,
    isPaid: true,
    paidAmount: 150,
  },
];

const PatientSearchReports = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  // Filter patients by search
  const searchedPatients = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    return mockPatients.filter((patient) =>
      patient.name.toLowerCase().includes(query) ||
      patient.registrationNumber.toLowerCase().includes(query) ||
      patient.contact.includes(query)
    );
  }, [searchQuery]);

  // Get expenses for searched patients with date filtering
  const getPatientExpenses = (registrationNumber: string) => {
    let expenses = mockExpenses.filter((exp) => exp.registrationNumber === registrationNumber);

    if (startDate || endDate) {
      expenses = expenses.filter((exp) => {
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
    }

    return expenses;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader
        title="Patient Reports"
        subtitle="Search by patient name or registration number"
      />

      <div className="max-w-md mx-auto px-4 py-4">
        {/* Search Bar */}
        <div className="mb-4">
          <GlobalSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search patient name or registration number..."
            onClear={() => setSearchQuery('')}
          />
        </div>

        {/* Date Range Filter */}
        {searchedPatients.length > 0 && (
          <div className="mb-4">
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
          </div>
        )}

        {/* Search Results */}
        {searchQuery.trim() === '' ? (
          <Card className="p-8 text-center">
            <div className="flex flex-col items-center">
              <div className="bg-muted/50 p-4 rounded-full mb-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-medium mb-2">
                Search for a patient
              </p>
              <p className="text-xs text-muted-foreground">
                Enter patient name or registration number to view their complete history
              </p>
            </div>
          </Card>
        ) : searchedPatients.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="flex flex-col items-center">
              <div className="bg-muted/50 p-4 rounded-full mb-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-medium mb-2">
                No patients found
              </p>
              <p className="text-xs text-muted-foreground">
                Try searching with a different name or registration number
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {searchedPatients.map((patient) => {
              const expenses = getPatientExpenses(patient.registrationNumber);
              const totalAmount = expenses.reduce((sum, exp) => sum + exp.totalAmount, 0);
              const paidAmount = expenses.reduce((sum, exp) => sum + exp.paidAmount, 0);
              const unpaidAmount = totalAmount - paidAmount;

              return (
                <Card key={patient.id} className="overflow-hidden shadow-soft">
                  {/* Patient Header */}
                  <div className="bg-primary/10 px-4 py-4 border-b border-border">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-lg text-foreground">{patient.name}</h3>
                        <p className="text-sm text-muted-foreground">Reg: {patient.registrationNumber}</p>
                      </div>
                      <Badge variant={patient.isActive ? 'default' : 'secondary'}>
                        {patient.isActive ? 'Active' : 'Discharged'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="h-3.5 w-3.5" />
                        <span>{patient.age}y • {patient.gender}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-3.5 w-3.5" />
                        <span>{patient.contact}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Activity className="h-3.5 w-3.5" />
                        <span>{patient.rehabProgram}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{new Date(patient.startDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Financial Summary */}
                  <div className="px-4 py-4 bg-muted/30">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center">
                        <div className="text-lg font-bold text-foreground">${totalAmount.toFixed(0)}</div>
                        <div className="text-xs text-muted-foreground">Total</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-success">${paidAmount.toFixed(0)}</div>
                        <div className="text-xs text-muted-foreground">Paid</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-warning">${unpaidAmount.toFixed(0)}</div>
                        <div className="text-xs text-muted-foreground">Pending</div>
                      </div>
                    </div>
                  </div>

                  {/* Expense Details */}
                  {expenses.length > 0 ? (
                    <div className="px-4 py-4">
                      <h4 className="font-semibold text-sm mb-3 text-foreground">Service History</h4>
                      <div className="space-y-3">
                        {expenses.map((expense) => (
                          <div key={expense.id} className="flex items-start justify-between pb-3 border-b border-border last:border-0">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="secondary" className="text-xs">
                                  {expense.expenseTypeName}
                                </Badge>
                                {expense.isPaid ? (
                                  <CheckCircle className="h-3 w-3 text-success" />
                                ) : (
                                  <Clock className="h-3 w-3 text-warning" />
                                )}
                              </div>
                              <p className="text-sm font-medium text-foreground">{expense.description}</p>
                              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                <span>Qty: {expense.quantity}</span>
                                <span>•</span>
                                <span>${expense.unitPrice.toFixed(2)} each</span>
                                <span>•</span>
                                <span>{new Date(expense.date).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <div className="text-right ml-4">
                              <p className="text-sm font-semibold text-foreground">
                                ${expense.totalAmount.toFixed(2)}
                              </p>
                              {!expense.isPaid && expense.paidAmount > 0 && (
                                <p className="text-xs text-success mt-0.5">
                                  ${expense.paidAmount.toFixed(2)} paid
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      <Separator className="my-4" />

                      {/* Totals */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Total Amount</span>
                          <span className="font-semibold text-foreground">${totalAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Amount Paid</span>
                          <span className="font-semibold text-success">${paidAmount.toFixed(2)}</span>
                        </div>
                        {unpaidAmount > 0 && (
                          <div className="flex items-center justify-between pt-2 border-t border-border">
                            <span className="font-semibold text-foreground">Amount Due</span>
                            <span className="font-bold text-lg text-warning">
                              ${unpaidAmount.toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>

                      <Button className="w-full mt-4" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export Report
                      </Button>
                    </div>
                  ) : (
                    <div className="px-4 py-6 text-center">
                      <p className="text-sm text-muted-foreground">
                        No expenses recorded
                        {(startDate || endDate) && ' for selected date range'}
                      </p>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default PatientSearchReports;
