import { useState } from 'react';
import PageHeader from '@/components/Layout/PageHeader';
import BottomNav from '@/components/Layout/BottomNav';
import AddPatientDialog from '@/components/Dialogs/AddPatientDialog';
import DeleteConfirmDialog from '@/components/Dialogs/DeleteConfirmDialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Phone, Calendar, Activity, Edit, Trash2 } from 'lucide-react';
import { Patient } from '@/types';
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
    endDate: '2024-03-15',
    isActive: false,
    rehabProgram: 'Cardiac Rehab',
  },
  {
    id: '3',
    name: 'Michael Brown',
    registrationNumber: 'REG-2024-003',
    age: 58,
    gender: 'Male',
    contact: '+1 234-567-8902',
    startDate: '2024-02-20',
    isActive: true,
    rehabProgram: 'Neurological Rehab',
  },
];

const Patients = () => {
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | undefined>(undefined);
  const [deletePatient, setDeletePatient] = useState<Patient | undefined>(undefined);

  const filteredPatients = patients.filter(patient => {
    if (filter === 'all') return true;
    if (filter === 'active') return patient.isActive;
    if (filter === 'inactive') return !patient.isActive;
    return true;
  });

  const handleAddPatient = (patientData: Omit<Patient, 'id'>) => {
    if (editingPatient) {
      setPatients(patients.map(p => p.id === editingPatient.id ? { ...patientData, id: p.id } : p));
      setEditingPatient(undefined);
    } else {
      const newPatient: Patient = {
        ...patientData,
        id: Date.now().toString(),
      };
      setPatients([newPatient, ...patients]);
    }
  };

  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
    setIsAddDialogOpen(true);
  };

  const handleDeletePatient = () => {
    if (deletePatient) {
      setPatients(patients.filter(p => p.id !== deletePatient.id));
      toast.success('Patient deleted successfully');
      setDeletePatient(undefined);
    }
  };

  const handleDialogClose = () => {
    setIsAddDialogOpen(false);
    setEditingPatient(undefined);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader
        title="Patients"
        subtitle={`${filteredPatients.length} ${filter === 'all' ? 'total' : filter} patients`}
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
            variant={filter === 'active' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('active')}
            className="flex-1"
          >
            Active
          </Button>
          <Button
            variant={filter === 'inactive' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('inactive')}
            className="flex-1"
          >
            Inactive
          </Button>
        </div>

        {/* Patient Cards */}
        <div className="space-y-3">
          {filteredPatients.map((patient) => (
            <Card key={patient.id} className="p-4 shadow-soft hover:shadow-medium transition-all">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg text-foreground">{patient.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {patient.age} years • {patient.gender}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={patient.isActive ? 'default' : 'secondary'}>
                    {patient.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                {patient.rehabProgram && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Activity className="h-4 w-4" />
                    <span>{patient.rehabProgram}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{patient.contact}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Started: {new Date(patient.startDate).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => handleEditPatient(patient)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => setDeletePatient(patient)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
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

export default Patients;
