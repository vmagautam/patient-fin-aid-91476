import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Medicine } from '@/types';
import { Calendar, Package, DollarSign, Hash } from 'lucide-react';
import { format } from 'date-fns';

interface RestockHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medicine: Medicine | null;
}

const RestockHistoryDialog = ({ open, onOpenChange, medicine }: RestockHistoryDialogProps) => {
  if (!medicine) return null;

  const history = medicine.restockHistory || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Restock History - {medicine.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {history.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No restock history available</p>
            </Card>
          ) : (
            history.map((record, index) => (
              <Card key={record.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <Badge variant="outline">Restock #{history.length - index}</Badge>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{format(new Date(record.date), 'dd/MM/yyyy')}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Package className="h-3 w-3" />
                      <span>Quantity</span>
                    </div>
                    <span className="font-semibold text-foreground">+{record.quantity} units</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <DollarSign className="h-3 w-3" />
                      <span>Unit Price</span>
                    </div>
                    <span className="font-semibold text-foreground">${record.unitPrice.toFixed(2)}</span>
                  </div>

                  {record.batchNumber && (
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Hash className="h-3 w-3" />
                        <span>Batch Number</span>
                      </div>
                      <span className="font-semibold text-foreground">{record.batchNumber}</span>
                    </div>
                  )}

                  {record.expiryDate && (
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>Expiry Date</span>
                      </div>
                      <span className="font-semibold text-foreground">
                        {format(new Date(record.expiryDate), 'dd/MM/yyyy')}
                      </span>
                    </div>
                  )}

                  {record.notes && (
                    <div className="pt-2 border-t border-border">
                      <p className="text-xs text-muted-foreground">{record.notes}</p>
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-border">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total Value</span>
                    <span className="text-lg font-bold text-primary">
                      ${(record.quantity * record.unitPrice).toFixed(2)}
                    </span>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RestockHistoryDialog;
