import { useState } from 'react';
import PageHeader from '@/components/Layout/PageHeader';
import BottomNav from '@/components/Layout/BottomNav';
import AddExpenseDialog from '@/components/Dialogs/AddExpenseDialog';
import DeleteConfirmDialog from '@/components/Dialogs/DeleteConfirmDialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, DollarSign, Calendar, Edit, Trash2 } from 'lucide-react';
import { Expense, Patient, ExpenseType } from '@/types';
import { toast } from 'sonner';

const mockPatients: Patient[] = [
  { id: '1', name: 'John Smith', registrationNumber: 'REG-2024-001', age: 45, gender: 'Male', contact: '+1 234-567-8900', startDate: '2024-01-15', isActive: true, rehabProgram: 'Physical Therapy' },
  { id: '2', name: 'Sarah Johnson', registrationNumber: 'REG-2024-002', age: 32, gender: 'Female', contact: '+1 234-567-8901', startDate: '2024-02-01', endDate: '2024-03-15', isActive: false, rehabProgram: 'Cardiac Rehab' },
  { id: '3', name: 'Michael Brown', registrationNumber: 'REG-2024-003', age: 58, gender: 'Male', contact: '+1 234-567-8902', startDate: '2024-02-20', isActive: true, rehabProgram: 'Neurological Rehab' },
];

const mockExpenseTypes: ExpenseType[] = [
  { id: '1', name: 'Medicine', description: 'Pharmaceutical medications' },
  { id: '2', name: 'Rehab Session', description: 'Physical therapy sessions' },
  { id: '3', name: 'Doctor Test', description: 'Medical tests' },
  { id: '4', name: 'Consultation', description: 'Doctor consultations' },
];

const mockExpenses: Expense[] = [
  { id: '1', patientId: '1', registrationNumber: 'REG-2024-001', expenseTypeId: '1', expenseTypeName: 'Medicine', date: '2024-03-15', description: 'Paracetamol 500mg', quantity: 20, unitPrice: 2.5, totalAmount: 50 },
  { id: '2', patientId: '1', registrationNumber: 'REG-2024-001', expenseTypeId: '2', expenseTypeName: 'Rehab Session', date: '2024-03-14', description: 'Physical therapy', quantity: 1, unitPrice: 150, totalAmount: 150 },
  { id: '3', patientId: '3', registrationNumber: 'REG-2024-003', expenseTypeId: '3', expenseTypeName: 'Doctor Test', date: '2024-03-13', description: 'MRI Scan', quantity: 1, unitPrice: 500, totalAmount: 500 },
];

const Expenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>(undefined);
  const [deleteExpense, setDeleteExpense] = useState<Expense | undefined>(undefined);

  const totalAmount = expenses.reduce((sum, exp) => sum + exp.totalAmount, 0);

  const handleAddExpense = (expenseData: Omit<Expense, 'id'>) => {
    if (editingExpense) {
      setExpenses(expenses.map(e => e.id === editingExpense.id ? { ...expenseData, id: e.id } : e));
    } else {
      setExpenses([{ ...expenseData, id: Date.now().toString() }, ...expenses]);
    }
    setIsAddDialogOpen(false);
    setEditingExpense(undefined);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader
        title="Services"
        subtitle={`${expenses.length} services • $${totalAmount.toFixed(2)} total`}
        action={<Button size="icon" className="bg-white/20 hover:bg-white/30 text-white" onClick={() => setIsAddDialogOpen(true)}><Plus className="h-5 w-5" /></Button>}
      />

      <div className="max-w-md mx-auto px-4 py-4 space-y-3">
        {expenses.map((expense) => (
          <Card key={expense.id} className="p-4 shadow-soft">
            <div className="flex justify-between mb-2">
              <div>
                <Badge variant="outline" className="text-xs mb-1">{expense.expenseTypeName}</Badge>
                <h3 className="font-semibold">{expense.description}</h3>
              </div>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(expense.date).toLocaleDateString()}</span>
              <span>{expense.quantity} × ${expense.unitPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="flex items-center gap-1 font-semibold"><DollarSign className="h-4 w-4 text-primary" />${expense.totalAmount.toFixed(2)}</span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => { setEditingExpense(expense); setIsAddDialogOpen(true); }}><Edit className="h-3 w-3" /></Button>
                <Button size="sm" variant="outline" className="text-destructive" onClick={() => setDeleteExpense(expense)}><Trash2 className="h-3 w-3" /></Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <AddExpenseDialog open={isAddDialogOpen} onOpenChange={(open) => { setIsAddDialogOpen(open); if (!open) setEditingExpense(undefined); }} onSave={handleAddExpense} patients={mockPatients} expenseTypes={mockExpenseTypes} editExpense={editingExpense} />
      <DeleteConfirmDialog open={!!deleteExpense} onOpenChange={() => setDeleteExpense(undefined)} onConfirm={() => { if (deleteExpense) { setExpenses(expenses.filter(e => e.id !== deleteExpense.id)); toast.success('Service deleted'); setDeleteExpense(undefined); }}} title="Delete Service" description="Are you sure?" />
      <BottomNav />
    </div>
  );
};

export default Expenses;
