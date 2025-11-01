import { Card } from '@/components/ui/card';
import { Medicine } from '@/types';
import { Package, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';

interface InventoryAnalyticsProps {
  medicines: Medicine[];
}

const InventoryAnalytics = ({ medicines }: InventoryAnalyticsProps) => {
  const totalItems = medicines.length;
  const totalValue = medicines.reduce((sum, med) => sum + (med.price * med.stock), 0);
  const lowStockCount = medicines.filter(m => m.stock < m.minStockLevel).length;
  
  const categoryBreakdown = medicines.reduce((acc, med) => {
    acc[med.category] = (acc[med.category] || 0) + (med.price * med.stock);
    return acc;
  }, {} as Record<string, number>);

  const topCategory = Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="grid grid-cols-2 gap-3 mb-4">
      <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <div className="flex items-center gap-2 mb-2">
          <Package className="h-4 w-4 text-primary" />
          <span className="text-xs text-muted-foreground">Total Items</span>
        </div>
        <div className="text-2xl font-bold text-foreground">{totalItems}</div>
      </Card>

      <Card className="p-4 bg-gradient-to-br from-success/10 to-success/5 border-success/20">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="h-4 w-4 text-success" />
          <span className="text-xs text-muted-foreground">Total Value</span>
        </div>
        <div className="text-2xl font-bold text-foreground">${totalValue.toFixed(2)}</div>
      </Card>

      <Card className="p-4 bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <span className="text-xs text-muted-foreground">Low Stock</span>
        </div>
        <div className="text-2xl font-bold text-foreground">{lowStockCount}</div>
      </Card>

      <Card className="p-4 bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="h-4 w-4 text-accent" />
          <span className="text-xs text-muted-foreground">Top Category</span>
        </div>
        <div className="text-sm font-bold text-foreground truncate">
          {topCategory ? topCategory[0] : 'N/A'}
        </div>
      </Card>
    </div>
  );
};

export default InventoryAnalytics;
