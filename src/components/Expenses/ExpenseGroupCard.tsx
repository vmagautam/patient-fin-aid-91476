import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, DollarSign, Calendar, Package, Edit, Trash2 } from 'lucide-react';
import { ExpenseGroup, Expense } from '@/types';
import { useState } from 'react';

interface ExpenseGroupCardProps {
  group: ExpenseGroup;
  expenses: Expense[];
  onGroupEdit?: (group: ExpenseGroup) => void;
  onGroupDelete?: (group: ExpenseGroup) => void;
  onExpenseEdit?: (expense: Expense) => void;
  onExpenseDelete?: (expense: Expense) => void;
}

const ExpenseGroupCard = ({ group, expenses, onGroupEdit, onGroupDelete, onExpenseEdit, onExpenseDelete }: ExpenseGroupCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const unpaidAmount = group.totalAmount - group.paidAmount;
  const isPaid = group.paidAmount >= group.totalAmount;

  return (
    <Card className="p-4 shadow-soft hover:shadow-medium transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Package className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-foreground">{group.name}</h3>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{new Date(group.date).toLocaleDateString()}</span>
            <Badge variant="outline" className="text-xs ml-2">
              {expenses.length} items
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isPaid ? 'default' : 'secondary'}>
            {isPaid ? 'Paid' : 'Pending'}
          </Badge>
          {onGroupEdit && (
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={() => onGroupEdit(group)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {onGroupDelete && (
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-destructive hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => onGroupDelete(group)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total Amount:</span>
          <span className="font-semibold text-foreground">${group.totalAmount.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Paid:</span>
          <span className="font-semibold text-success">${group.paidAmount.toFixed(2)}</span>
        </div>
        {unpaidAmount > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Outstanding:</span>
            <span className="font-semibold text-warning">${unpaidAmount.toFixed(2)}</span>
          </div>
        )}
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="w-full"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? (
          <>
            <ChevronUp className="h-4 w-4 mr-2" />
            Hide Items
          </>
        ) : (
          <>
            <ChevronDown className="h-4 w-4 mr-2" />
            Show Items
          </>
        )}
      </Button>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-border space-y-2">
          {expenses.map((expense) => (
            <div key={expense.id} className="p-3 bg-muted rounded-lg text-sm">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="font-medium text-foreground">{expense.description}</div>
                  <div className="text-xs text-muted-foreground">{expense.expenseTypeName}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-foreground">${expense.totalAmount.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">
                    {expense.quantity} × ${expense.unitPrice.toFixed(2)}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-2 pt-2 border-t border-border">
                {onExpenseEdit && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs"
                    onClick={() => onExpenseEdit(expense)}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                )}
                {onExpenseDelete && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => onExpenseDelete(expense)}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default ExpenseGroupCard;
