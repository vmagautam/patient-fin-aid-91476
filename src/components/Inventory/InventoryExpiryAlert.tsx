import { AlertCircle, AlertTriangle, XCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Medicine } from '@/types';
import { differenceInDays } from 'date-fns';

interface InventoryExpiryAlertProps {
  medicines: Medicine[];
}

const InventoryExpiryAlert = ({ medicines }: InventoryExpiryAlertProps) => {
  const today = new Date();
  
  const expiredMedicines = medicines.filter((med) => {
    if (!med.expiryDate) return false;
    return new Date(med.expiryDate) < today;
  });

  const nearExpiryMedicines = medicines.filter((med) => {
    if (!med.expiryDate) return false;
    const daysUntilExpiry = differenceInDays(new Date(med.expiryDate), today);
    return daysUntilExpiry >= 0 && daysUntilExpiry <= 30;
  });

  const lowStockMedicines = medicines.filter((med) => {
    const threshold = med.minStockLevel || 20;
    return med.stock < threshold;
  });

  if (expiredMedicines.length === 0 && nearExpiryMedicines.length === 0 && lowStockMedicines.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 mb-4">
      {expiredMedicines.length > 0 && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Expired Medicines</AlertTitle>
          <AlertDescription>
            {expiredMedicines.length} medicine(s) have expired. Please remove them from inventory.
          </AlertDescription>
        </Alert>
      )}

      {nearExpiryMedicines.length > 0 && (
        <Alert className="border-warning bg-warning/10">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <AlertTitle className="text-warning-foreground">Near Expiry</AlertTitle>
          <AlertDescription className="text-warning-foreground/80">
            {nearExpiryMedicines.length} medicine(s) expiring within 30 days.
          </AlertDescription>
        </Alert>
      )}

      {lowStockMedicines.length > 0 && (
        <Alert className="border-info bg-info/10">
          <AlertCircle className="h-4 w-4 text-info" />
          <AlertTitle className="text-info-foreground">Low Stock Alert</AlertTitle>
          <AlertDescription className="text-info-foreground/80">
            {lowStockMedicines.length} medicine(s) running low on stock.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default InventoryExpiryAlert;
