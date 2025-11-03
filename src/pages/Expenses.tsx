import { useState } from 'react';
import PageHeader from '@/components/Layout/PageHeader';
import BottomNav from '@/components/Layout/BottomNav';
import AddExpenseDialog from '@/components/Dialogs/AddExpenseDialog';
import DeleteConfirmDialog from '@/components/Dialogs/DeleteConfirmDialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, DollarSign, Calendar, CheckCircle, XCircle, Edit, Trash2 } from 'lucide-react';
import { Expense, Patient, ExpenseType } from '@/types';
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

const mockExpenseTypes: ExpenseType[] = [
  { id: '1', name: 'Medicine', description: 'Pharmaceutical medications and drugs' },
  { id: '2', name: 'Rehab Session', description: 'Physical therapy and rehabilitation sessions' },
  { id: '3', name: 'Doctor Test', description: 'Medical tests and diagnostics' },
  { id: '4', name: 'Consultation', description: 'Doctor consultations and check-ups' },
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
];

const Expenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses);
  const [filter, setFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>(undefined);
  const [deleteExpense, setDeleteExpense] = useState<Expense | undefined>(undefined);

  const filteredExpenses = expenses.filter(expense => {
    if (filter === 'all') return true;
    if (filter === 'paid') return expense.isPaid;
    if (filter === 'unpaid') return !expense.isPaid;
    return true;
  });

  const totalAmount = filteredExpenses.reduce((sum, exp) => sum + exp.totalAmount, 0);
  const paidAmount = filteredExpenses.reduce((sum, exp) => sum + exp.paidAmount, 0);

  const handleAddExpense = (expenseData: Omit<Expense, 'id'>) => {
    if (editingExpense) {
      setExpenses(expenses.map(e => e.id === editingExpense.id ? { ...expenseData, id: e.id } : e));
      setEditingExpense(undefined);
    } else {
      const newExpense: Expense = {
        ...expenseData,
        id: Date.now().toString(),
      };
      setExpenses([newExpense, ...expenses]);
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setIsAddDialogOpen(true);
  };

  const handleDeleteExpense = () => {
    if (deleteExpense) {
      setExpenses(expenses.filter(e => e.id !== deleteExpense.id));
      toast.success('Expense deleted successfully');
      setDeleteExpense(undefined);
    }
  };

  const handleDialogClose = () => {
    setIsAddDialogOpen(false);
    setEditingExpense(undefined);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader
        title="Expenses"
        subtitle={`$${totalAmount.toFixed(2)} total • $${paidAmount.toFixed(2)} paid`}
        action={
          <Button 
            size="icon" 
            className="bg-white/20 hover:bg-white/30 text-white"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="h-5 w-5" />
          </Button>
        }
      />

      <div className="max-w-md mx-auto px-4 py-4">
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
            className="flex-1"
          >
            All
          </Button>
          <Button
            variant={filter === 'paid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('paid')}
            className="flex-1"
          >
            Paid
          </Button>
          <Button
            variant={filter === 'unpaid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('unpaid')}
            className="flex-1"
          >
            Unpaid
          </Button>
        </div>

        {/* Expense Cards */}
        <div className="space-y-3">
          {filteredExpenses.map((expense) => (
            <Card key={expense.id} className="p-4 shadow-soft hover:shadow-medium transition-all">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      {expense.expenseTypeName}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-foreground">{expense.description}</h3>
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

                <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleEditExpense(expense)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => setDeleteExpense(expense)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <AddExpenseDialog
        open={isAddDialogOpen}
        onOpenChange={handleDialogClose}
        onSave={handleAddExpense}
        patients={mockPatients}
        expenseTypes={mockExpenseTypes}
        editExpense={editingExpense}
      />

      <DeleteConfirmDialog
        open={!!deleteExpense}
        onOpenChange={() => setDeleteExpense(undefined)}
        onConfirm={handleDeleteExpense}
        title="Delete Expense"
        description={`Are you sure you want to delete this ${deleteExpense?.expenseTypeName} expense? This action cannot be undone.`}
      />

      <BottomNav />
    </div>
  );
};

export default Expenses;
