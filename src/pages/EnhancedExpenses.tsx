import { useState, useMemo } from 'react';
import PageHeader from '@/components/Layout/PageHeader';
import BottomNav from '@/components/Layout/BottomNav';
import GlobalSearchBar from '@/components/Search/GlobalSearchBar';
import AddExpenseDialog from '@/components/Dialogs/AddExpenseDialog';
import AddMultipleExpensesDialog from '@/components/Dialogs/AddMultipleExpensesDialog';
import DeleteConfirmDialog from '@/components/Dialogs/DeleteConfirmDialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, UserPlus, DollarSign, Calendar, CheckCircle, XCircle, Edit, Trash2, User } from 'lucide-react';
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

const EnhancedExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses);
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAddMultipleDialogOpen, setIsAddMultipleDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>(undefined);
  const [deleteExpense, setDeleteExpense] = useState<Expense | undefined>(undefined);

  // Filter and sort expenses
  const filteredExpenses = useMemo(() => {
    let filtered = expenses;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((exp) => {
        const patient = mockPatients.find(p => p.id === exp.patientId);
        return (
          exp.description.toLowerCase().includes(query) ||
          exp.expenseTypeName.toLowerCase().includes(query) ||
          patient?.name.toLowerCase().includes(query)
        );
      });
    }

    // Payment filter
    if (paymentFilter === 'paid') {
      filtered = filtered.filter(exp => exp.isPaid);
    } else if (paymentFilter === 'unpaid') {
      filtered = filtered.filter(exp => !exp.isPaid);
    }

    // Sort by date (newest first)
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, searchQuery, paymentFilter]);

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
  const unpaidAmount = totalAmount - paidAmount;

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader
        title="Patient Services"
        subtitle={`${filteredExpenses.length} service${filteredExpenses.length !== 1 ? 's' : ''}`}
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
            placeholder="Search by patient, service type, description..."
            onClear={() => setSearchQuery('')}
          />
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <Card className="p-4 text-center shadow-soft">
            <div className="text-2xl font-bold text-foreground">${totalAmount.toFixed(0)}</div>
            <div className="text-xs text-muted-foreground mt-1">Total</div>
          </Card>
          <Card className="p-4 text-center shadow-soft">
            <div className="text-2xl font-bold text-success">${paidAmount.toFixed(0)}</div>
            <div className="text-xs text-muted-foreground mt-1">Paid</div>
          </Card>
          <Card className="p-4 text-center shadow-soft">
            <div className="text-2xl font-bold text-warning">${unpaidAmount.toFixed(0)}</div>
            <div className="text-xs text-muted-foreground mt-1">Pending</div>
          </Card>
        </div>

        {/* Payment Filter Tabs */}
        <Tabs value={paymentFilter} onValueChange={(v) => setPaymentFilter(v as typeof paymentFilter)} className="w-full mb-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="paid">Paid</TabsTrigger>
            <TabsTrigger value="unpaid">Unpaid</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Expenses List */}
        <div className="space-y-3">
          {filteredExpenses.map((expense) => {
            const patient = mockPatients.find(p => p.id === expense.patientId);
            
            return (
              <Card key={expense.id} className="p-4 shadow-soft hover:shadow-medium transition-all">
                {/* Header with Patient Info */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-primary/10 p-1.5 rounded-full">
                        <User className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <span className="text-sm font-semibold text-primary">{patient?.name}</span>
                      {expense.isPaid ? (
                        <CheckCircle className="h-4 w-4 text-success ml-auto" />
                      ) : (
                        <XCircle className="h-4 w-4 text-warning ml-auto" />
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {expense.expenseTypeName}
                      </Badge>
                    </div>
                    
                    <h3 className="font-semibold text-base text-foreground">{expense.description}</h3>
                  </div>
                </div>

                {/* Details */}
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
                      <span className="font-semibold text-lg text-foreground">
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

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1 h-10"
                      onClick={() => handleEditExpense(expense)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1 h-10 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => setDeleteExpense(expense)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}

          {filteredExpenses.length === 0 && (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground mb-4">
                {searchQuery || paymentFilter !== 'all' 
                  ? 'No services found matching your filters' 
                  : 'No services recorded yet'}
              </p>
              <Button 
                onClick={() => setIsAddMultipleDialogOpen(true)}
                className="mt-2"
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
