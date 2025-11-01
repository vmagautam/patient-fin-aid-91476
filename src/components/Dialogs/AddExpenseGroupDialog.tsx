import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { ExpenseGroup, Patient } from '@/types';
import { toast } from 'sonner';

interface AddExpenseGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (group: Omit<ExpenseGroup, 'id' | 'expenseIds'>) => void;
  patients: Patient[];
  editGroup?: ExpenseGroup;
}

const AddExpenseGroupDialog = ({ open, onOpenChange, onSave, patients, editGroup }: AddExpenseGroupDialogProps) => {
  const [formData, setFormData] = useState<Omit<ExpenseGroup, 'id' | 'expenseIds'>>({
    patientId: editGroup?.patientId || '',
    name: editGroup?.name || '',
    date: editGroup?.date || new Date().toISOString().split('T')[0],
    totalAmount: editGroup?.totalAmount || 0,
    paidAmount: editGroup?.paidAmount || 0,
  });

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    editGroup?.date ? new Date(editGroup.date) : new Date()
  );

  useEffect(() => {
    if (editGroup) {
      setFormData({
        patientId: editGroup.patientId,
        name: editGroup.name,
        date: editGroup.date,
        totalAmount: editGroup.totalAmount,
        paidAmount: editGroup.paidAmount,
      });
      setSelectedDate(new Date(editGroup.date));
    }
  }, [editGroup]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.patientId || !formData.name) {
      toast.error('Please fill in all required fields');
      return;
    }

    const groupData = {
      ...formData,
      date: selectedDate ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    };

    onSave(groupData);
    toast.success(editGroup ? 'Expense group updated successfully' : 'Expense group created successfully');
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      patientId: '',
      name: '',
      date: new Date().toISOString().split('T')[0],
      totalAmount: 0,
      paidAmount: 0,
    });
    setSelectedDate(new Date());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editGroup ? 'Edit Expense Group' : 'Create Expense Group'}</DialogTitle>
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
            <Label htmlFor="name">Group Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., November 2025 Rehab"
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => {
              onOpenChange(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button type="submit">{editGroup ? 'Update' : 'Create'} Group</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddExpenseGroupDialog;
