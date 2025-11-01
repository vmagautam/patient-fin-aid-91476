import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Trash2, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Expense, Patient, ExpenseType, Medicine } from '@/types';
import { toast } from 'sonner';
import { z } from 'zod';

interface ExpenseItem {
  tempId: string;
  expenseTypeId: string;
  expenseTypeName: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  isPaid: boolean;
  paidAmount: number;
  medicineId?: string;
}

interface AddMultipleExpensesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (expenses: Omit<Expense, 'id'>[]) => void;
  patients: Patient[];
  expenseTypes: ExpenseType[];
  medicines: Medicine[];
}

// Validation schema
const expenseItemSchema = z.object({
  expenseTypeId: z.string().min(1, 'Service type is required'),
  description: z.string().trim().min(1, 'Description is required').max(200, 'Description must be less than 200 characters'),
  quantity: z.number().min(1, 'Quantity must be at least 1').max(1000, 'Quantity is too large'),
  unitPrice: z.number().min(0, 'Price cannot be negative').max(1000000, 'Price is too large'),
});

const AddMultipleExpensesDialog = ({ 
  open, 
  onOpenChange, 
  onSave, 
  patients, 
  expenseTypes,
  medicines 
}: AddMultipleExpensesDialogProps) => {
  const [patientId, setPatientId] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [expenseItems, setExpenseItems] = useState<ExpenseItem[]>([
    {
      tempId: Date.now().toString(),
      expenseTypeId: '',
      expenseTypeName: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      totalAmount: 0,
      isPaid: false,
      paidAmount: 0,
    }
  ]);

  const handleAddExpenseItem = () => {
    setExpenseItems([...expenseItems, {
      tempId: Date.now().toString(),
      expenseTypeId: '',
      expenseTypeName: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      totalAmount: 0,
      isPaid: false,
      paidAmount: 0,
    }]);
  };

  const handleRemoveExpenseItem = (tempId: string) => {
    if (expenseItems.length === 1) {
      toast.error('At least one service entry is required');
      return;
    }
    setExpenseItems(expenseItems.filter(item => item.tempId !== tempId));
  };

  const handleExpenseTypeChange = (tempId: string, typeId: string) => {
    const type = expenseTypes.find((t) => t.id === typeId);
    setExpenseItems(expenseItems.map(item => 
      item.tempId === tempId 
        ? { ...item, expenseTypeId: typeId, expenseTypeName: type?.name || '', medicineId: undefined }
        : item
    ));
  };

  const handleMedicineChange = (tempId: string, medicineId: string) => {
    const medicine = medicines.find((m) => m.id === medicineId);
    if (medicine) {
      setExpenseItems(expenseItems.map(item => {
        if (item.tempId === tempId) {
          const newItem = {
            ...item,
            medicineId,
            description: medicine.name,
            unitPrice: medicine.price,
            totalAmount: item.quantity * medicine.price,
          };
          return newItem;
        }
        return item;
      }));
    }
  };

  const handleFieldChange = (tempId: string, field: keyof ExpenseItem, value: any) => {
    setExpenseItems(expenseItems.map(item => {
      if (item.tempId === tempId) {
        const newItem = { ...item, [field]: value };
        
        // Recalculate total if quantity or price changes
        if (field === 'quantity' || field === 'unitPrice') {
          newItem.totalAmount = newItem.quantity * newItem.unitPrice;
        }
        
        // Auto-set paid amount if marked as paid
        if (field === 'isPaid' && value === true) {
          newItem.paidAmount = newItem.totalAmount;
        }
        
        return newItem;
      }
      return item;
    }));
  };

  const validateForm = (): boolean => {
    if (!patientId) {
      toast.error('Please select a patient');
      return false;
    }

    for (const item of expenseItems) {
      try {
        expenseItemSchema.parse({
          expenseTypeId: item.expenseTypeId,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          toast.error(error.errors[0].message);
          return false;
        }
        toast.error('Invalid expense entry');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const expenses: Omit<Expense, 'id'>[] = expenseItems.map(item => ({
      patientId,
      expenseTypeId: item.expenseTypeId,
      expenseTypeName: item.expenseTypeName,
      date: selectedDate.toISOString().split('T')[0],
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalAmount: item.totalAmount,
      isPaid: item.isPaid,
      paidAmount: item.paidAmount,
      medicineId: item.medicineId,
    }));

    onSave(expenses);
    toast.success(`${expenses.length} service(s) added successfully`);
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setPatientId('');
    setSelectedDate(new Date());
    setExpenseItems([{
      tempId: Date.now().toString(),
      expenseTypeId: '',
      expenseTypeName: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      totalAmount: 0,
      isPaid: false,
      paidAmount: 0,
    }]);
  };

  const totalAmount = expenseItems.reduce((sum, item) => sum + item.totalAmount, 0);
  const totalPaid = expenseItems.reduce((sum, item) => sum + item.paidAmount, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Add Multiple Services for Patient</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Selection */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-4">
            <div>
              <Label htmlFor="patient" className="text-base font-semibold">Patient Name *</Label>
              <Select value={patientId} onValueChange={setPatientId}>
                <SelectTrigger className="mt-2 h-12 text-base">
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id} className="text-base py-3">
                      {patient.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-base font-semibold">Service Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal mt-2 h-12 text-base',
                      !selectedDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-5 w-5" />
                    {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Expense Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Service Entries</Label>
              <Button
                type="button"
                size="sm"
                onClick={handleAddExpenseItem}
                className="h-10 px-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Service
              </Button>
            </div>

            {expenseItems.map((item, index) => {
              const isMedicineExpense = item.expenseTypeId === '1';
              
              return (
                <div key={item.tempId} className="border border-border rounded-lg p-4 space-y-4 bg-card relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm text-muted-foreground">Service #{index + 1}</span>
                    {expenseItems.length > 1 && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveExpenseItem(item.tempId)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Service Type *</Label>
                      <Select
                        value={item.expenseTypeId}
                        onValueChange={(value) => handleExpenseTypeChange(item.tempId, value)}
                      >
                        <SelectTrigger className="mt-1.5 h-11">
                          <SelectValue placeholder="Select service type" />
                        </SelectTrigger>
                        <SelectContent>
                          {expenseTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id} className="py-2.5">
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {isMedicineExpense && (
                      <div>
                        <Label className="text-sm font-medium">Select Medicine</Label>
                        <Select
                          value={item.medicineId || ''}
                          onValueChange={(value) => handleMedicineChange(item.tempId, value)}
                        >
                          <SelectTrigger className="mt-1.5 h-11">
                            <SelectValue placeholder="Select medicine" />
                          </SelectTrigger>
                          <SelectContent>
                            {medicines.map((medicine) => (
                              <SelectItem key={medicine.id} value={medicine.id} className="py-2.5">
                                {medicine.name} - ${medicine.price.toFixed(2)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className={isMedicineExpense ? 'md:col-span-2' : 'md:col-span-1'}>
                      <Label className="text-sm font-medium">Description *</Label>
                      <Input
                        value={item.description}
                        onChange={(e) => handleFieldChange(item.tempId, 'description', e.target.value)}
                        placeholder="e.g., Physical therapy session"
                        className="mt-1.5 h-11"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Quantity *</Label>
                      <Input
                        type="number"
                        min="1"
                        step="1"
                        value={item.quantity}
                        onChange={(e) => handleFieldChange(item.tempId, 'quantity', parseInt(e.target.value) || 1)}
                        className="mt-1.5 h-11 text-base"
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Unit Price ($) *</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => handleFieldChange(item.tempId, 'unitPrice', parseFloat(e.target.value) || 0)}
                        disabled={isMedicineExpense && !!item.medicineId}
                        className="mt-1.5 h-11 text-base"
                      />
                    </div>
                  </div>

                  <div className="bg-muted/30 p-3 rounded-md">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium">Total Amount</span>
                      <span className="text-lg font-bold text-primary">${item.totalAmount.toFixed(2)}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`isPaid-${item.tempId}`}
                          checked={item.isPaid}
                          onChange={(e) => handleFieldChange(item.tempId, 'isPaid', e.target.checked)}
                          className="h-5 w-5 rounded border-border"
                        />
                        <Label htmlFor={`isPaid-${item.tempId}`} className="cursor-pointer text-sm font-medium">
                          Fully Paid
                        </Label>
                      </div>

                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">Paid Amount ($)</Label>
                        <Input
                          type="number"
                          min="0"
                          max={item.totalAmount}
                          step="0.01"
                          value={item.paidAmount}
                          onChange={(e) => handleFieldChange(item.tempId, 'paidAmount', parseFloat(e.target.value) || 0)}
                          className="mt-1 h-10"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">Total Services:</span>
              <span className="text-lg font-bold">{expenseItems.length}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">Total Amount:</span>
              <span className="text-xl font-bold text-primary">${totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold">Total Paid:</span>
              <span className="text-lg font-bold text-success">${totalPaid.toFixed(2)}</span>
            </div>
            {totalAmount > totalPaid && (
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-primary/20">
                <span className="font-semibold text-warning">Pending:</span>
                <span className="text-lg font-bold text-warning">${(totalAmount - totalPaid).toFixed(2)}</span>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="h-11 px-6"
            >
              Cancel
            </Button>
            <Button type="submit" className="h-11 px-6">
              Add {expenseItems.length} Service{expenseItems.length !== 1 ? 's' : ''}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMultipleExpensesDialog;
