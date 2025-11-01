import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Medicine, RestockRecord } from '@/types';
import { toast } from 'sonner';

interface RestockInventoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medicine: Medicine | null;
  onRestock: (medicineId: string, restockData: Omit<RestockRecord, 'id'>) => void;
}

const RestockInventoryDialog = ({ open, onOpenChange, medicine, onRestock }: RestockInventoryDialogProps) => {
  const [formData, setFormData] = useState({
    quantity: 0,
    unitPrice: medicine?.price || 0,
    expiryDate: '',
    batchNumber: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!medicine) return;

    if (formData.quantity <= 0) {
      toast.error('Quantity must be greater than 0');
      return;
    }

    if (formData.unitPrice <= 0) {
      toast.error('Unit price must be greater than 0');
      return;
    }

    const restockData: Omit<RestockRecord, 'id'> = {
      date: new Date().toISOString(),
      quantity: formData.quantity,
      unitPrice: formData.unitPrice,
      expiryDate: formData.expiryDate || undefined,
      batchNumber: formData.batchNumber || undefined,
      notes: formData.notes || undefined,
    };

    onRestock(medicine.id, restockData);
    toast.success(`${medicine.name} restocked successfully`);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      quantity: 0,
      unitPrice: medicine?.price || 0,
      expiryDate: '',
      batchNumber: '',
      notes: '',
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Restock {medicine?.name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-muted p-3 rounded-lg">
            <div className="text-sm text-muted-foreground">Current Stock</div>
            <div className="text-2xl font-bold text-foreground">{medicine?.stock || 0} units</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantity">Restock Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                step="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                placeholder="0"
                required
              />
            </div>

            <div>
              <Label htmlFor="unitPrice">Unit Price *</Label>
              <Input
                id="unitPrice"
                type="number"
                min="0.01"
                step="0.01"
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="batchNumber">Batch/Lot Number</Label>
              <Input
                id="batchNumber"
                value={formData.batchNumber}
                onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                placeholder="e.g., BN12345"
              />
            </div>

            <div>
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes about this restock..."
              rows={3}
            />
          </div>

          <div className="bg-success/10 p-3 rounded-lg border border-success/20">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">New Stock Level:</span>
              <span className="text-lg font-bold text-success">
                {(medicine?.stock || 0) + formData.quantity} units
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-muted-foreground">Restock Value:</span>
              <span className="text-lg font-bold text-primary">
                ${(formData.quantity * formData.unitPrice).toFixed(2)}
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">Confirm Restock</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RestockInventoryDialog;
