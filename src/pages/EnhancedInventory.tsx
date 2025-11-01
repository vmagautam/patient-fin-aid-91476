import { useState, useMemo } from 'react';
import PageHeader from '@/components/Layout/PageHeader';
import BottomNav from '@/components/Layout/BottomNav';
import GlobalSearchBar from '@/components/Search/GlobalSearchBar';
import InventoryExpiryAlert from '@/components/Inventory/InventoryExpiryAlert';
import InventoryAnalytics from '@/components/Inventory/InventoryAnalytics';
import RestockInventoryDialog from '@/components/Dialogs/RestockInventoryDialog';
import RestockHistoryDialog from '@/components/Inventory/RestockHistoryDialog';
import AddInventoryDialog from '@/components/Dialogs/AddInventoryDialog';
import DeleteConfirmDialog from '@/components/Dialogs/DeleteConfirmDialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Package, DollarSign, AlertCircle, Edit, Trash2, Calendar, TrendingUp, History, RefreshCw } from 'lucide-react';
import { Medicine, RestockRecord } from '@/types';
import { toast } from 'sonner';
import { differenceInDays, format } from 'date-fns';

// Mock data with expiry dates and enhanced fields
const mockMedicines: Medicine[] = [
  { id: '1', name: 'Paracetamol 500mg', category: 'Pain Relief', price: 2.5, stock: 150, minStockLevel: 50, expiryDate: '2025-12-31', batchNumber: 'BN001', dateAdded: '2024-01-15', restockHistory: [] },
  { id: '2', name: 'Ibuprofen 400mg', category: 'Anti-inflammatory', price: 3.0, stock: 8, minStockLevel: 20, expiryDate: '2024-04-15', batchNumber: 'BN002', dateAdded: '2024-02-10', restockHistory: [] },
  { id: '3', name: 'Amoxicillin 250mg', category: 'Antibiotic', price: 5.5, stock: 75, minStockLevel: 30, expiryDate: '2024-11-30', batchNumber: 'BN003', dateAdded: '2024-01-20', restockHistory: [] },
  { id: '4', name: 'Blood Pressure Monitor', category: 'Medical Equipment', price: 120.0, stock: 5, minStockLevel: 3, dateAdded: '2024-03-01', restockHistory: [] },
  { id: '5', name: 'Insulin Injection', category: 'Diabetes', price: 25.0, stock: 3, minStockLevel: 10, expiryDate: '2024-03-20', batchNumber: 'BN005', dateAdded: '2024-02-15', restockHistory: [] },
  { id: '6', name: 'Rehabilitation Belt', category: 'Rehab Supplies', price: 45.0, stock: 12, minStockLevel: 5, dateAdded: '2024-02-20', restockHistory: [] },
  { id: '7', name: 'Surgical Gloves (Box)', category: 'Medical Supplies', price: 15.0, stock: 25, minStockLevel: 10, dateAdded: '2024-01-10', restockHistory: [] },
  { id: '8', name: 'Antibiotic Cream', category: 'Topical', price: 8.0, stock: 45, minStockLevel: 15, expiryDate: '2025-08-10', batchNumber: 'BN008', dateAdded: '2024-01-25', restockHistory: [] },
];

const EnhancedInventory = () => {
  const [medicines, setMedicines] = useState<Medicine[]>(mockMedicines);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | undefined>(undefined);
  const [deleteMedicine, setDeleteMedicine] = useState<Medicine | undefined>(undefined);
  const [restockMedicine, setRestockMedicine] = useState<Medicine | null>(null);
  const [historyMedicine, setHistoryMedicine] = useState<Medicine | null>(null);

  const today = new Date();

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(medicines.map(m => m.category));
    return Array.from(cats).sort();
  }, [medicines]);

  const existingCategories = categories;

  // Categorize medicines
  const { activeMedicines, nearExpiryMedicines, expiredMedicines } = useMemo(() => {
    const active: Medicine[] = [];
    const nearExpiry: Medicine[] = [];
    const expired: Medicine[] = [];

    medicines.forEach((med) => {
      if (!med.expiryDate) {
        active.push(med);
        return;
      }

      const daysUntilExpiry = differenceInDays(new Date(med.expiryDate), today);
      
      if (daysUntilExpiry < 0) {
        expired.push(med);
      } else if (daysUntilExpiry <= 30) {
        nearExpiry.push(med);
      } else {
        active.push(med);
      }
    });

    return { activeMedicines: active, nearExpiryMedicines: nearExpiry, expiredMedicines: expired };
  }, [medicines]);

  // Search and category filter
  const filterMedicines = (medicineList: Medicine[]) => {
    let filtered = medicineList;

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(med => med.category === categoryFilter);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((med) =>
        med.name.toLowerCase().includes(query) ||
        med.category.toLowerCase().includes(query) ||
        med.batchNumber?.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  };

  const handleAddMedicine = (medicineData: Omit<Medicine, 'id'>) => {
    if (editingMedicine) {
      setMedicines(medicines.map(m => m.id === editingMedicine.id ? { ...medicineData, id: m.id } : m));
      setEditingMedicine(undefined);
      toast.success('Item updated successfully');
    } else {
      const newMedicine: Medicine = {
        ...medicineData,
        id: Date.now().toString(),
      };
      setMedicines([newMedicine, ...medicines]);
      toast.success('Item added successfully');
    }
    setIsAddDialogOpen(false);
  };

  const handleEditMedicine = (medicine: Medicine) => {
    setEditingMedicine(medicine);
    setIsAddDialogOpen(true);
  };

  const handleRestock = (medicineId: string, restockData: Omit<RestockRecord, 'id'>) => {
    setMedicines(medicines.map(m => {
      if (m.id === medicineId) {
        const newRestockRecord: RestockRecord = {
          ...restockData,
          id: Date.now().toString(),
        };
        return {
          ...m,
          stock: m.stock + restockData.quantity,
          price: restockData.unitPrice,
          expiryDate: restockData.expiryDate || m.expiryDate,
          batchNumber: restockData.batchNumber || m.batchNumber,
          restockHistory: [...(m.restockHistory || []), newRestockRecord],
        };
      }
      return m;
    }));
    setRestockMedicine(null);
  };

  const handleDeleteMedicine = () => {
    if (deleteMedicine) {
      setMedicines(medicines.filter(m => m.id !== deleteMedicine.id));
      toast.success('Item deleted successfully');
      setDeleteMedicine(undefined);
    }
  };

  const MedicineCard = ({ medicine }: { medicine: Medicine }) => {
    const isLowStock = medicine.stock < (medicine.minStockLevel || 20);
    const isCritical = medicine.stock < 10;
    const daysUntilExpiry = medicine.expiryDate ? differenceInDays(new Date(medicine.expiryDate), today) : null;
    const isExpired = daysUntilExpiry !== null && daysUntilExpiry < 0;
    const isNearExpiry = daysUntilExpiry !== null && daysUntilExpiry >= 0 && daysUntilExpiry <= 30;

    return (
      <Card className="p-4 shadow-soft hover:shadow-medium transition-all">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-1">{medicine.name}</h3>
            <Badge variant="outline" className="text-xs mb-2">
              {medicine.category}
            </Badge>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge 
                variant={isCritical ? 'destructive' : isLowStock ? 'default' : 'secondary'}
                className="text-xs"
              >
                {medicine.stock} in stock
              </Badge>
              {isLowStock && (
                <AlertCircle className={`h-4 w-4 ${isCritical ? 'text-destructive' : 'text-warning'}`} />
              )}
              {medicine.batchNumber && (
                <Badge variant="outline" className="text-xs">
                  {medicine.batchNumber}
                </Badge>
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

        {medicine.expiryDate && (
          <div className={`flex items-center gap-2 text-sm mb-2 ${isExpired ? 'text-destructive' : isNearExpiry ? 'text-warning' : 'text-muted-foreground'}`}>
            <Calendar className="h-3 w-3" />
            <span>
              {isExpired ? 'Expired: ' : 'Expires: '}
              {new Date(medicine.expiryDate).toLocaleDateString()}
              {daysUntilExpiry !== null && !isExpired && ` (${daysUntilExpiry}d)`}
            </span>
          </div>
        )}

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
            onClick={() => setRestockMedicine(medicine)}
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Restock
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1"
            onClick={() => setHistoryMedicine(medicine)}
          >
            <History className="h-3 w-3 mr-1" />
            History
          </Button>
        </div>

        <div className="flex gap-2 mt-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1"
            onClick={() => handleEditMedicine(medicine)}
          >
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1 text-destructive hover:bg-destructive hover:text-destructive-foreground"
            onClick={() => setDeleteMedicine(medicine)}
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Delete
          </Button>
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader
        title="Medicine Inventory"
        subtitle={`${medicines.length} items • ${expiredMedicines.length + nearExpiryMedicines.length} alerts`}
        action={
          <Button 
            size="icon" 
            className="bg-white/20 hover:bg-white/30 text-white border-0"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="h-5 w-5" />
          </Button>
        }
      />

      <div className="max-w-md mx-auto px-4 py-4">
        {/* Analytics */}
        <InventoryAnalytics medicines={medicines} />

        {/* Alerts */}
        <InventoryExpiryAlert medicines={medicines} />

        {/* Search Bar */}
        <div className="mb-4">
          <GlobalSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by name, category, or batch..."
            onClear={() => setSearchQuery('')}
          />
        </div>

        {/* Category Filter */}
        <div className="mb-4">
          <Label className="text-sm text-muted-foreground mb-2 block">Filter by Category</Label>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="active">
              Active ({activeMedicines.length})
            </TabsTrigger>
            <TabsTrigger value="near-expiry">
              Near Expiry ({nearExpiryMedicines.length})
            </TabsTrigger>
            <TabsTrigger value="expired">
              Expired ({expiredMedicines.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-3">
            {filterMedicines(activeMedicines).map((medicine) => (
              <MedicineCard key={medicine.id} medicine={medicine} />
            ))}
            {filterMedicines(activeMedicines).length === 0 && (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No active medicines found</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="near-expiry" className="space-y-3">
            {filterMedicines(nearExpiryMedicines).map((medicine) => (
              <MedicineCard key={medicine.id} medicine={medicine} />
            ))}
            {filterMedicines(nearExpiryMedicines).length === 0 && (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No medicines near expiry</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="expired" className="space-y-3">
            {filterMedicines(expiredMedicines).map((medicine) => (
              <MedicineCard key={medicine.id} medicine={medicine} />
            ))}
            {filterMedicines(expiredMedicines).length === 0 && (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No expired medicines</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Add/Edit Dialog */}
      <AddInventoryDialog
        open={isAddDialogOpen}
        onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) setEditingMedicine(undefined);
        }}
        onSave={handleAddMedicine}
        editMedicine={editingMedicine}
        existingCategories={existingCategories}
      />

      <RestockInventoryDialog
        open={!!restockMedicine}
        onOpenChange={(open) => !open && setRestockMedicine(null)}
        medicine={restockMedicine}
        onRestock={handleRestock}
      />

      <RestockHistoryDialog
        open={!!historyMedicine}
        onOpenChange={(open) => !open && setHistoryMedicine(null)}
        medicine={historyMedicine}
      />

      <DeleteConfirmDialog
        open={!!deleteMedicine}
        onOpenChange={() => setDeleteMedicine(undefined)}
        onConfirm={handleDeleteMedicine}
        title="Delete Inventory Item"
        description={`Are you sure you want to delete ${deleteMedicine?.name}? This action cannot be undone.`}
      />

      <BottomNav />
    </div>
  );
};

export default EnhancedInventory;
