import { useState, useMemo } from 'react';
import PageHeader from '@/components/Layout/PageHeader';
import BottomNav from '@/components/Layout/BottomNav';
import GlobalSearchBar from '@/components/Search/GlobalSearchBar';
import DateRangeFilter from '@/components/Reports/DateRangeFilter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign, 
  Calendar, 
  User, 
  FileText, 
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  Receipt
} from 'lucide-react';
import { Expense, Patient, Payment } from '@/types';
import { toast } from 'sonner';

// Mock data
const mockPatients: Patient[] = [
  {
    id: '1',
    name: 'John Smith',
    registrationNumber: 'REG-2024-001',
    age: 45,
    gender: 'Male',
    contact: '+1 234-567-8900',
    startDate: '2024-01-15',
    isActive: true,
    rehabProgram: 'Physical Therapy',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    registrationNumber: 'REG-2024-002',
    age: 32,
    gender: 'Female',
    contact: '+1 234-567-8901',
    startDate: '2024-02-01',
    isActive: true,
    rehabProgram: 'Cardiac Rehab',
  },
];

const mockExpenses: Expense[] = [
  {
    id: '1',
    patientId: '1',
    registrationNumber: 'REG-2024-001',
    expenseTypeId: '1',
    expenseTypeName: 'Medicine',
    date: '2024-03-15',
    description: 'Paracetamol 500mg',
    quantity: 20,
    unitPrice: 2.5,
    totalAmount: 50,
    isPaid: false,
    paidAmount: 0,
  },
  {
    id: '2',
    patientId: '1',
    registrationNumber: 'REG-2024-001',
    expenseTypeId: '2',
    expenseTypeName: 'Rehab Session',
    date: '2024-03-15',
    description: 'Physical therapy session',
    quantity: 1,
    unitPrice: 150,
    totalAmount: 150,
    isPaid: false,
    paidAmount: 0,
  },
  {
    id: '3',
    patientId: '2',
    registrationNumber: 'REG-2024-002',
    expenseTypeId: '3',
    expenseTypeName: 'Diagnostic Test',
    date: '2024-03-14',
    description: 'MRI Scan',
    quantity: 1,
    unitPrice: 500,
    totalAmount: 500,
    isPaid: false,
    paidAmount: 250,
  },
];

type Bill = {
  id: string;
  patientId: string;
  patientName: string;
  registrationNumber: string;
  billDate: string;
  expenses: Expense[];
  totalAmount: number;
  paidAmount: number;
  status: 'pending' | 'partial' | 'paid' | 'advance';
};

const Billing = () => {
  const [expenses] = useState<Expense[]>(mockExpenses);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'partial' | 'paid'>('all');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'UPI' | 'Insurance'>('Cash');

  // Generate bills from expenses
  const bills = useMemo(() => {
    const billMap: Record<string, Bill> = {};

    expenses.forEach((expense) => {
      const key = `${expense.registrationNumber}-${expense.date}`;
      
      if (!billMap[key]) {
        const patient = mockPatients.find(p => p.registrationNumber === expense.registrationNumber);
        billMap[key] = {
          id: key,
          patientId: expense.patientId,
          patientName: patient?.name || 'Unknown Patient',
          registrationNumber: expense.registrationNumber,
          billDate: expense.date,
          expenses: [],
          totalAmount: 0,
          paidAmount: 0,
          status: 'pending',
        };
      }

      billMap[key].expenses.push(expense);
      billMap[key].totalAmount += expense.totalAmount;
      billMap[key].paidAmount += expense.paidAmount;
    });

    // Determine status
    Object.values(billMap).forEach((bill) => {
      if (bill.paidAmount === 0) {
        bill.status = 'pending';
      } else if (bill.paidAmount >= bill.totalAmount) {
        bill.status = bill.paidAmount > bill.totalAmount ? 'advance' : 'paid';
      } else {
        bill.status = 'partial';
      }
    });

    return Object.values(billMap);
  }, [expenses]);

  // Filter bills
  const filteredBills = useMemo(() => {
    let filtered = bills;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((bill) =>
        bill.patientName.toLowerCase().includes(query) ||
        bill.registrationNumber.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((bill) => bill.status === statusFilter);
    }

    if (startDate) {
      const startStr = startDate.toISOString().split('T')[0];
      filtered = filtered.filter((bill) => bill.billDate >= startStr);
    }

    if (endDate) {
      const endStr = endDate.toISOString().split('T')[0];
      filtered = filtered.filter((bill) => bill.billDate <= endStr);
    }

    return filtered.sort((a, b) => 
      new Date(b.billDate).getTime() - new Date(a.billDate).getTime()
    );
  }, [bills, searchQuery, statusFilter, startDate, endDate]);

  const handleProcessPayment = () => {
    if (!selectedBill || !paymentAmount) {
      toast.error('Please enter payment amount');
      return;
    }

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    // TODO: Replace with actual API call using billingAPI.processPayment()
    toast.success(`Payment of $${amount} processed via ${paymentMethod}`);
    setPaymentDialogOpen(false);
    setPaymentAmount('');
  };

  const totalPending = filteredBills
    .filter(b => b.status === 'pending' || b.status === 'partial')
    .reduce((sum, b) => sum + (b.totalAmount - b.paidAmount), 0);

  const totalCollected = filteredBills.reduce((sum, b) => sum + b.paidAmount, 0);

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader
        title="Billing & Payments"
        subtitle={`${filteredBills.length} bill${filteredBills.length !== 1 ? 's' : ''}`}
      />

      <div className="max-w-md mx-auto px-4 py-4">
        {/* Search */}
        <div className="mb-4">
          <GlobalSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by patient or registration no..."
            onClear={() => setSearchQuery('')}
          />
        </div>

        {/* Date Filter */}
        <div className="mb-4">
          <DateRangeFilter
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onClear={() => {
              setStartDate(undefined);
              setEndDate(undefined);
            }}
          />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Card className="p-4 text-center shadow-soft">
            <div className="text-2xl font-bold text-warning">${totalPending.toFixed(0)}</div>
            <div className="text-xs text-muted-foreground mt-1">Pending</div>
          </Card>
          <Card className="p-4 text-center shadow-soft">
            <div className="text-2xl font-bold text-success">${totalCollected.toFixed(0)}</div>
            <div className="text-xs text-muted-foreground mt-1">Collected</div>
          </Card>
        </div>

        {/* Status Filter */}
        <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)} className="mb-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="partial">Partial</TabsTrigger>
            <TabsTrigger value="paid">Paid</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Bills List */}
        <div className="space-y-4">
          {filteredBills.map((bill) => (
            <Card key={bill.id} className="overflow-hidden shadow-soft">
              {/* Bill Header */}
              <div className="bg-muted/50 px-4 py-3 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Receipt className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base text-foreground">{bill.patientName}</h3>
                      <p className="text-xs text-muted-foreground">Bill #{bill.id.split('-').pop()}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(bill.billDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Badge 
                      className={
                        bill.status === 'paid' ? 'bg-success/10 text-success border-success/20' :
                        bill.status === 'partial' ? 'bg-info/10 text-info border-info/20' :
                        bill.status === 'advance' ? 'bg-secondary/10 text-secondary border-secondary/20' :
                        'bg-warning/10 text-warning border-warning/20'
                      }
                    >
                      {bill.status === 'paid' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {bill.status === 'partial' && <Clock className="h-3 w-3 mr-1" />}
                      {bill.status === 'pending' && <AlertCircle className="h-3 w-3 mr-1" />}
                      {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Bill Details */}
              <div className="px-4 py-3">
                <div className="space-y-2 mb-3">
                  {bill.expenses.map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between text-sm">
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{expense.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {expense.quantity} × ${expense.unitPrice.toFixed(2)}
                        </p>
                      </div>
                      <p className="font-semibold text-foreground">${expense.totalAmount.toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                <Separator className="my-3" />

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total Amount</span>
                    <span className="font-semibold text-foreground">${bill.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Amount Paid</span>
                    <span className="font-semibold text-success">${bill.paidAmount.toFixed(2)}</span>
                  </div>
                  {bill.status !== 'paid' && (
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <span className="font-semibold text-foreground">Balance Due</span>
                      <span className="font-bold text-lg text-warning">
                        ${(bill.totalAmount - bill.paidAmount).toFixed(2)}
                      </span>
                    </div>
                  )}
                  {bill.status === 'advance' && (
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <span className="font-semibold text-foreground">Advance Paid</span>
                      <span className="font-bold text-lg text-secondary">
                        ${(bill.paidAmount - bill.totalAmount).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Payment Button */}
                {bill.status !== 'paid' && (
                  <Button
                    className="w-full mt-4"
                    onClick={() => {
                      setSelectedBill(bill);
                      setPaymentAmount((bill.totalAmount - bill.paidAmount).toFixed(2));
                      setPaymentDialogOpen(true);
                    }}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Process Payment
                  </Button>
                )}
              </div>
            </Card>
          ))}

          {filteredBills.length === 0 && (
            <Card className="p-8 text-center shadow-soft">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No bills found</p>
            </Card>
          )}
        </div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Payment</DialogTitle>
          </DialogHeader>
          {selectedBill && (
            <div className="space-y-4">
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">Patient</p>
                <p className="font-semibold text-foreground">{selectedBill.patientName}</p>
                <p className="text-xs text-muted-foreground mt-1">{selectedBill.registrationNumber}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="text-lg font-bold text-foreground">${selectedBill.totalAmount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Already Paid</p>
                  <p className="text-lg font-bold text-success">${selectedBill.paidAmount.toFixed(2)}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment-amount">Payment Amount</Label>
                <Input
                  id="payment-amount"
                  type="number"
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment-method">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={(v: any) => setPaymentMethod(v)}>
                  <SelectTrigger id="payment-method">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Card">Card</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="Insurance">Insurance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button className="w-full" onClick={handleProcessPayment}>
                <DollarSign className="h-4 w-4 mr-2" />
                Process Payment
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default Billing;
