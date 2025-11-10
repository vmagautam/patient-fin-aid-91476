import { useState, useMemo } from "react";
import PageHeader from "@/components/Layout/PageHeader";
import BottomNav from "@/components/Layout/BottomNav";
import GlobalSearchBar from "@/components/Search/GlobalSearchBar";
import DateRangeFilter from "@/components/Reports/DateRangeFilter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DollarSign,
  Calendar,
  User,
  FileText,
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  Receipt,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Expense, Patient } from "@/types";
import { toast } from "sonner";

// Mock data
const mockPatients: Patient[] = [
  {
    id: "1",
    name: "John Smith",
    registrationNumber: "REG-2024-001",
    age: 45,
    gender: "Male",
    contact: "+1 234-567-8900",
    startDate: "2024-01-15",
    isActive: true,
    rehabProgram: "Physical Therapy",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    registrationNumber: "REG-2024-002",
    age: 32,
    gender: "Female",
    contact: "+1 234-567-8901",
    startDate: "2024-02-01",
    isActive: true,
    rehabProgram: "Cardiac Rehab",
  },
];

const mockExpenses: Expense[] = [
  {
    id: "1",
    patientId: "1",
    registrationNumber: "REG-2024-001",
    expenseTypeId: "1",
    expenseTypeName: "Registration Fee",
    date: "2024-03-15",
    description: "Registration Fee",
    quantity: 1,
    unitPrice: 1000,
    totalAmount: 1000,
  },
  {
    id: "2",
    patientId: "1",
    registrationNumber: "REG-2024-001",
    expenseTypeId: "2",
    expenseTypeName: "Rehabilitation Charge",
    date: "2024-03-15",
    description: "Rehab duration - 3 Oct 2025 to 1 Nov 2025",
    quantity: 1,
    unitPrice: 15500,
    totalAmount: 15500,
  },
  {
    id: "3",
    patientId: "1",
    registrationNumber: "REG-2024-001",
    expenseTypeId: "3",
    expenseTypeName: "Drug Test",
    date: "2024-03-15",
    description: "Drug Test",
    quantity: 1,
    unitPrice: 1700,
    totalAmount: 1700,
  },
  {
    id: "4",
    patientId: "1",
    registrationNumber: "REG-2024-001",
    expenseTypeId: "4",
    expenseTypeName: "Doctor Fee",
    date: "2024-03-15",
    description:
      "Doctor Fee (Dr. Bipin Kumar)\nFirst Visit - 5 Oct 2025\nSecond Visit - 31 Oct 2025",
    quantity: 2,
    unitPrice: 1000,
    totalAmount: 2000,
  },
  {
    id: "5",
    patientId: "1",
    registrationNumber: "REG-2024-001",
    expenseTypeId: "5",
    expenseTypeName: "Blood Test",
    date: "2024-03-15",
    description: "Blood Test",
    quantity: 1,
    unitPrice: 1000,
    totalAmount: 1000,
  },
  {
    id: "6",
    patientId: "1",
    registrationNumber: "REG-2024-001",
    expenseTypeId: "6",
    expenseTypeName: "Mental Health Battery Test",
    date: "2024-03-15",
    description: "Mental Health Battery Test\nPsychological Test - 31 Oct 2025",
    quantity: 1,
    unitPrice: 700,
    totalAmount: 700,
  },
  {
    id: "7",
    patientId: "1",
    registrationNumber: "REG-2024-001",
    expenseTypeId: "7",
    expenseTypeName: "Miscellaneous Expense",
    date: "2024-03-15",
    description: "Miscellaneous Expense",
    quantity: 1,
    unitPrice: 200,
    totalAmount: 200,
  },
  {
    id: "8",
    patientId: "1",
    registrationNumber: "REG-2024-001",
    expenseTypeId: "8",
    expenseTypeName: "Medicine",
    date: "2024-03-15",
    description: "Medicine",
    quantity: 1,
    unitPrice: 1404,
    totalAmount: 1404,
  },
  {
    id: "9",
    patientId: "2",
    registrationNumber: "REG-2024-002",
    expenseTypeId: "1",
    expenseTypeName: "Registration Fee",
    date: "2024-03-14",
    description: "Registration Fee",
    quantity: 1,
    unitPrice: 1000,
    totalAmount: 1000,
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
  status: "pending" | "partial" | "paid" | "advance";
};

// Patient summary for billing overview
type PatientBillingSummary = {
  patientId: string;
  patientName: string;
  registrationNumber: string;
  totalBills: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  lastBillDate: string;
  status: "pending" | "partial" | "paid" | "advance";
};

// Bills grouped by date for detail view
type DateGroupedBills = {
  date: string;
  bills: Bill[];
  totalAmount: number;
  paidAmount: number;
};

const Billing = () => {
  const [expenses] = useState<Expense[]>(mockExpenses);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<
    "Cash" | "Card" | "UPI" | "Insurance"
  >("Cash");

  // View state: null = overview, patientId = detail view
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    null
  );
  const [openDateSections, setOpenDateSections] = useState<
    Record<string, boolean>
  >({});

  // Generate bills from expenses
  const bills = useMemo(() => {
    const billMap: Record<string, Bill> = {};

    expenses.forEach((expense) => {
      const key = `${expense.registrationNumber}-${expense.date}`;

      if (!billMap[key]) {
        const patient = mockPatients.find(
          (p) => p.registrationNumber === expense.registrationNumber
        );
        billMap[key] = {
          id: key,
          patientId: expense.patientId,
          patientName: patient?.name || "Unknown Patient",
          registrationNumber: expense.registrationNumber,
          billDate: expense.date,
          expenses: [],
          totalAmount: 0,
          paidAmount: 0,
          status: "pending",
        };
      }

      billMap[key].expenses.push(expense);
      billMap[key].totalAmount += expense.totalAmount;
    });

    // Determine status
    Object.values(billMap).forEach((bill) => {
      if (bill.paidAmount === 0) {
        bill.status = "pending";
      } else if (bill.paidAmount >= bill.totalAmount) {
        bill.status = bill.paidAmount > bill.totalAmount ? "advance" : "paid";
      } else {
        bill.status = "partial";
      }
    });

    return Object.values(billMap);
  }, [expenses]);

  // Filter bills
  const filteredBills = useMemo(() => {
    let filtered = bills;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (bill) =>
          bill.patientName.toLowerCase().includes(query) ||
          bill.registrationNumber.toLowerCase().includes(query)
      );
    }

    if (startDate) {
      const startStr = startDate.toISOString().split("T")[0];
      filtered = filtered.filter((bill) => bill.billDate >= startStr);
    }

    if (endDate) {
      const endStr = endDate.toISOString().split("T")[0];
      filtered = filtered.filter((bill) => bill.billDate <= endStr);
    }

    return filtered.sort(
      (a, b) => new Date(b.billDate).getTime() - new Date(a.billDate).getTime()
    );
  }, [bills, searchQuery, startDate, endDate]);

  // Generate patient billing summaries for overview
  const patientBillingSummaries = useMemo(() => {
    const summaryMap = filteredBills.reduce((acc, bill) => {
      if (!acc[bill.patientId]) {
        acc[bill.patientId] = {
          patientId: bill.patientId,
          patientName: bill.patientName,
          registrationNumber: bill.registrationNumber,
          totalBills: 0,
          totalAmount: 0,
          paidAmount: 0,
          pendingAmount: 0,
          lastBillDate: bill.billDate,
          status: "pending" as const,
        };
      }

      acc[bill.patientId].totalBills += 1;
      acc[bill.patientId].totalAmount += bill.totalAmount;
      acc[bill.patientId].paidAmount += bill.paidAmount;
      acc[bill.patientId].pendingAmount += bill.totalAmount - bill.paidAmount;

      // Update last bill date if this one is more recent
      if (bill.billDate > acc[bill.patientId].lastBillDate) {
        acc[bill.patientId].lastBillDate = bill.billDate;
      }

      return acc;
    }, {} as Record<string, PatientBillingSummary>);

    // Determine overall status for each patient
    Object.values(summaryMap).forEach((summary) => {
      if (summary.paidAmount === 0) {
        summary.status = "pending";
      } else if (summary.paidAmount >= summary.totalAmount) {
        summary.status =
          summary.paidAmount > summary.totalAmount ? "advance" : "paid";
      } else {
        summary.status = "partial";
      }
    });

    return Object.values(summaryMap).sort(
      (a, b) =>
        new Date(b.lastBillDate).getTime() - new Date(a.lastBillDate).getTime()
    );
  }, [filteredBills]);

  // Generate date-grouped bills for detail view
  const dateGroupedBills = useMemo(() => {
    if (!selectedPatientId) return [];

    const patientBills = filteredBills.filter(
      (bill) => bill.patientId === selectedPatientId
    );

    const grouped = patientBills.reduce((acc, bill) => {
      if (!acc[bill.billDate]) {
        acc[bill.billDate] = {
          date: bill.billDate,
          bills: [],
          totalAmount: 0,
          paidAmount: 0,
        };
      }

      acc[bill.billDate].bills.push(bill);
      acc[bill.billDate].totalAmount += bill.totalAmount;
      acc[bill.billDate].paidAmount += bill.paidAmount;

      return acc;
    }, {} as Record<string, DateGroupedBills>);

    return Object.values(grouped).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [filteredBills, selectedPatientId]);

  const handleProcessPayment = () => {
    if (!selectedBill || !paymentAmount) {
      toast.error("Please enter payment amount");
      return;
    }

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    // TODO: Replace with actual API call using billingAPI.processPayment()
    toast.success(`Payment of $${amount} processed via ${paymentMethod}`);
    setPaymentDialogOpen(false);
    setPaymentAmount("");
  };

  const toggleDateSection = (date: string) => {
    setOpenDateSections((prev) => ({
      ...prev,
      [date]: !prev[date],
    }));
  };

  const selectedPatient = selectedPatientId
    ? mockPatients.find((p) => p.id === selectedPatientId)
    : null;

  const totalPending = patientBillingSummaries.reduce(
    (sum, patient) => sum + patient.pendingAmount,
    0
  );

  const totalCollected = patientBillingSummaries.reduce(
    (sum, patient) => sum + patient.paidAmount,
    0
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader
        title="Billing & Payments"
        subtitle={
          selectedPatientId
            ? selectedPatient?.name || "Patient Bills"
            : `${patientBillingSummaries.length} patient${
                patientBillingSummaries.length !== 1 ? "s" : ""
              } with bills`
        }
        action={
          selectedPatientId ? (
            <Button
              size="icon"
              variant="ghost"
              className="bg-white/20 hover:bg-white/30 text-white border-0"
              onClick={() => setSelectedPatientId(null)}
              title="Back to overview"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          ) : undefined
        }
      />

      <div className="max-w-md mx-auto px-4 py-4">
        {/* Search Bar */}
        <div className="mb-4">
          <GlobalSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by patient, registration no..."
            onClear={() => setSearchQuery("")}
          />
        </div>

        {/* Date Range Filter */}
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

        {/* Overview: Patient Summary Cards */}
        {!selectedPatientId && (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <Card className="p-4 text-center shadow-soft">
                <div className="text-2xl font-bold text-warning">
                  ${totalPending.toFixed(0)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Pending
                </div>
              </Card>
              <Card className="p-4 text-center shadow-soft">
                <div className="text-2xl font-bold text-success">
                  ${totalCollected.toFixed(0)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Collected
                </div>
              </Card>
            </div>

            <div className="space-y-3">
              {patientBillingSummaries.map((summary) => (
                <Card
                  key={summary.patientId}
                  className="p-4 shadow-soft cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedPatientId(summary.patientId)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="bg-primary/10 p-2.5 rounded-lg">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-base text-foreground">
                          {summary.patientName}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {summary.registrationNumber}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <Badge
                            className={
                              summary.status === "paid"
                                ? "bg-success/10 text-success border-success/20"
                                : summary.status === "partial"
                                ? "bg-info/10 text-info border-info/20"
                                : summary.status === "advance"
                                ? "bg-secondary/10 text-secondary border-secondary/20"
                                : "bg-warning/10 text-warning border-warning/20"
                            }
                          >
                            {summary.status === "paid" && (
                              <CheckCircle className="h-3 w-3 mr-1" />
                            )}
                            {summary.status === "partial" && (
                              <Clock className="h-3 w-3 mr-1" />
                            )}
                            {summary.status === "pending" && (
                              <AlertCircle className="h-3 w-3 mr-1" />
                            )}
                            {summary.status.charAt(0).toUpperCase() +
                              summary.status.slice(1)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Last:{" "}
                            {new Date(summary.lastBillDate).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-3">
                      <p className="text-lg font-bold text-foreground">
                        ${summary.totalAmount.toFixed(0)}
                      </p>
                      <p className="text-xs text-muted-foreground">Total</p>
                      {summary.pendingAmount > 0 && (
                        <p className="text-sm font-semibold text-warning">
                          ${summary.pendingAmount.toFixed(0)} due
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}

              {patientBillingSummaries.length === 0 && (
                <Card className="p-8 text-center">
                  <div className="flex flex-col items-center">
                    <div className="bg-muted/50 p-4 rounded-full mb-4">
                      <Receipt className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground mb-2 font-medium">
                      {searchQuery || startDate || endDate
                        ? "No bills found"
                        : "No bills recorded yet"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {searchQuery || startDate || endDate
                        ? "Try adjusting your filters"
                        : "Bills will appear here once services are added"}
                    </p>
                  </div>
                </Card>
              )}
            </div>
          </>
        )}

        {/* Detail View: Date-Grouped Bills */}
        {selectedPatientId && selectedPatient && (
          <>
            {/* Patient Info Card */}
            <Card className="p-4 shadow-soft mb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-primary/10 p-2.5 rounded-lg">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-base text-foreground">
                    {selectedPatient.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {selectedPatient.registrationNumber}
                  </p>
                </div>
              </div>
              <Separator className="my-3" />
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-xl font-bold text-foreground">
                    {dateGroupedBills.length}
                  </p>
                  <p className="text-xs text-muted-foreground">Bill Dates</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-success">
                    $
                    {dateGroupedBills
                      .reduce((sum, group) => sum + group.paidAmount, 0)
                      .toFixed(0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Paid</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-warning">
                    $
                    {dateGroupedBills
                      .reduce(
                        (sum, group) =>
                          sum + (group.totalAmount - group.paidAmount),
                        0
                      )
                      .toFixed(0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
              </div>
            </Card>

            {/* Date-Grouped Bills */}
            <div className="space-y-3">
              {dateGroupedBills.map((group) => (
                <Card key={group.date} className="overflow-hidden shadow-soft">
                  <Collapsible
                    open={openDateSections[group.date] ?? true}
                    onOpenChange={() => toggleDateSection(group.date)}
                  >
                    <CollapsibleTrigger className="w-full">
                      <div className="bg-muted/50 px-4 py-3 border-b border-border flex items-center justify-between hover:bg-muted/70 transition-colors">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-primary" />
                          <div className="text-left">
                            <p className="font-semibold text-sm text-foreground">
                              {new Date(group.date).toLocaleDateString(
                                "en-US",
                                {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {group.bills.length} bill
                              {group.bills.length !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-sm text-foreground">
                            ${group.totalAmount.toFixed(2)}
                          </span>
                          {openDateSections[group.date] ?? true ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <div className="px-4 py-3">
                        <div className="space-y-3">
                          {group.bills.map((bill) => (
                            <div
                              key={bill.id}
                              className="border border-border rounded-lg p-3"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <Badge
                                    className={
                                      bill.status === "paid"
                                        ? "bg-success/10 text-success border-success/20"
                                        : bill.status === "partial"
                                        ? "bg-info/10 text-info border-info/20"
                                        : bill.status === "advance"
                                        ? "bg-secondary/10 text-secondary border-secondary/20"
                                        : "bg-warning/10 text-warning border-warning/20"
                                    }
                                  >
                                    {bill.status === "paid" && (
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                    )}
                                    {bill.status === "partial" && (
                                      <Clock className="h-3 w-3 mr-1" />
                                    )}
                                    {bill.status === "pending" && (
                                      <AlertCircle className="h-3 w-3 mr-1" />
                                    )}
                                    {bill.status.charAt(0).toUpperCase() +
                                      bill.status.slice(1)}
                                  </Badge>
                                  <p className="text-sm font-medium text-foreground mt-2">
                                    Bill #{bill.id.split("-").pop()}
                                  </p>
                                  <div className="space-y-1 mt-2">
                                    {bill.expenses.map((expense) => (
                                      <div
                                        key={expense.id}
                                        className="flex items-center justify-between text-xs"
                                      >
                                        <span className="text-muted-foreground">
                                          {expense.description}
                                        </span>
                                        <span className="font-medium">
                                          ${expense.totalAmount.toFixed(2)}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div className="text-right ml-3">
                                  <p className="text-base font-bold text-foreground">
                                    ${bill.totalAmount.toFixed(2)}
                                  </p>
                                  <p className="text-xs text-success">
                                    Paid: ${bill.paidAmount.toFixed(2)}
                                  </p>
                                  {bill.status !== "paid" && (
                                    <p className="text-xs text-warning font-medium">
                                      Due: $
                                      {(
                                        bill.totalAmount - bill.paidAmount
                                      ).toFixed(2)}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <Separator className="my-2" />

                              <div className="flex gap-2 justify-end">
                                {bill.status !== "paid" && (
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      setSelectedBill(bill);
                                      setPaymentAmount(
                                        (
                                          bill.totalAmount - bill.paidAmount
                                        ).toFixed(2)
                                      );
                                      setPaymentDialogOpen(true);
                                    }}
                                  >
                                    <CreditCard className="h-3.5 w-3.5 mr-1" />
                                    Pay
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              ))}

              {dateGroupedBills.length === 0 && (
                <Card className="p-8 text-center">
                  <div className="flex flex-col items-center">
                    <div className="bg-muted/50 p-4 rounded-full mb-4">
                      <Receipt className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground mb-2 font-medium">
                      No bills found for this patient
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {searchQuery || startDate || endDate
                        ? "Try adjusting your filters"
                        : "Bills will appear here once services are added"}
                    </p>
                  </div>
                </Card>
              )}
            </div>
          </>
        )}
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
                <p className="font-semibold text-foreground">
                  {selectedBill.patientName}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedBill.registrationNumber}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="text-lg font-bold text-foreground">
                    ${selectedBill.totalAmount.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Already Paid</p>
                  <p className="text-lg font-bold text-success">
                    ${selectedBill.paidAmount.toFixed(2)}
                  </p>
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
                <Select
                  value={paymentMethod}
                  onValueChange={(v: unknown) => setPaymentMethod(v)}
                >
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
