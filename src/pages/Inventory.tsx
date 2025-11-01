import { useState } from 'react';
import PageHeader from '@/components/Layout/PageHeader';
import BottomNav from '@/components/Layout/BottomNav';
import AddInventoryDialog from '@/components/Dialogs/AddInventoryDialog';
import DeleteConfirmDialog from '@/components/Dialogs/DeleteConfirmDialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Package, DollarSign, AlertCircle, Edit, Trash2 } from 'lucide-react';
import { Medicine } from '@/types';
import { toast } from 'sonner';

// Mock data
const mockMedicines: Medicine[] = [
  { id: '1', name: 'Paracetamol 500mg', category: 'Pain Relief', price: 2.5, stock: 150, minStockLevel: 50, dateAdded: '2024-01-15' },
  { id: '2', name: 'Ibuprofen 400mg', category: 'Anti-inflammatory', price: 3.0, stock: 8, minStockLevel: 20, dateAdded: '2024-02-10' },
  { id: '3', name: 'Amoxicillin 250mg', category: 'Antibiotic', price: 5.5, stock: 75, minStockLevel: 30, dateAdded: '2024-01-20' },
  { id: '4', name: 'Blood Pressure Medication', category: 'Cardiovascular', price: 3.0, stock: 120, minStockLevel: 40, dateAdded: '2024-02-15' },
  { id: '5', name: 'Insulin Injection', category: 'Diabetes', price: 25.0, stock: 3, minStockLevel: 10, dateAdded: '2024-02-20' },
  { id: '6', name: 'Antibiotic Cream', category: 'Topical', price: 8.0, stock: 45, minStockLevel: 15, dateAdded: '2024-01-25' },
];

const Inventory = () => {
  const [medicines, setMedicines] = useState<Medicine[]>(mockMedicines);
  const [filter, setFilter] = useState<'all' | 'low' | 'sufficient'>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | undefined>(undefined);
  const [deleteMedicine, setDeleteMedicine] = useState<Medicine | undefined>(undefined);

  const filteredMedicines = medicines.filter(medicine => {
    if (filter === 'all') return true;
    if (filter === 'low') return medicine.stock < 20;
    if (filter === 'sufficient') return medicine.stock >= 20;
    return true;
  });

  const lowStockCount = medicines.filter(m => m.stock < 20).length;
  
  // Get unique categories from existing medicines
  const existingCategories = Array.from(new Set(medicines.map(m => m.category)));

  const handleAddMedicine = (medicineData: Omit<Medicine, 'id'>) => {
    if (editingMedicine) {
      setMedicines(medicines.map(m => m.id === editingMedicine.id ? { ...medicineData, id: m.id } : m));
      setEditingMedicine(undefined);
    } else {
      const newMedicine: Medicine = {
        ...medicineData,
        id: Date.now().toString(),
      };
      setMedicines([newMedicine, ...medicines]);
    }
  };

  const handleEditMedicine = (medicine: Medicine) => {
    setEditingMedicine(medicine);
    setIsAddDialogOpen(true);
  };

  const handleDeleteMedicine = () => {
    if (deleteMedicine) {
      setMedicines(medicines.filter(m => m.id !== deleteMedicine.id));
      toast.success('Medicine deleted successfully');
      setDeleteMedicine(undefined);
    }
  };

  const handleDialogClose = () => {
    setIsAddDialogOpen(false);
    setEditingMedicine(undefined);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader
        title="Medicine Inventory"
        subtitle={`${filteredMedicines.length} items • ${lowStockCount} low stock alerts`}
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
            variant={filter === 'low' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('low')}
            className="flex-1"
          >
            Low Stock
          </Button>
          <Button
            variant={filter === 'sufficient' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('sufficient')}
            className="flex-1"
          >
            Sufficient
          </Button>
        </div>

        {/* Medicine Cards */}
        <div className="space-y-3">
          {filteredMedicines.map((medicine) => {
            const isLowStock = medicine.stock < 20;
            const isCritical = medicine.stock < 10;

            return (
              <Card key={medicine.id} className="p-4 shadow-soft hover:shadow-medium transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">{medicine.name}</h3>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={isCritical ? 'destructive' : isLowStock ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {medicine.stock} in stock
                      </Badge>
                      {isLowStock && (
                        <AlertCircle className={`h-4 w-4 ${isCritical ? 'text-destructive' : 'text-warning'}`} />
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-primary font-semibold">
                      <DollarSign className="h-4 w-4" />
                      <span>{medicine.price.toFixed(2)}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">per unit</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Package className="h-4 w-4" />
                    <span>Total Value: ${(medicine.price * medicine.stock).toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleEditMedicine(medicine)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => setDeleteMedicine(medicine)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <AddInventoryDialog
        open={isAddDialogOpen}
        onOpenChange={handleDialogClose}
        onSave={handleAddMedicine}
        editMedicine={editingMedicine}
        existingCategories={existingCategories}
      />

      <DeleteConfirmDialog
        open={!!deleteMedicine}
        onOpenChange={() => setDeleteMedicine(undefined)}
        onConfirm={handleDeleteMedicine}
        title="Delete Medicine"
        description={`Are you sure you want to delete ${deleteMedicine?.name}? This action cannot be undone.`}
      />

      <BottomNav />
    </div>
  );
};

export default Inventory;
