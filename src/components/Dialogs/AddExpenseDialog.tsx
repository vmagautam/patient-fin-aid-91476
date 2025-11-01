import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Expense, Patient, ExpenseType } from '@/types';
import { toast } from 'sonner';

interface AddExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (expense: Omit<Expense, 'id'>) => void;
  patients: Patient[];
  expenseTypes: ExpenseType[];
  editExpense?: Expense;
}

const AddExpenseDialog = ({ open, onOpenChange, onSave, patients, expenseTypes, editExpense }: AddExpenseDialogProps) => {
  const [formData, setFormData] = useState<Omit<Expense, 'id'>>({
    patientId: editExpense?.patientId || '',
    expenseTypeId: editExpense?.expenseTypeId || '',
    expenseTypeName: editExpense?.expenseTypeName || '',
    date: editExpense?.date || new Date().toISOString().split('T')[0],
    description: editExpense?.description || '',
    quantity: editExpense?.quantity || 1,
    unitPrice: editExpense?.unitPrice || 0,
    totalAmount: editExpense?.totalAmount || 0,
    isPaid: editExpense?.isPaid ?? false,
    paidAmount: editExpense?.paidAmount || 0,
  });

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    editExpense?.date ? new Date(editExpense.date) : new Date()
  );

  const handleExpenseTypeChange = (typeId: string) => {
    const type = expenseTypes.find((t) => t.id === typeId);
    setFormData({
      ...formData,
      expenseTypeId: typeId,
      expenseTypeName: type?.name || '',
    });
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

    onSave(expenseData);
    toast.success(editExpense ? 'Expense updated successfully' : 'Expense added successfully');
    onOpenChange(false);
    resetForm();
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
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editExpense ? 'Edit Expense' : 'Add New Expense'}</DialogTitle>
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
                {patients.map((patient) => (
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
                {expenseTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
                  className={cn('p-3 pointer-events-auto')}
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{editExpense ? 'Update' : 'Add'} Expense</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddExpenseDialog;
