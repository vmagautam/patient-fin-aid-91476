import { useState, useMemo } from 'react';
import PageHeader from '@/components/Layout/PageHeader';
import BottomNav from '@/components/Layout/BottomNav';
import GlobalSearchBar from '@/components/Search/GlobalSearchBar';
import PatientExpenseCard from '@/components/Expenses/PatientExpenseCard';
import AddExpenseDialog from '@/components/Dialogs/AddExpenseDialog';
import AddMultipleExpensesDialog from '@/components/Dialogs/AddMultipleExpensesDialog';
import DeleteConfirmDialog from '@/components/Dialogs/DeleteConfirmDialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, UserPlus } from 'lucide-react';
import { Expense, Patient, ExpenseType, Medicine } from '@/types';
import { toast } from 'sonner';

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
    expenseTypeId: '1',
    expenseTypeName: 'Medicine',
    date: '2024-03-15',
    description: 'Paracetamol 500mg',
    quantity: 20,
    unitPrice: 2.5,
    totalAmount: 50,
    isPaid: true,
    paidAmount: 50,
    medicineId: '1',
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
    expenseTypeName: 'Diagnostic Test',
    date: '2024-03-13',
    description: 'MRI Scan',
    quantity: 1,
    unitPrice: 500,
    totalAmount: 500,
    isPaid: true,
    paidAmount: 500,
  },
];

const EnhancedExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAddMultipleDialogOpen, setIsAddMultipleDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>(undefined);
  const [deleteExpense, setDeleteExpense] = useState<Expense | undefined>(undefined);

  // Filter by search
  const filteredExpenses = useMemo(() => {
    if (!searchQuery) return expenses;
    
    const query = searchQuery.toLowerCase();
    return expenses.filter((exp) => {
      const patient = mockPatients.find(p => p.id === exp.patientId);
      return (
        exp.description.toLowerCase().includes(query) ||
        exp.expenseTypeName.toLowerCase().includes(query) ||
        patient?.name.toLowerCase().includes(query)
      );
    });
  }, [expenses, searchQuery]);

  // Group expenses by patient
  const expensesByPatient = useMemo(() => {
    const grouped = new Map<string, Expense[]>();
    
    filteredExpenses.forEach((expense) => {
      const existing = grouped.get(expense.patientId) || [];
      grouped.set(expense.patientId, [...existing, expense]);
    });

    // Sort expenses within each patient by date (newest first)
    grouped.forEach((exps, patientId) => {
      grouped.set(
        patientId,
        exps.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      );
    });

    return grouped;
  }, [filteredExpenses]);

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

  const totalAmount = filteredExpenses.reduce((sum, exp) => sum + exp.totalAmount, 0);
  const paidAmount = filteredExpenses.reduce((sum, exp) => sum + exp.paidAmount, 0);

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader
        title="Patient Services"
        subtitle={`$${totalAmount.toFixed(2)} total • $${paidAmount.toFixed(2)} paid`}
        action={
          <div className="flex gap-2">
            <Button 
              size="icon" 
              variant="outline"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              onClick={() => setIsAddMultipleDialogOpen(true)}
              title="Add multiple services"
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
            placeholder="Search by patient, service type, description..."
            onClear={() => setSearchQuery('')}
          />
        </div>

        {/* Expenses grouped by Patient */}
        <div className="space-y-4">
          {Array.from(expensesByPatient.entries()).map(([patientId, patientExpenses]) => {
            const patient = mockPatients.find(p => p.id === patientId);
            if (!patient) return null;

            return (
              <PatientExpenseCard
                key={patientId}
                patient={patient}
                expenses={patientExpenses}
                onExpenseEdit={handleEditExpense}
                onExpenseDelete={setDeleteExpense}
              />
            );
          })}

          {filteredExpenses.length === 0 && (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                No services found. Add services for your patients to get started.
              </p>
              <Button 
                className="mt-4"
                onClick={() => setIsAddMultipleDialogOpen(true)}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Services for Patient
              </Button>
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
