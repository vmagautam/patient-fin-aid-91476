import { useState, useMemo } from 'react';
import PageHeader from '@/components/Layout/PageHeader';
import BottomNav from '@/components/Layout/BottomNav';
import GlobalSearchBar from '@/components/Search/GlobalSearchBar';
import ExpenseGroupCard from '@/components/Expenses/ExpenseGroupCard';
import AddExpenseGroupDialog from '@/components/Dialogs/AddExpenseGroupDialog';
import DeleteConfirmDialog from '@/components/Dialogs/DeleteConfirmDialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, DollarSign, Calendar as CalendarIcon, CheckCircle, XCircle, Edit, Trash2, Package } from 'lucide-react';
import { Expense, Patient, ExpenseType, ExpenseGroup, Medicine } from '@/types';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

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
  { id: '3', name: 'Doctor Test', description: 'Medical tests and diagnostics' },
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
    expenseGroupId: 'group1',
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
    expenseGroupId: 'group1',
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
];

const mockExpenseGroups: ExpenseGroup[] = [
  {
    id: 'group1',
    patientId: '1',
    name: 'March Treatment Batch',
    date: '2024-03-15',
    totalAmount: 200,
    paidAmount: 50,
    expenseIds: ['1', '2'],
  },
];

const EnhancedExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses);
  const [expenseGroups, setExpenseGroups] = useState<ExpenseGroup[]>(mockExpenseGroups);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'individual' | 'grouped'>('grouped');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAddGroupDialogOpen, setIsAddGroupDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>(undefined);
  const [editingGroup, setEditingGroup] = useState<ExpenseGroup | undefined>(undefined);
  const [deleteExpense, setDeleteExpense] = useState<Expense | undefined>(undefined);
  const [deleteGroup, setDeleteGroup] = useState<ExpenseGroup | undefined>(undefined);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [formData, setFormData] = useState<Omit<Expense, 'id'>>({
    patientId: '',
    expenseTypeId: '',
    expenseTypeName: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    quantity: 1,
    unitPrice: 0,
    totalAmount: 0,
    isPaid: false,
    paidAmount: 0,
  });

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

  const handleExpenseTypeChange = (typeId: string) => {
    const type = mockExpenseTypes.find((t) => t.id === typeId);
    setFormData({
      ...formData,
      expenseTypeId: typeId,
      expenseTypeName: type?.name || '',
      medicineId: undefined,
    });
  };

  const handleMedicineChange = (medicineId: string) => {
    const medicine = mockMedicines.find((m) => m.id === medicineId);
    if (medicine) {
      setFormData({
        ...formData,
        medicineId,
        description: medicine.name,
        unitPrice: medicine.price,
        totalAmount: formData.quantity * medicine.price,
      });
    }
  };

  const handleQuantityOrPriceChange = (field: 'quantity' | 'unitPrice', value: number) => {
    const newData = { ...formData, [field]: value };
    newData.totalAmount = newData.quantity * newData.unitPrice;
    setFormData(newData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.patientId || !formData.expenseTypeId || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    const expenseData = {
      ...formData,
      date: selectedDate ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      totalAmount: formData.quantity * formData.unitPrice,
    };

    if (editingExpense) {
      setExpenses(expenses.map(e => e.id === editingExpense.id ? { ...expenseData, id: e.id } : e));
      toast.success('Expense updated successfully');
      setEditingExpense(undefined);
    } else {
      const newExpense: Expense = {
        ...expenseData,
        id: Date.now().toString(),
      };
      setExpenses([newExpense, ...expenses]);
      toast.success('Expense added successfully');
    }

    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData(expense);
    setSelectedDate(new Date(expense.date));
    setIsAddDialogOpen(true);
  };

  const handleDeleteExpense = () => {
    if (deleteExpense) {
      // Update expense group totals if expense belongs to a group
      if (deleteExpense.expenseGroupId) {
        const group = expenseGroups.find(g => g.id === deleteExpense.expenseGroupId);
        if (group) {
          const updatedGroups = expenseGroups.map(g => {
            if (g.id === deleteExpense.expenseGroupId) {
              return {
                ...g,
                totalAmount: g.totalAmount - deleteExpense.totalAmount,
                paidAmount: g.paidAmount - deleteExpense.paidAmount,
                expenseIds: g.expenseIds.filter(id => id !== deleteExpense.id),
              };
            }
            return g;
          });
          setExpenseGroups(updatedGroups);
        }
      }
      
      setExpenses(expenses.filter(e => e.id !== deleteExpense.id));
      toast.success('Expense deleted successfully');
      setDeleteExpense(undefined);
    }
  };

  const handleSaveGroup = (groupData: Omit<ExpenseGroup, 'id' | 'expenseIds'>) => {
    if (editingGroup) {
      setExpenseGroups(expenseGroups.map(g => 
        g.id === editingGroup.id 
          ? { ...groupData, id: g.id, expenseIds: g.expenseIds } 
          : g
      ));
      setEditingGroup(undefined);
    } else {
      const newGroup: ExpenseGroup = {
        ...groupData,
        id: Date.now().toString(),
        expenseIds: [],
      };
      setExpenseGroups([newGroup, ...expenseGroups]);
    }
    setIsAddGroupDialogOpen(false);
  };

  const handleEditGroup = (group: ExpenseGroup) => {
    setEditingGroup(group);
    setIsAddGroupDialogOpen(true);
  };

  const handleDeleteGroup = () => {
    if (deleteGroup) {
      // Remove group association from expenses
      const updatedExpenses = expenses.map(e => 
        e.expenseGroupId === deleteGroup.id 
          ? { ...e, expenseGroupId: undefined } 
          : e
      );
      setExpenses(updatedExpenses);
      setExpenseGroups(expenseGroups.filter(g => g.id !== deleteGroup.id));
      toast.success('Expense group deleted successfully');
      setDeleteGroup(undefined);
    }
  };

  const resetForm = () => {
    setFormData({
      patientId: '',
      expenseTypeId: '',
      expenseTypeName: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      quantity: 1,
      unitPrice: 0,
      totalAmount: 0,
      isPaid: false,
      paidAmount: 0,
    });
    setSelectedDate(new Date());
    setEditingExpense(undefined);
  };

  const totalAmount = filteredExpenses.reduce((sum, exp) => sum + exp.totalAmount, 0);
  const paidAmount = filteredExpenses.reduce((sum, exp) => sum + exp.paidAmount, 0);

  const isMedicineExpense = formData.expenseTypeId === '1';

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader
        title="Expenses"
        subtitle={`$${totalAmount.toFixed(2)} total • $${paidAmount.toFixed(2)} paid`}
        action={
          <div className="flex gap-2">
            <Button 
              size="icon" 
              variant="outline"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              onClick={() => {
                setEditingGroup(undefined);
                setIsAddGroupDialogOpen(true);
              }}
              title="Create expense group"
            >
              <Package className="h-5 w-5" />
            </Button>
            <Button 
              size="icon" 
              className="bg-white/20 hover:bg-white/30 text-white border-0"
              onClick={() => {
                resetForm();
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
            placeholder="Search by patient, description..."
            onClear={() => setSearchQuery('')}
          />
        </div>

        {/* View Toggle */}
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'individual' | 'grouped')} className="w-full mb-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="grouped">Grouped View</TabsTrigger>
            <TabsTrigger value="individual">Individual</TabsTrigger>
          </TabsList>

          <TabsContent value="grouped" className="space-y-3 mt-4">
            {expenseGroups.map((group) => {
              const groupExpenses = expenses.filter((exp) => exp.expenseGroupId === group.id);
              return (
                <ExpenseGroupCard
                  key={group.id}
                  group={group}
                  expenses={groupExpenses}
                  onGroupEdit={handleEditGroup}
                  onGroupDelete={setDeleteGroup}
                  onExpenseEdit={handleEditExpense}
                  onExpenseDelete={setDeleteExpense}
                />
              );
            })}

            {/* Ungrouped expenses */}
            {filteredExpenses.filter((exp) => !exp.expenseGroupId).map((expense) => {
              const patient = mockPatients.find(p => p.id === expense.patientId);
              return (
                <Card key={expense.id} className="p-4 shadow-soft hover:shadow-medium transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {expense.expenseTypeName}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-foreground">{expense.description}</h3>
                      <p className="text-sm text-muted-foreground">{patient?.name}</p>
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
                        <CalendarIcon className="h-4 w-4" />
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
              );
            })}

            {filteredExpenses.length === 0 && (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No expenses found</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="individual" className="space-y-3 mt-4">
            {filteredExpenses.map((expense) => {
              const patient = mockPatients.find(p => p.id === expense.patientId);
              return (
                <Card key={expense.id} className="p-4 shadow-soft hover:shadow-medium transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {expense.expenseTypeName}
                        </Badge>
                        {expense.expenseGroupId && (
                          <Package className="h-3 w-3 text-muted-foreground" />
                        )}
                      </div>
                      <h3 className="font-semibold text-foreground">{expense.description}</h3>
                      <p className="text-sm text-muted-foreground">{patient?.name}</p>
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
                        <CalendarIcon className="h-4 w-4" />
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
              );
            })}

            {filteredExpenses.length === 0 && (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No expenses found</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Add/Edit Expense Group Dialog */}
      <AddExpenseGroupDialog
        open={isAddGroupDialogOpen}
        onOpenChange={(open) => {
          setIsAddGroupDialogOpen(open);
          if (!open) setEditingGroup(undefined);
        }}
        onSave={handleSaveGroup}
        patients={mockPatients}
        editGroup={editingGroup}
      />

      {/* Add/Edit Expense Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
        setIsAddDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingExpense ? 'Edit Expense' : 'Add New Expense'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="patient">Patient *</Label>
              <Select
                value={formData.patientId}
                onValueChange={(value) => setFormData({ ...formData, patientId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent>
                  {mockPatients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="expenseType">Expense Type *</Label>
              <Select
                value={formData.expenseTypeId}
                onValueChange={handleExpenseTypeChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select expense type" />
                </SelectTrigger>
                <SelectContent>
                  {mockExpenseTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isMedicineExpense && (
              <div>
                <Label htmlFor="medicine">Select Medicine</Label>
                <Select
                  value={formData.medicineId}
                  onValueChange={handleMedicineChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select medicine" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockMedicines.map((medicine) => (
                      <SelectItem key={medicine.id} value={medicine.id}>
                        {medicine.name} - ${medicine.price.toFixed(2)} ({medicine.stock} in stock)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g., Paracetamol 500mg"
                required
              />
            </div>

            <div>
              <Label>Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !selectedDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  step="1"
                  value={formData.quantity}
                  onChange={(e) =>
                    handleQuantityOrPriceChange('quantity', parseInt(e.target.value) || 1)
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="unitPrice">Unit Price *</Label>
                <Input
                  id="unitPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.unitPrice}
                  onChange={(e) =>
                    handleQuantityOrPriceChange('unitPrice', parseFloat(e.target.value) || 0)
                  }
                  required
                  disabled={isMedicineExpense && !!formData.medicineId}
                />
              </div>
            </div>

            <div>
              <Label>Total Amount</Label>
              <div className="text-2xl font-bold text-primary">${formData.totalAmount.toFixed(2)}</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPaid"
                  checked={formData.isPaid}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      isPaid: e.target.checked,
                      paidAmount: e.target.checked ? formData.totalAmount : formData.paidAmount,
                    })
                  }
                  className="h-4 w-4"
                />
                <Label htmlFor="isPaid" className="cursor-pointer">
                  Fully Paid
                </Label>
              </div>

              <div>
                <Label htmlFor="paidAmount">Paid Amount</Label>
                <Input
                  id="paidAmount"
                  type="number"
                  min="0"
                  max={formData.totalAmount}
                  step="0.01"
                  value={formData.paidAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, paidAmount: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => {
                setIsAddDialogOpen(false);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button type="submit">{editingExpense ? 'Update' : 'Add'} Expense</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={!!deleteExpense}
        onOpenChange={() => setDeleteExpense(undefined)}
        onConfirm={handleDeleteExpense}
        title="Delete Expense"
        description={`Are you sure you want to delete this ${deleteExpense?.expenseTypeName} expense? This action cannot be undone.`}
      />

      <DeleteConfirmDialog
        open={!!deleteGroup}
        onOpenChange={() => setDeleteGroup(undefined)}
        onConfirm={handleDeleteGroup}
        title="Delete Expense Group"
        description={`Are you sure you want to delete "${deleteGroup?.name}"? Expenses in this group will not be deleted, but will become ungrouped.`}
      />

      <BottomNav />
    </div>
  );
};

export default EnhancedExpenses;
