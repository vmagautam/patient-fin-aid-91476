import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Medicine } from '@/types';
import { toast } from 'sonner';

interface AddInventoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (medicine: Omit<Medicine, 'id'>) => void;
  editMedicine?: Medicine;
  existingCategories: string[];
}

const AddInventoryDialog = ({ open, onOpenChange, onSave, editMedicine, existingCategories }: AddInventoryDialogProps) => {
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const [formData, setFormData] = useState<Omit<Medicine, 'id'>>({
    name: editMedicine?.name || '',
    category: editMedicine?.category || '',
    price: editMedicine?.price || 0,
    stock: editMedicine?.stock || 0,
    minStockLevel: editMedicine?.minStockLevel || 20,
    dateAdded: editMedicine?.dateAdded || new Date().toISOString().split('T')[0],
    expiryDate: editMedicine?.expiryDate,
    batchNumber: editMedicine?.batchNumber,
    restockHistory: editMedicine?.restockHistory || [],
  });

  // Normalize categories to lowercase for comparison
  const normalizedCategories = useMemo(() => 
    existingCategories.map(cat => cat.toLowerCase()), 
    [existingCategories]
  );

  // Check if category already exists (case-insensitive)
  const categoryExists = (category: string) => {
    return normalizedCategories.includes(category.toLowerCase());
  };

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    if (!categorySearch) return existingCategories;
    return existingCategories.filter(cat => 
      cat.toLowerCase().includes(categorySearch.toLowerCase())
    );
  }, [existingCategories, categorySearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.category || formData.price <= 0 || formData.stock < 0) {
      toast.error('Please fill in all required fields with valid values');
      return;
    }

    // Check for duplicate category (only when creating new)
    if (!editMedicine && categorySearch && !existingCategories.includes(formData.category)) {
      if (categoryExists(formData.category)) {
        toast.error('This category already exists. Please choose a different name.');
        return;
      }
    }

    onSave(formData);
    toast.success(editMedicine ? 'Item updated successfully' : 'Item added successfully');
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      price: 0,
      stock: 0,
      minStockLevel: 20,
      dateAdded: new Date().toISOString().split('T')[0],
      expiryDate: undefined,
      batchNumber: undefined,
      restockHistory: [],
    });
    setCategorySearch('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editMedicine ? 'Edit Inventory Item' : 'Add New Inventory Item'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Item Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Paracetamol 500mg, Wheelchair"
              required
            />
          </div>

          <div>
            <Label htmlFor="category">Category *</Label>
            <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={categoryOpen}
                  className={cn(
                    "w-full justify-between",
                    !formData.category && "text-muted-foreground"
                  )}
                >
                  {formData.category || "Select or create category"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput 
                    placeholder="Search or type new category..." 
                    value={categorySearch}
                    onValueChange={setCategorySearch}
                  />
                  <CommandList>
                    <CommandEmpty>
                      <div className="p-2 text-center">
                        <p className="text-sm text-muted-foreground mb-2">No category found</p>
                        {categorySearch && !categoryExists(categorySearch) && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="w-full"
                            onClick={() => {
                              setFormData({ ...formData, category: categorySearch });
                              setCategoryOpen(false);
                              setCategorySearch('');
                            }}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Create "{categorySearch}"
                          </Button>
                        )}
                        {categorySearch && categoryExists(categorySearch) && (
                          <p className="text-xs text-destructive">Category already exists</p>
                        )}
                      </div>
                    </CommandEmpty>
                    <CommandGroup>
                      {filteredCategories.map((category) => (
                        <CommandItem
                          key={category}
                          value={category}
                          onSelect={(value) => {
                            setFormData({ ...formData, category: value });
                            setCategoryOpen(false);
                            setCategorySearch('');
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              formData.category === category ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {category}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price per Unit *</Label>
              <Input
                id="price"
                type="number"
                min="0.01"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <Label htmlFor="stock">Stock Quantity *</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                step="1"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                placeholder="0"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minStockLevel">Min Stock Level</Label>
              <Input
                id="minStockLevel"
                type="number"
                min="0"
                step="1"
                value={formData.minStockLevel}
                onChange={(e) => setFormData({ ...formData, minStockLevel: parseInt(e.target.value) || 20 })}
                placeholder="20"
              />
            </div>

            <div>
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                type="date"
                value={formData.expiryDate || ''}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value || undefined })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="batchNumber">Batch/Lot Number</Label>
            <Input
              id="batchNumber"
              value={formData.batchNumber || ''}
              onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value || undefined })}
              placeholder="e.g., BN12345"
            />
          </div>

          <div className="bg-muted p-3 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total Value:</span>
              <span className="text-lg font-bold text-primary">
                ${(formData.price * formData.stock).toFixed(2)}
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => {
              onOpenChange(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button type="submit">{editMedicine ? 'Update' : 'Add'} Item</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddInventoryDialog;
