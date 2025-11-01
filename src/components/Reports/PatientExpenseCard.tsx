import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DollarSign, Calendar, ChevronRight } from 'lucide-react';
import { Patient } from '@/types';

interface PatientExpenseCardProps {
  patient: Patient;
  totalExpenses: number;
  paidAmount: number;
  unpaidAmount: number;
  expenseCount: number;
  onClick: () => void;
}

const PatientExpenseCard = ({
  patient,
  totalExpenses,
  paidAmount,
  unpaidAmount,
  expenseCount,
  onClick,
}: PatientExpenseCardProps) => {
  const paymentStatus = unpaidAmount === 0 ? 'paid' : paidAmount === 0 ? 'unpaid' : 'partial';

  return (
    <Card className="p-4 shadow-soft hover:shadow-medium transition-all cursor-pointer" onClick={onClick}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-foreground">{patient.name}</h3>
          <p className="text-xs text-muted-foreground">
            {patient.age} years • {patient.gender}
          </p>
        </div>
        <Badge variant={patient.isActive ? 'default' : 'secondary'}>
          {patient.isActive ? 'Active' : 'Inactive'}
        </Badge>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{expenseCount} expenses</span>
          <div className="flex items-center gap-1 font-semibold text-foreground">
            <DollarSign className="h-3 w-3" />
            {totalExpenses.toFixed(2)}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex flex-col">
            <span className="text-muted-foreground">Paid</span>
            <span className="font-medium text-success">${paidAmount.toFixed(2)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground">Pending</span>
            <span className="font-medium text-warning">${unpaidAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {patient.rehabProgram && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3 pb-3 border-b border-border">
          <Calendar className="h-3 w-3" />
          <span>{patient.rehabProgram}</span>
        </div>
      )}

      <Button variant="ghost" size="sm" className="w-full justify-between">
        View Detailed Report
        <ChevronRight className="h-4 w-4" />
      </Button>
    </Card>
  );
};

export default PatientExpenseCard;
