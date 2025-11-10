import { useState, useMemo } from "react";
import PageHeader from "@/components/Layout/PageHeader";
import BottomNav from "@/components/Layout/BottomNav";
import GlobalSearchBar from "@/components/Search/GlobalSearchBar";
import AddExpenseDialog from "@/components/Dialogs/AddExpenseDialog";
import AddMultipleExpensesDialog from "@/components/Dialogs/AddMultipleExpensesDialog";
import DeleteConfirmDialog from "@/components/Dialogs/DeleteConfirmDialog";
import DateRangeFilter from "@/components/Reports/DateRangeFilter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Plus,
  UserPlus,
  Calendar,
  Edit,
  Trash2,
  FileText,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  User,
} from "lucide-react";
import { Expense, Patient, ExpenseType, Medicine } from "@/types";
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
    isActive: false,
    rehabProgram: "Cardiac Rehab",
  },
  {
    id: "3",
    name: "Michael Brown",
    registrationNumber: "REG-2024-003",
    age: 58,
    gender: "Male",
    contact: "+1 234-567-8902",
    startDate: "2024-02-20",
    isActive: true,
    rehabProgram: "Neurological Rehab",
  },
];

const mockExpenseTypes: ExpenseType[] = [
  {
    id: "1",
    name: "Medicine",
    description: "Pharmaceutical medications and drugs",
  },
  {
    id: "2",
    name: "Rehab Session",
    description: "Physical therapy and rehabilitation sessions",
  },
  {
    id: "3",
    name: "Diagnostic Test",
    description: "Medical tests and diagnostics",
  },
  {
    id: "4",
    name: "Consultation",
    description: "Doctor consultations and check-ups",
  },
];

const mockMedicines: Medicine[] = [
  {
    id: "1",
    name: "Paracetamol 500mg",
    category: "Pain Relief",
    price: 2.5,
    stock: 150,
    minStockLevel: 50,
    expiryDate: "2025-12-31",
    dateAdded: "2024-01-15",
  },
  {
    id: "2",
    name: "Ibuprofen 400mg",
    category: "Anti-inflammatory",
    price: 3.0,
    stock: 80,
    minStockLevel: 20,
    expiryDate: "2025-06-30",
    dateAdded: "2024-02-10",
  },
  {
    id: "3",
    name: "Amoxicillin 250mg",
    category: "Antibiotic",
    price: 5.5,
    stock: 75,
    minStockLevel: 30,
    expiryDate: "2024-11-30",
    dateAdded: "2024-01-20",
  },
];

const mockExpenses: Expense[] = [
  {
    id: "1",
    patientId: "1",
    registrationNumber: "REG-2024-001",
    expenseTypeId: "1",
    expenseTypeName: "Medicine",
    date: "2024-03-15",
    description: "Paracetamol 500mg",
    quantity: 20,
    unitPrice: 2.5,
    totalAmount: 50,
    medicineId: "1",
  },
  {
    id: "2",
    patientId: "1",
    registrationNumber: "REG-2024-001",
    expenseTypeId: "2",
    expenseTypeName: "Rehab Session",
    date: "2024-03-14",
    description: "Physical therapy session",
    quantity: 1,
    unitPrice: 150,
    totalAmount: 150,
  },
  {
    id: "3",
    patientId: "3",
    registrationNumber: "REG-2024-003",
    expenseTypeId: "3",
    expenseTypeName: "Diagnostic Test",
    date: "2024-03-13",
    description: "MRI Scan",
    quantity: 1,
    unitPrice: 500,
    totalAmount: 500,
  },
  {
    id: "4",
    patientId: "2",
    registrationNumber: "REG-2024-002",
    expenseTypeId: "1",
    expenseTypeName: "Medicine",
    date: "2024-03-12",
    description: "Blood pressure medication",
    quantity: 30,
    unitPrice: 3,
    totalAmount: 90,
  },
  {
    id: "5",
    patientId: "1",
    registrationNumber: "REG-2024-001",
    expenseTypeId: "4",
    expenseTypeName: "Consultation",
    date: "2024-03-15",
    description: "Follow-up consultation",
    quantity: 1,
    unitPrice: 100,
    totalAmount: 100,
  },
];

// Patient summary for overview
type PatientSummary = {
  patientId: string;
  patientName: string;
  registrationNumber: string;
  totalServices: number;
  totalAmount: number;
  lastServiceDate: string;
};

// Services grouped by date for detail view
type DateGroupedServices = {
  date: string;
  expenses: Expense[];
  totalAmount: number;
};

const EnhancedExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAddMultipleDialogOpen, setIsAddMultipleDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>(
    undefined
  );
  const [deleteExpense, setDeleteExpense] = useState<Expense | undefined>(
    undefined
  );

  // View state: null = overview, patientId = detail view
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    null
  );
  const [openDateSections, setOpenDateSections] = useState<
    Record<string, boolean>
  >({});

  // Filter expenses
  const filteredExpenses = useMemo(() => {
    let filtered = expenses;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((exp) => {
        const patient = mockPatients.find((p) => p.id === exp.patientId);
        return (
          exp.description.toLowerCase().includes(query) ||
          exp.expenseTypeName.toLowerCase().includes(query) ||
          patient?.name.toLowerCase().includes(query) ||
          exp.registrationNumber.toLowerCase().includes(query)
        );
      });
    }

    // Date range filter
    if (startDate) {
      const startStr = startDate.toISOString().split("T")[0];
      filtered = filtered.filter((exp) => exp.date >= startStr);
    }
    if (endDate) {
      const endStr = endDate.toISOString().split("T")[0];
      filtered = filtered.filter((exp) => exp.date <= endStr);
    }

    return filtered;
  }, [expenses, searchQuery, startDate, endDate]);

  // Generate patient summaries for overview
  const patientSummaries = useMemo(() => {
    const summaryMap = filteredExpenses.reduce((acc, expense) => {
      if (!acc[expense.patientId]) {
        const patient = mockPatients.find((p) => p.id === expense.patientId);
        acc[expense.patientId] = {
          patientId: expense.patientId,
          patientName: patient?.name || "Unknown Patient",
          registrationNumber: expense.registrationNumber,
          totalServices: 0,
          totalAmount: 0,
          lastServiceDate: expense.date,
        };
      }

      acc[expense.patientId].totalServices += 1;
      acc[expense.patientId].totalAmount += expense.totalAmount;

      // Update last service date if this one is more recent
      if (expense.date > acc[expense.patientId].lastServiceDate) {
        acc[expense.patientId].lastServiceDate = expense.date;
      }

      return acc;
    }, {} as Record<string, PatientSummary>);

    return Object.values(summaryMap).sort(
      (a, b) =>
        new Date(b.lastServiceDate).getTime() -
        new Date(a.lastServiceDate).getTime()
    );
  }, [filteredExpenses]);

  // Generate date-grouped services for detail view
  const dateGroupedServices = useMemo(() => {
    if (!selectedPatientId) return [];

    const patientExpenses = filteredExpenses.filter(
      (exp) => exp.patientId === selectedPatientId
    );

    const grouped = patientExpenses.reduce((acc, expense) => {
      if (!acc[expense.date]) {
        acc[expense.date] = {
          date: expense.date,
          expenses: [],
          totalAmount: 0,
        };
      }

      acc[expense.date].expenses.push(expense);
      acc[expense.date].totalAmount += expense.totalAmount;

      return acc;
    }, {} as Record<string, DateGroupedServices>);

    return Object.values(grouped).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [filteredExpenses, selectedPatientId]);

  const handleSaveExpense = (expenseData: Omit<Expense, "id">) => {
    if (editingExpense) {
      setExpenses(
        expenses.map((e) =>
          e.id === editingExpense.id ? { ...expenseData, id: e.id } : e
        )
      );
      toast.success("Service updated successfully");
      setEditingExpense(undefined);
    } else {
      const newExpense: Expense = {
        ...expenseData,
        id: Date.now().toString(),
      };
      setExpenses([newExpense, ...expenses]);
      toast.success("Service added successfully");
    }
    setIsAddDialogOpen(false);
  };

  const handleSaveMultipleExpenses = (expensesData: Omit<Expense, "id">[]) => {
    const newExpenses: Expense[] = expensesData.map((expenseData, index) => ({
      ...expenseData,
      id: (Date.now() + index).toString(),
    }));
    setExpenses([...newExpenses, ...expenses]);
    setIsAddMultipleDialogOpen(false);
    toast.success(`${newExpenses.length} services added successfully`);
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setIsAddDialogOpen(true);
  };

  const handleDeleteExpense = () => {
    if (deleteExpense) {
      setExpenses(expenses.filter((e) => e.id !== deleteExpense.id));
      toast.success("Service deleted successfully");
      setDeleteExpense(undefined);
    }
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

  const totalAmount = patientSummaries.reduce(
    (sum, patient) => sum + patient.totalAmount,
    0
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader
        title="Services"
        subtitle={
          selectedPatientId
            ? selectedPatient?.name || "Patient Details"
            : `${patientSummaries.length} patient${
                patientSummaries.length !== 1 ? "s" : ""
              } with services`
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
          ) : (
            <div className="flex gap-2">
              <Button
                size="icon"
                variant="outline"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                onClick={() => setIsAddMultipleDialogOpen(true)}
                title="Add multiple services for patient"
              >
                <UserPlus className="h-5 w-5" />
              </Button>
              <Button
                size="icon"
                className="bg-white/20 hover:bg-white/30 text-white border-0"
                onClick={() => {
                  setEditingExpense(undefined);
                  setIsAddDialogOpen(true);
                }}
                title="Add single service"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          )
        }
      />

      <div className="max-w-md mx-auto px-4 py-4">
        {/* Search Bar */}
        <div className="mb-4">
          <GlobalSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by patient, registration no., service..."
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
            <Card className="p-4 text-center shadow-soft mb-4">
              <div className="text-2xl font-bold text-foreground">
                ${totalAmount.toFixed(0)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Total Services Value
              </div>
            </Card>

            <div className="space-y-3">
              {patientSummaries.map((summary) => (
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
                        <p className="flex itemsxt-muted-foreground">
                          {summary.registrationNumber}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <Badge variant="secondary" className="text-xs">
                            {summary.totalServices} service
                            {summary.totalServices !== 1 ? "s" : ""}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Last:{" "}
                            {new Date(
                              summary.lastServiceDate
                            ).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-3">
                      <p className="text-lg font-bold text-foreground">
                        ${summary.totalAmount.toFixed(0)}
                      </p>
                      <p className="text-xs text-muted-foreground">Total</p>
                    </div>
                  </div>
                </Card>
              ))}

              {patientSummaries.length === 0 && (
                <Card className="p-8 text-center">
                  <div className="flex flex-col items-center">
                    <div className="bg-muted/50 p-4 rounded-full mb-4">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground mb-2 font-medium">
                      {searchQuery || startDate || endDate
                        ? "No services found"
                        : "No services recorded yet"}
                    </p>
                    <p className="text-xs text-muted-foreground mb-4">
                      {searchQuery || startDate || endDate
                        ? "Try adjusting your filters"
                        : "Start by adding services for a patient"}
                    </p>
                    <Button onClick={() => setIsAddMultipleDialogOpen(true)}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Patient Services
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          </>
        )}

        {/* Detail View: Date-Grouped Services */}
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
              <div className="grid grid-cols-2 gap-3 text-center">
                <div>
                  <p className="text-xl font-bold text-foreground">
                    {dateGroupedServices.length}
                  </p>
                  <p className="text-xs text-muted-foreground">Service Dates</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">
                    $
                    {dateGroupedServices
                      .reduce((sum, group) => sum + group.totalAmount, 0)
                      .toFixed(0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Amount</p>
                </div>
              </div>
            </Card>

            {/* Date-Grouped Services */}
            <div className="space-y-3">
              {dateGroupedServices.map((group) => (
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
                              {group.expenses.length} service
                              {group.expenses.length !== 1 ? "s" : ""}
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
                          {group.expenses.map((expense) => (
                            <div
                              key={expense.id}
                              className="border border-border rounded-lg p-3"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <Badge
                                    variant="secondary"
                                    className="text-xs mb-2"
                                  >
                                    {expense.expenseTypeName}
                                  </Badge>
                                  <p className="text-sm font-medium text-foreground">
                                    {expense.description}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Qty: {expense.quantity} × $
                                    {expense.unitPrice.toFixed(2)}
                                  </p>
                                </div>
                                <div className="text-right ml-3">
                                  <p className="text-base font-bold text-foreground">
                                    ${expense.totalAmount.toFixed(2)}
                                  </p>
                                </div>
                              </div>

                              <Separator className="my-2" />

                              <div className="flex gap-2 justify-end">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEditExpense(expense)}
                                >
                                  <Edit className="h-3.5 w-3.5 mr-1" />
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-destructive hover:bg-destructive/10"
                                  onClick={() => setDeleteExpense(expense)}
                                >
                                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              ))}

              {dateGroupedServices.length === 0 && (
                <Card className="p-8 text-center">
                  <div className="flex flex-col items-center">
                    <div className="bg-muted/50 p-4 rounded-full mb-4">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground mb-2 font-medium">
                      No services found for this patient
                    </p>
                    <p className="text-xs text-muted-foreground mb-4">
                      {searchQuery || startDate || endDate
                        ? "Try adjusting your filters"
                        : "Add services to get started"}
                    </p>
                  </div>
                </Card>
              )}
            </div>
          </>
        )}
      </div>

      {/* Add/Edit Single Expense Dialog */}
      <AddExpenseDialog
        open={isAddDialogOpen}
        onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) setEditingExpense(undefined);
        }}
        onSave={handleSaveExpense}
        patients={mockPatients}
        expenseTypes={mockExpenseTypes}
        editExpense={editingExpense}
      />

      {/* Add Multiple Expenses Dialog */}
      <AddMultipleExpensesDialog
        open={isAddMultipleDialogOpen}
        onOpenChange={setIsAddMultipleDialogOpen}
        onSave={handleSaveMultipleExpenses}
        patients={mockPatients}
        expenseTypes={mockExpenseTypes}
        medicines={mockMedicines}
      />

      <DeleteConfirmDialog
        open={!!deleteExpense}
        onOpenChange={() => setDeleteExpense(undefined)}
        onConfirm={handleDeleteExpense}
        title="Delete Service"
        description={`Are you sure you want to delete this ${deleteExpense?.expenseTypeName} service? This action cannot be undone.`}
      />

      <BottomNav />
    </div>
  );
};

export default EnhancedExpenses;
