import { useState, useMemo } from 'react';
import PageHeader from '@/components/Layout/PageHeader';
import BottomNav from '@/components/Layout/BottomNav';
import GlobalSearchBar from '@/components/Search/GlobalSearchBar';
import AddExpenseDialog from '@/components/Dialogs/AddExpenseDialog';
import AddMultipleExpensesDialog from '@/components/Dialogs/AddMultipleExpensesDialog';
import DeleteConfirmDialog from '@/components/Dialogs/DeleteConfirmDialog';
import DateRangeFilter from '@/components/Reports/DateRangeFilter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Plus, UserPlus, DollarSign, Calendar, CheckCircle, XCircle, Edit, Trash2, User, FileText, Clock } from 'lucide-react';
import { Expense, Patient, ExpenseType, Medicine } from '@/types';
import { toast } from 'sonner';

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

const mockExpenseTypes: ExpenseType[] = [
  { id: '1', name: 'Medicine', description: 'Pharmaceutical medications and drugs' },
  { id: '2', name: 'Rehab Session', description: 'Physical therapy and rehabilitation sessions' },
  { id: '3', name: 'Diagnostic Test', description: 'Medical tests and diagnostics' },
  { id: '4', name: 'Consultation', description: 'Doctor consultations and check-ups' },
];

const mockMedicines: Medicine[] = [
  { id: '1', name: 'Paracetamol 500mg', category: 'Pain Relief', price: 2.5, stock: 150, minStockLevel: 50, expiryDate: '2025-12-31', dateAdded: '2024-01-15' },
  { id: '2', name: 'Ibuprofen 400mg', category: 'Anti-inflammatory', price: 3.0, stock: 80, minStockLevel: 20, expiryDate: '2025-06-30', dateAdded: '2024-02-10' },
  { id: '3', name: 'Amoxicillin 250mg', category: 'Antibiotic', price: 5.5, stock: 75, minStockLevel: 30, expiryDate: '2024-11-30', dateAdded: '2024-01-20' },
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
    medicineId: '1',
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
  },
  {
    id: '3',
    patientId: '3',
    registrationNumber: 'REG-2024-003',
    expenseTypeId: '3',
    expenseTypeName: 'Diagnostic Test',
    date: '2024-03-13',
    description: 'MRI Scan',
    quantity: 1,
    unitPrice: 500,
    totalAmount: 500,
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
  },
];

// Grouped expense type for display
type GroupedExpense = {
  patientId: string;
  patientName: string;
  registrationNumber: string;
  date: string;
  expenses: Expense[];
  totalAmount: number;
};

const EnhancedExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses);
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAddMultipleDialogOpen, setIsAddMultipleDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>(undefined);
  const [deleteExpense, setDeleteExpense] = useState<Expense | undefined>(undefined);

  // Filter and group expenses
  const groupedExpenses = useMemo(() => {
    let filtered = expenses;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((exp) => {
        const patient = mockPatients.find(p => p.id === exp.patientId);
        return (
          exp.description.toLowerCase().includes(query) ||
          exp.expenseTypeName.toLowerCase().includes(query) ||
          patient?.name.toLowerCase().includes(query) ||
          exp.registrationNumber.toLowerCase().includes(query)
        );
      });
    }

    // Date range filter
    if (startDate) {
      const startStr = startDate.toISOString().split('T')[0];
      filtered = filtered.filter(exp => exp.date >= startStr);
    }
    if (endDate) {
      const endStr = endDate.toISOString().split('T')[0];
      filtered = filtered.filter(exp => exp.date <= endStr);
    }

    // Group by registration number + date
    const grouped = filtered.reduce((acc, expense) => {
      const key = `${expense.registrationNumber}-${expense.date}`;
      if (!acc[key]) {
        const patient = mockPatients.find(p => p.registrationNumber === expense.registrationNumber);
        acc[key] = {
          patientId: expense.patientId,
          patientName: patient?.name || 'Unknown Patient',
          registrationNumber: expense.registrationNumber,
          date: expense.date,
          expenses: [],
          totalAmount: 0,
        };
      }
      
      acc[key].expenses.push(expense);
      acc[key].totalAmount += expense.totalAmount;
      
      return acc;
    }, {} as Record<string, GroupedExpense>);

    // Convert to array and sort by date (newest first)
    return Object.values(grouped).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [expenses, searchQuery, startDate, endDate]);

  const handleSaveExpense = (expenseData: Omit<Expense, 'id'>) => {
    if (editingExpense) {
      setExpenses(expenses.map(e => e.id === editingExpense.id ? { ...expenseData, id: e.id } : e));
      toast.success('Service updated successfully');
      setEditingExpense(undefined);
    } else {
      const newExpense: Expense = {
        ...expenseData,
        id: Date.now().toString(),
      };
      setExpenses([newExpense, ...expenses]);
      toast.success('Service added successfully');
    }
    setIsAddDialogOpen(false);
  };

  const handleSaveMultipleExpenses = (expensesData: Omit<Expense, 'id'>[]) => {
    const newExpenses: Expense[] = expensesData.map((expenseData, index) => ({
      ...expenseData,
      id: (Date.now() + index).toString(),
    }));
    setExpenses([...newExpenses, ...expenses]);
    setIsAddMultipleDialogOpen(false);
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setIsAddDialogOpen(true);
  };

  const handleDeleteExpense = () => {
    if (deleteExpense) {
      setExpenses(expenses.filter(e => e.id !== deleteExpense.id));
      toast.success('Service deleted successfully');
      setDeleteExpense(undefined);
    }
  };

  const totalAmount = groupedExpenses.reduce((sum, group) => sum + group.totalAmount, 0);

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader
        title="Services"
        subtitle={`${groupedExpenses.length} service record${groupedExpenses.length !== 1 ? 's' : ''}`}
        action={
          <div className="flex gap-2">
            <Button 
              size="icon" 
              variant="outline"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              onClick={() => setIsAddMultipleDialogOpen(true)}
              title="Add multiple services for patient"
            >
              <UserPlus className="h-5 w-5" />
            </Button>
            <Button 
              size="icon" 
              className="bg-white/20 hover:bg-white/30 text-white border-0"
              onClick={() => {
                setEditingExpense(undefined);
                setIsAddDialogOpen(true);
              }}
              title="Add single service"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        }
      />

      <div className="max-w-md mx-auto px-4 py-4">
        {/* Search Bar */}
        <div className="mb-4">
          <GlobalSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by patient, registration no., service..."
            onClear={() => setSearchQuery('')}
          />
        </div>

        {/* Date Range Filter */}
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

        {/* Summary Stats */}
        <Card className="p-4 text-center shadow-soft mb-4">
          <div className="text-2xl font-bold text-foreground">${totalAmount.toFixed(0)}</div>
          <div className="text-xs text-muted-foreground mt-1">Total Services Value</div>
        </Card>

        {/* Service Records List */}
        <div className="space-y-4">
          {groupedExpenses.map((group, idx) => (
            <Card key={`${group.patientId}-${group.date}-${idx}`} className="overflow-hidden shadow-soft">
              {/* Record Header */}
              <div className="bg-muted/50 px-4 py-3 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base text-foreground">{group.patientName}</h3>
                      <p className="text-xs text-muted-foreground">Reg: {group.registrationNumber}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(group.date).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Line Items */}
              <div className="px-4 py-3">
                <div className="space-y-2">
                  {group.expenses.map((expense) => (
                    <div key={expense.id} className="flex items-start justify-between py-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className="text-xs">
                            {expense.expenseTypeName}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium text-foreground">{expense.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Qty: {expense.quantity} × ${expense.unitPrice.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-sm font-semibold text-foreground">
                          ${expense.totalAmount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-3" />

                {/* Totals Section */}
                <div className="flex items-center justify-between pt-2">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="font-bold text-lg text-foreground">
                    ${group.totalAmount.toFixed(2)}
                  </span>
                </div>

                {/* Action Buttons - Edit/Delete each service */}
                <div className="space-y-2 mt-4 pt-3 border-t border-border">
                  {group.expenses.map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between bg-muted/30 p-2 rounded-lg">
                      <span className="text-sm text-muted-foreground">{expense.description}</span>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleEditExpense(expense)}
                        >
                          <Edit className="h-3.5 w-3.5 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleteExpense(expense)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}

          {groupedExpenses.length === 0 && (
            <Card className="p-8 text-center">
              <div className="flex flex-col items-center">
                <div className="bg-muted/50 p-4 rounded-full mb-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground mb-2 font-medium">
                  {searchQuery || paymentFilter !== 'all' || startDate || endDate
                    ? 'No billing statements found' 
                    : 'No services recorded yet'}
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  {searchQuery || paymentFilter !== 'all' || startDate || endDate
                    ? 'Try adjusting your filters' 
                    : 'Start by adding services for a patient'}
                </p>
                <Button 
                  onClick={() => setIsAddMultipleDialogOpen(true)}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Patient Services
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Add/Edit Single Expense Dialog */}
      <AddExpenseDialog
        open={isAddDialogOpen}
        onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) setEditingExpense(undefined);
        }}
        onSave={handleSaveExpense}
        patients={mockPatients}
        expenseTypes={mockExpenseTypes}
        editExpense={editingExpense}
      />

      {/* Add Multiple Expenses Dialog */}
      <AddMultipleExpensesDialog
        open={isAddMultipleDialogOpen}
        onOpenChange={setIsAddMultipleDialogOpen}
        onSave={handleSaveMultipleExpenses}
        patients={mockPatients}
        expenseTypes={mockExpenseTypes}
        medicines={mockMedicines}
      />

      <DeleteConfirmDialog
        open={!!deleteExpense}
        onOpenChange={() => setDeleteExpense(undefined)}
        onConfirm={handleDeleteExpense}
        title="Delete Service"
        description={`Are you sure you want to delete this ${deleteExpense?.expenseTypeName} service? This action cannot be undone.`}
      />

      <BottomNav />
    </div>
  );
};

export default EnhancedExpenses;
