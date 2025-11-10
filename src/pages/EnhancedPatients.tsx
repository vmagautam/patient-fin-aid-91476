import { useState, useMemo } from "react";
import PageHeader from "@/components/Layout/PageHeader";
import BottomNav from "@/components/Layout/BottomNav";
import AddPatientDialog from "@/components/Dialogs/AddPatientDialog";
import DeleteConfirmDialog from "@/components/Dialogs/DeleteConfirmDialog";
import GlobalSearchBar from "@/components/Search/GlobalSearchBar";
import DateRangeFilter from "@/components/Reports/DateRangeFilter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Plus,
  Phone,
  Calendar,
  Activity,
  Edit,
  Trash2,
  User,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle,
} from "lucide-react";
import { Patient, Expense } from "@/types";
import { toast } from "sonner";

// Mock data with extended patient information
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
    endDate: "2024-03-15",
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
  {
    id: "4",
    name: "Emily Davis",
    registrationNumber: "REG-2023-015",
    age: 28,
    gender: "Female",
    contact: "+1 234-567-8903",
    startDate: "2023-11-10",
    endDate: "2023-12-20",
    isActive: false,
    rehabProgram: "Substance Abuse Recovery",
  },
  {
    id: "5",
    name: "Robert Wilson",
    registrationNumber: "REG-2023-008",
    age: 52,
    gender: "Male",
    contact: "+1 234-567-8904",
    startDate: "2023-08-05",
    endDate: "2023-10-15",
    isActive: false,
    rehabProgram: "Physical Therapy",
  },
  {
    id: "6",
    name: "Lisa Anderson",
    registrationNumber: "REG-2022-025",
    age: 35,
    gender: "Female",
    contact: "+1 234-567-8905",
    startDate: "2022-09-12",
    endDate: "2022-11-30",
    isActive: false,
    rehabProgram: "Cardiac Rehab",
  },
];

const mockExpenses: Expense[] = [
  // John Smith (REG-2024-001) expenses
  {
    id: "1",
    patientId: "1",
    registrationNumber: "REG-2024-001",
    expenseTypeId: "1",
    expenseTypeName: "Registration Fee",
    date: "2024-01-15",
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
    date: "2024-01-15",
    description: "Physical therapy sessions",
    quantity: 1,
    unitPrice: 15500,
    totalAmount: 15500,
  },
  {
    id: "3",
    patientId: "1",
    registrationNumber: "REG-2024-001",
    expenseTypeId: "3",
    expenseTypeName: "Medicine",
    date: "2024-02-01",
    description: "Prescribed medications",
    quantity: 1,
    unitPrice: 1200,
    totalAmount: 1200,
  },
  {
    id: "4",
    patientId: "1",
    registrationNumber: "REG-2024-001",
    expenseTypeId: "4",
    expenseTypeName: "Doctor Fee",
    date: "2024-02-15",
    description: "Doctor consultation",
    quantity: 2,
    unitPrice: 1000,
    totalAmount: 2000,
  },
  // Sarah Johnson (REG-2024-002) expenses
  {
    id: "5",
    patientId: "2",
    registrationNumber: "REG-2024-002",
    expenseTypeId: "1",
    expenseTypeName: "Registration Fee",
    date: "2024-02-01",
    description: "Registration Fee",
    quantity: 1,
    unitPrice: 1000,
    totalAmount: 1000,
  },
  {
    id: "6",
    patientId: "2",
    registrationNumber: "REG-2024-002",
    expenseTypeId: "2",
    expenseTypeName: "Rehabilitation Charge",
    date: "2024-02-01",
    description: "Cardiac rehabilitation",
    quantity: 1,
    unitPrice: 12000,
    totalAmount: 12000,
  },
  // Michael Brown (REG-2024-003) expenses
  {
    id: "7",
    patientId: "3",
    registrationNumber: "REG-2024-003",
    expenseTypeId: "1",
    expenseTypeName: "Registration Fee",
    date: "2024-02-20",
    description: "Registration Fee",
    quantity: 1,
    unitPrice: 1000,
    totalAmount: 1000,
  },
  {
    id: "8",
    patientId: "3",
    registrationNumber: "REG-2024-003",
    expenseTypeId: "2",
    expenseTypeName: "Rehabilitation Charge",
    date: "2024-02-20",
    description: "Neurological rehabilitation",
    quantity: 1,
    unitPrice: 18000,
    totalAmount: 18000,
  },
  // Emily Davis (REG-2023-015) expenses
  {
    id: "9",
    patientId: "4",
    registrationNumber: "REG-2023-015",
    expenseTypeId: "1",
    expenseTypeName: "Registration Fee",
    date: "2023-11-10",
    description: "Registration Fee",
    quantity: 1,
    unitPrice: 1000,
    totalAmount: 1000,
  },
  {
    id: "10",
    patientId: "4",
    registrationNumber: "REG-2023-015",
    expenseTypeId: "2",
    expenseTypeName: "Counseling Sessions",
    date: "2023-11-15",
    description: "Substance abuse counseling",
    quantity: 1,
    unitPrice: 8000,
    totalAmount: 8000,
  },
  // Robert Wilson (REG-2023-008) expenses
  {
    id: "11",
    patientId: "5",
    registrationNumber: "REG-2023-008",
    expenseTypeId: "1",
    expenseTypeName: "Registration Fee",
    date: "2023-08-05",
    description: "Registration Fee",
    quantity: 1,
    unitPrice: 1000,
    totalAmount: 1000,
  },
  {
    id: "12",
    patientId: "5",
    registrationNumber: "REG-2023-008",
    expenseTypeId: "2",
    expenseTypeName: "Rehabilitation Charge",
    date: "2023-08-05",
    description: "Physical therapy sessions",
    quantity: 1,
    unitPrice: 10000,
    totalAmount: 10000,
  },
];

// Mock billing data (payments made by patients)
const mockBillingPayments = [
  { patientId: "1", registrationNumber: "REG-2024-001", paidAmount: 15000 },
  { patientId: "2", registrationNumber: "REG-2024-002", paidAmount: 10000 },
  { patientId: "3", registrationNumber: "REG-2024-003", paidAmount: 12000 },
  { patientId: "4", registrationNumber: "REG-2023-015", paidAmount: 7500 },
  { patientId: "5", registrationNumber: "REG-2023-008", paidAmount: 11000 },
];

// Patient summary for overview
type PatientSummary = {
  patientId: string;
  patientName: string;
  registrationNumber: string;
  age: number;
  gender: string;
  contact: string;
  rehabProgram?: string;
  totalRegistrations: number;
  activeRegistrations: number;
  completedRegistrations: number;
  lastRegistrationDate: string;
  status: "active" | "inactive" | "completed";
  totalDuration: string;
  isActive: boolean;
  startDate: string;
  endDate?: string;
};

// Year-grouped registrations for detail view
type YearGroupedRegistrations = {
  year: string;
  registrations: Patient[];
  totalRegistrations: number;
  activeCount: number;
  completedCount: number;
};

const EnhancedPatients = () => {
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [selectedYear, setSelectedYear] = useState<string>(
    new Date().getFullYear().toString()
  );
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | undefined>(
    undefined
  );
  const [deletePatient, setDeletePatient] = useState<Patient | undefined>(
    undefined
  );

  // View state: null = overview, patientId = detail view
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    null
  );
  const [openYearSections, setOpenYearSections] = useState<
    Record<string, boolean>
  >({});

  // Get available years from patient data
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    patients.forEach((patient) => {
      const year = new Date(patient.startDate).getFullYear().toString();
      years.add(year);
    });
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
  }, [patients]);

  // Calculate duration for a patient registration
  const calculateDuration = (
    startDate: string,
    endDate?: string,
    isActive?: boolean
  ) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date(); // Use current date if active

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const months = Math.floor(diffDays / 30);
    const days = diffDays % 30;

    if (months > 0) {
      return days > 0 ? `${months}m ${days}d` : `${months}m`;
    }
    return `${days}d`;
  };

  // Filter patients
  const filteredPatients = useMemo(() => {
    let filtered = patients;

    // Filter by selected year first
    if (selectedYear) {
      filtered = filtered.filter((patient) => {
        const patientYear = new Date(patient.startDate)
          .getFullYear()
          .toString();
        return patientYear === selectedYear;
      });
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (patient) =>
          patient.name.toLowerCase().includes(query) ||
          patient.registrationNumber.toLowerCase().includes(query) ||
          patient.rehabProgram?.toLowerCase().includes(query) ||
          patient.contact.toLowerCase().includes(query)
      );
    }

    if (startDate) {
      const startStr = startDate.toISOString().split("T")[0];
      filtered = filtered.filter((patient) => patient.startDate >= startStr);
    }

    if (endDate) {
      const endStr = endDate.toISOString().split("T")[0];
      filtered = filtered.filter((patient) => patient.startDate <= endStr);
    }

    return filtered.sort(
      (a, b) =>
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );
  }, [patients, selectedYear, searchQuery, startDate, endDate]);

  // Generate patient summaries for overview (group by unique patients)
  const patientSummaries = useMemo(() => {
    const summaryMap = filteredPatients.reduce((acc, patient) => {
      const patientKey = patient.name; // Group by name (assuming unique names for demo)

      if (!acc[patientKey]) {
        acc[patientKey] = {
          patientId: patient.id,
          patientName: patient.name,
          registrationNumber: patient.registrationNumber,
          age: patient.age,
          gender: patient.gender,
          contact: patient.contact,
          rehabProgram: patient.rehabProgram,
          totalRegistrations: 0,
          activeRegistrations: 0,
          completedRegistrations: 0,
          lastRegistrationDate: patient.startDate,
          status: "inactive" as const,
          totalDuration: "",
          isActive: patient.isActive,
          startDate: patient.startDate,
          endDate: patient.endDate,
        };
      }

      acc[patientKey].totalRegistrations += 1;

      if (patient.isActive) {
        acc[patientKey].activeRegistrations += 1;
        acc[patientKey].status = "active";
        acc[patientKey].isActive = true;
      } else {
        acc[patientKey].completedRegistrations += 1;
      }

      // Update last registration date if this one is more recent
      if (patient.startDate > acc[patientKey].lastRegistrationDate) {
        acc[patientKey].lastRegistrationDate = patient.startDate;
        acc[patientKey].registrationNumber = patient.registrationNumber;
        acc[patientKey].startDate = patient.startDate;
        acc[patientKey].endDate = patient.endDate;
        acc[patientKey].isActive = patient.isActive;
      }

      return acc;
    }, {} as Record<string, PatientSummary>);

    // Calculate duration for each patient summary
    Object.values(summaryMap).forEach((summary) => {
      summary.totalDuration = calculateDuration(
        summary.startDate,
        summary.endDate,
        summary.isActive
      );
    });

    return Object.values(summaryMap).sort(
      (a, b) =>
        new Date(b.lastRegistrationDate).getTime() -
        new Date(a.lastRegistrationDate).getTime()
    );
  }, [filteredPatients]);

  // Generate year-grouped registrations for detail view
  const yearGroupedRegistrations = useMemo(() => {
    if (!selectedPatientId) return [];

    const selectedPatientName = patients.find(
      (p) => p.id === selectedPatientId
    )?.name;
    if (!selectedPatientName) return [];

    // Get all registrations for the selected patient (not filtered by year for detail view)
    const allPatientRegistrations = patients.filter(
      (patient) => patient.name === selectedPatientName
    );

    // Filter by selected year for detail view
    const patientRegistrations = allPatientRegistrations.filter((patient) => {
      const patientYear = new Date(patient.startDate).getFullYear().toString();
      return patientYear === selectedYear;
    });

    // Apply other filters (search, date range)
    let finalRegistrations = patientRegistrations;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      finalRegistrations = finalRegistrations.filter(
        (patient) =>
          patient.name.toLowerCase().includes(query) ||
          patient.registrationNumber.toLowerCase().includes(query) ||
          patient.rehabProgram?.toLowerCase().includes(query) ||
          patient.contact.toLowerCase().includes(query)
      );
    }

    if (startDate) {
      const startStr = startDate.toISOString().split("T")[0];
      finalRegistrations = finalRegistrations.filter(
        (patient) => patient.startDate >= startStr
      );
    }

    if (endDate) {
      const endStr = endDate.toISOString().split("T")[0];
      finalRegistrations = finalRegistrations.filter(
        (patient) => patient.startDate <= endStr
      );
    }

    const grouped = finalRegistrations.reduce((acc, patient) => {
      const year = new Date(patient.startDate).getFullYear().toString();

      if (!acc[year]) {
        acc[year] = {
          year,
          registrations: [],
          totalRegistrations: 0,
          activeCount: 0,
          completedCount: 0,
        };
      }

      acc[year].registrations.push(patient);
      acc[year].totalRegistrations += 1;

      if (patient.isActive) {
        acc[year].activeCount += 1;
      } else {
        acc[year].completedCount += 1;
      }

      return acc;
    }, {} as Record<string, YearGroupedRegistrations>);

    return Object.values(grouped).sort(
      (a, b) => parseInt(b.year) - parseInt(a.year)
    );
  }, [
    selectedPatientId,
    patients,
    selectedYear,
    searchQuery,
    startDate,
    endDate,
  ]);

  const handleAddPatient = (patientData: Omit<Patient, "id">) => {
    if (editingPatient) {
      setPatients(
        patients.map((p) =>
          p.id === editingPatient.id ? { ...patientData, id: p.id } : p
        )
      );
      setEditingPatient(undefined);
      toast.success("Patient updated successfully");
    } else {
      const newPatient: Patient = {
        ...patientData,
        id: Date.now().toString(),
      };
      setPatients([newPatient, ...patients]);
      toast.success("Patient added successfully");
    }
  };

  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
    setIsAddDialogOpen(true);
  };

  const handleDeletePatient = () => {
    if (deletePatient) {
      setPatients(patients.filter((p) => p.id !== deletePatient.id));
      toast.success("Patient deleted successfully");
      setDeletePatient(undefined);
    }
  };

  const handleDialogClose = () => {
    setIsAddDialogOpen(false);
    setEditingPatient(undefined);
  };

  const toggleYearSection = (year: string) => {
    setOpenYearSections((prev) => ({
      ...prev,
      [year]: !prev[year],
    }));
  };

  // Calculate total duration for selected patient in selected year
  const calculatePatientDuration = useMemo(() => {
    if (!selectedPatientId)
      return { totalDays: 0, activeDays: 0, completedDays: 0 };

    const selectedPatientName = patients.find(
      (p) => p.id === selectedPatientId
    )?.name;
    if (!selectedPatientName)
      return { totalDays: 0, activeDays: 0, completedDays: 0 };

    const patientRegistrations = patients.filter(
      (patient) =>
        patient.name === selectedPatientName &&
        new Date(patient.startDate).getFullYear().toString() === selectedYear
    );

    let totalDays = 0;
    let activeDays = 0;
    let completedDays = 0;

    patientRegistrations.forEach((registration) => {
      const start = new Date(registration.startDate);
      const end = registration.endDate
        ? new Date(registration.endDate)
        : new Date();
      const days = Math.ceil(
        Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      );

      totalDays += days;

      if (registration.isActive) {
        activeDays += days;
      } else {
        completedDays += days;
      }
    });

    return { totalDays, activeDays, completedDays };
  }, [selectedPatientId, patients, selectedYear]);

  // Calculate total cost and paid amount for selected patient in selected year
  const calculatePatientCosts = useMemo(() => {
    if (!selectedPatientId) return { totalCost: 0, paidAmount: 0 };

    const selectedPatientName = patients.find(
      (p) => p.id === selectedPatientId
    )?.name;
    if (!selectedPatientName) return { totalCost: 0, paidAmount: 0 };

    // Get patient registrations for the selected year
    const patientRegistrations = patients.filter(
      (patient) =>
        patient.name === selectedPatientName &&
        new Date(patient.startDate).getFullYear().toString() === selectedYear
    );

    // Calculate total cost from expenses
    let totalCost = 0;
    let paidAmount = 0;

    patientRegistrations.forEach((registration) => {
      const patientExpenses = mockExpenses.filter(
        (expense) =>
          expense.patientId === registration.id ||
          expense.registrationNumber === registration.registrationNumber
      );
      totalCost += patientExpenses.reduce(
        (sum, expense) => sum + expense.totalAmount,
        0
      );

      // Get paid amount from billing data
      const billingPayment = mockBillingPayments.find(
        (payment) =>
          payment.patientId === registration.id ||
          payment.registrationNumber === registration.registrationNumber
      );
      if (billingPayment) {
        paidAmount += billingPayment.paidAmount;
      }
    });

    return { totalCost, paidAmount };
  }, [selectedPatientId, patients, selectedYear]);

  const selectedPatient = selectedPatientId
    ? patients.find((p) => p.id === selectedPatientId)
    : null;

  const totalActive = patientSummaries.reduce(
    (sum, patient) => sum + patient.activeRegistrations,
    0
  );

  const totalCompleted = patientSummaries.reduce(
    (sum, patient) => sum + patient.completedRegistrations,
    0
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader
        title="Patients"
        subtitle={
          selectedPatientId
            ? `${
                selectedPatient?.name || "Patient"
              } - ${selectedYear} Registrations`
            : `${patientSummaries.length} patient${
                patientSummaries.length !== 1 ? "s" : ""
              } in ${selectedYear}`
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
            <Button
              size="icon"
              className="bg-white/20 hover:bg-white/30 text-white border-0"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus className="h-5 w-5" />
            </Button>
          )
        }
      />

      <div className="max-w-md mx-auto px-4 py-4">
        {/* Search Bar */}
        <div className="mb-4">
          <GlobalSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by name, registration no, program..."
            onClear={() => setSearchQuery("")}
          />
        </div>

        {/* Year Filter */}
        <div className="mb-4">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
                <div className="text-2xl font-bold text-success">
                  {totalActive}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Active</div>
              </Card>
              <Card className="p-4 text-center shadow-soft">
                <div className="text-2xl font-bold text-muted-foreground">
                  {totalCompleted}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Completed
                </div>
              </Card>
            </div>

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
                        <p className="text-xs text-muted-foreground">
                          {summary.registrationNumber}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <Badge
                            className={
                              summary.status === "active"
                                ? "bg-success/10 text-success border-success/20"
                                : "bg-muted/50 text-muted-foreground border-muted"
                            }
                          >
                            {summary.status === "active" && (
                              <CheckCircle className="h-3 w-3 mr-1" />
                            )}
                            {summary.status === "inactive" && (
                              <Clock className="h-3 w-3 mr-1" />
                            )}
                            {summary.status.charAt(0).toUpperCase() +
                              summary.status.slice(1)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {summary.age}y • {summary.gender}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {summary.rehabProgram}
                        </p>
                      </div>
                    </div>
                    <div className="text-right ml-3">
                      <p className="text-lg font-bold text-foreground">
                        {summary.totalDuration}
                        {summary.isActive && (
                          <span className="text-xs text-success ml-1">
                            (ongoing)
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">Duration</p>
                      {summary.activeRegistrations > 0 && (
                        <p className="text-sm font-semibold text-success">
                          {summary.activeRegistrations} active
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}

              {patientSummaries.length === 0 && (
                <Card className="p-8 text-center">
                  <div className="flex flex-col items-center">
                    <div className="bg-muted/50 p-4 rounded-full mb-4">
                      <User className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground mb-2 font-medium">
                      {searchQuery || startDate || endDate
                        ? "No patients found"
                        : "No patients registered yet"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {searchQuery || startDate || endDate
                        ? "Try adjusting your filters"
                        : "Patient registrations will appear here"}
                    </p>
                  </div>
                </Card>
              )}
            </div>
          </>
        )}

        {/* Detail View: Year-Grouped Registrations */}
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
                    {selectedPatient.age} years • {selectedPatient.gender}
                  </p>
                </div>
              </div>
              <Separator className="my-3" />
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-lg font-bold text-foreground">
                    {(() => {
                      const days = calculatePatientDuration.totalDays;
                      const months = Math.floor(days / 30);
                      const remainingDays = days % 30;
                      if (months > 0) {
                        return remainingDays > 0
                          ? `${months}m ${remainingDays}d`
                          : `${months}m`;
                      }
                      return `${days}d`;
                    })()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Total Duration
                  </p>
                </div>
                <div>
                  <p className="text-lg font-bold text-primary">
                    ${calculatePatientCosts.totalCost.toFixed(0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Cost</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-success">
                    ${calculatePatientCosts.paidAmount.toFixed(0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Paid Amount</p>
                </div>
              </div>
            </Card>

            {/* Year-Grouped Registrations */}
            <div className="space-y-3">
              {yearGroupedRegistrations.map((group) => (
                <Card key={group.year} className="overflow-hidden shadow-soft">
                  <Collapsible
                    open={openYearSections[group.year] ?? true}
                    onOpenChange={() => toggleYearSection(group.year)}
                  >
                    <CollapsibleTrigger className="w-full">
                      <div className="bg-muted/50 px-4 py-3 border-b border-border flex items-center justify-between hover:bg-muted/70 transition-colors">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-primary" />
                          <div className="text-left">
                            <p className="font-semibold text-sm text-foreground">
                              {group.year}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {group.totalRegistrations} registration
                              {group.totalRegistrations !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-xs text-success font-medium">
                              {group.activeCount} active
                            </span>
                            {group.completedCount > 0 && (
                              <span className="text-xs text-muted-foreground ml-2">
                                {group.completedCount} completed
                              </span>
                            )}
                          </div>
                          {openYearSections[group.year] ?? true ? (
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
                          {group.registrations.map((registration) => (
                            <div
                              key={registration.id}
                              className="border border-border rounded-lg p-3"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <Badge
                                    className={
                                      registration.isActive
                                        ? "bg-success/10 text-success border-success/20"
                                        : "bg-muted/50 text-muted-foreground border-muted"
                                    }
                                  >
                                    {registration.isActive ? (
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                    ) : (
                                      <Clock className="h-3 w-3 mr-1" />
                                    )}
                                    {registration.isActive
                                      ? "Active"
                                      : "Completed"}
                                  </Badge>
                                  <p className="text-sm font-medium text-foreground mt-2">
                                    {registration.registrationNumber}
                                  </p>
                                  <div className="space-y-1 mt-2">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                      <Activity className="h-3 w-3" />
                                      <span>{registration.rehabProgram}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                      <Calendar className="h-3 w-3" />
                                      <span>
                                        Started:{" "}
                                        {new Date(
                                          registration.startDate
                                        ).toLocaleDateString()}
                                      </span>
                                    </div>
                                    {registration.endDate && (
                                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Clock className="h-3 w-3" />
                                        <span>
                                          Ended:{" "}
                                          {new Date(
                                            registration.endDate
                                          ).toLocaleDateString()}
                                        </span>
                                      </div>
                                    )}
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                      <Phone className="h-3 w-3" />
                                      <span>{registration.contact}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-medium text-primary">
                                      <Clock className="h-3 w-3" />
                                      <span>
                                        Duration:{" "}
                                        {calculateDuration(
                                          registration.startDate,
                                          registration.endDate,
                                          registration.isActive
                                        )}
                                        {registration.isActive && " (ongoing)"}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <Separator className="my-2" />

                              <div className="flex gap-2 justify-end">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditPatient(registration);
                                  }}
                                >
                                  <Edit className="h-3.5 w-3.5 mr-1" />
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeletePatient(registration);
                                  }}
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

              {yearGroupedRegistrations.length === 0 && (
                <Card className="p-8 text-center">
                  <div className="flex flex-col items-center">
                    <div className="bg-muted/50 p-4 rounded-full mb-4">
                      <User className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground mb-2 font-medium">
                      No registrations found for this patient
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {searchQuery || startDate || endDate
                        ? "Try adjusting your filters"
                        : "Registrations will appear here"}
                    </p>
                  </div>
                </Card>
              )}
            </div>
          </>
        )}
      </div>

      <AddPatientDialog
        open={isAddDialogOpen}
        onOpenChange={handleDialogClose}
        onSave={handleAddPatient}
        editPatient={editingPatient}
      />

      <DeleteConfirmDialog
        open={!!deletePatient}
        onOpenChange={() => setDeletePatient(undefined)}
        onConfirm={handleDeletePatient}
        title="Delete Patient"
        description={`Are you sure you want to delete ${deletePatient?.name}? This action cannot be undone.`}
      />

      <BottomNav />
    </div>
  );
};

export default EnhancedPatients;
