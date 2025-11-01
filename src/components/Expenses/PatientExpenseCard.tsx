import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DollarSign, Calendar, CheckCircle, XCircle, Edit, Trash2, User } from 'lucide-react';
import { Expense, Patient } from '@/types';

interface PatientExpenseCardProps {
  patient: Patient;
  expenses: Expense[];
  onExpenseEdit: (expense: Expense) => void;
  onExpenseDelete: (expense: Expense) => void;
}

const PatientExpenseCard = ({ 
  patient, 
  expenses, 
  onExpenseEdit, 
  onExpenseDelete 
}: PatientExpenseCardProps) => {
  const totalAmount = expenses.reduce((sum, exp) => sum + exp.totalAmount, 0);
  const paidAmount = expenses.reduce((sum, exp) => sum + exp.paidAmount, 0);
  const unpaidAmount = totalAmount - paidAmount;

  return (
    <Card className="overflow-hidden shadow-medium hover:shadow-strong transition-all">
      {/* Patient Header */}
      <div className="bg-gradient-primary text-primary-foreground p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-full">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{patient.name}</h3>
              <p className="text-sm opacity-90">
                {patient.age} years • {patient.gender}
              </p>
            </div>
          </div>
          <Badge 
            variant={patient.isActive ? 'default' : 'secondary'} 
            className="bg-white/20 text-white border-0"
          >
            {patient.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
        
        {patient.rehabProgram && (
          <p className="text-sm opacity-90 mt-2">{patient.rehabProgram}</p>
        )}

        {/* Summary */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="bg-white/10 rounded-lg p-2 text-center">
            <div className="text-xs opacity-80">Total</div>
            <div className="text-lg font-bold">${totalAmount.toFixed(0)}</div>
          </div>
          <div className="bg-white/10 rounded-lg p-2 text-center">
            <div className="text-xs opacity-80">Paid</div>
            <div className="text-lg font-bold">${paidAmount.toFixed(0)}</div>
          </div>
          <div className="bg-white/10 rounded-lg p-2 text-center">
            <div className="text-xs opacity-80">Pending</div>
            <div className="text-lg font-bold">${unpaidAmount.toFixed(0)}</div>
          </div>
        </div>
      </div>

      {/* Expenses List */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-muted-foreground">
            {expenses.length} Service{expenses.length !== 1 ? 's' : ''}
          </span>
        </div>

        {expenses.map((expense) => (
          <div 
            key={expense.id} 
            className="border border-border rounded-lg p-3 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs">
                    {expense.expenseTypeName}
                  </Badge>
                  {expense.isPaid ? (
                    <CheckCircle className="h-4 w-4 text-success" />
                  ) : (
                    <XCircle className="h-4 w-4 text-warning" />
                  )}
                </div>
                <h4 className="font-semibold text-sm">{expense.description}</h4>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(expense.date).toLocaleDateString()}</span>
                </div>
                <span className="text-muted-foreground">
                  {expense.quantity} × ${expense.unitPrice.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <span className="font-semibold">
                    ${expense.totalAmount.toFixed(2)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-muted-foreground">Paid: </span>
                  <span className="font-medium text-success">
                    ${expense.paidAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1 h-9"
                  onClick={() => onExpenseEdit(expense)}
                >
                  <Edit className="h-3 w-3 mr-1.5" />
                  Edit
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1 h-9 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => onExpenseDelete(expense)}
                >
                  <Trash2 className="h-3 w-3 mr-1.5" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default PatientExpenseCard;
