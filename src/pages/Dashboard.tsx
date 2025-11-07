import { useState } from 'react';
import { Link } from 'react-router-dom';
import BottomNav from '@/components/Layout/BottomNav';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  DollarSign, 
  Package, 
  TrendingUp, 
  AlertTriangle,
  Activity,
  Calendar,
  FileText,
  ArrowRight
} from 'lucide-react';

// Mock dashboard data - Replace with API calls
const mockDashboardData = {
  stats: {
    totalPatients: 156,
    activePatients: 89,
    todayAppointments: 12,
    pendingBills: 23,
    totalRevenue: 125000,
    monthlyRevenue: 15000,
    lowStockItems: 8,
    expiringItems: 3,
  },
  recentPatients: [
    { id: '1', name: 'John Smith', registrationNumber: 'REG-2024-001', status: 'Active', lastVisit: '2024-03-15' },
    { id: '2', name: 'Sarah Johnson', registrationNumber: 'REG-2024-002', status: 'Completed', lastVisit: '2024-03-14' },
    { id: '3', name: 'Michael Brown', registrationNumber: 'REG-2024-003', status: 'Active', lastVisit: '2024-03-13' },
  ],
  pendingBills: [
    { id: '1', patientName: 'John Smith', amount: 450, dueDate: '2024-03-20' },
    { id: '2', patientName: 'Emily Davis', amount: 1200, dueDate: '2024-03-18' },
    { id: '3', patientName: 'Robert Wilson', amount: 750, dueDate: '2024-03-22' },
  ],
  alerts: [
    { id: '1', type: 'warning', message: '8 medicines below minimum stock level' },
    { id: '2', type: 'error', message: '3 medicines expiring within 30 days' },
  ]
};

const Dashboard = () => {
  const [data] = useState(mockDashboardData);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-primary text-white">
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <Badge variant="secondary" className="bg-white/20 text-white border-0">
              <Calendar className="h-3 w-3 mr-1" />
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </Badge>
          </div>
          <p className="text-white/80 text-sm">Medical Rehab Management System</p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Key Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 shadow-soft">
            <div className="flex items-start justify-between mb-2">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <TrendingUp className="h-4 w-4 text-success" />
            </div>
            <div className="text-2xl font-bold text-foreground">{data.stats.activePatients}</div>
            <div className="text-xs text-muted-foreground">Active Patients</div>
            <div className="text-xs text-muted-foreground mt-1">of {data.stats.totalPatients} total</div>
          </Card>

          <Card className="p-4 shadow-soft">
            <div className="flex items-start justify-between mb-2">
              <div className="bg-success/10 p-2 rounded-lg">
                <DollarSign className="h-5 w-5 text-success" />
              </div>
              <Activity className="h-4 w-4 text-primary" />
            </div>
            <div className="text-2xl font-bold text-foreground">
              ${(data.stats.monthlyRevenue / 1000).toFixed(0)}k
            </div>
            <div className="text-xs text-muted-foreground">This Month</div>
            <div className="text-xs text-muted-foreground mt-1">${(data.stats.totalRevenue / 1000).toFixed(0)}k total</div>
          </Card>

          <Card className="p-4 shadow-soft">
            <div className="flex items-start justify-between mb-2">
              <div className="bg-warning/10 p-2 rounded-lg">
                <FileText className="h-5 w-5 text-warning" />
              </div>
              <Badge variant="outline" className="text-xs py-0 px-1.5 h-5">
                {data.stats.pendingBills}
              </Badge>
            </div>
            <div className="text-2xl font-bold text-foreground">{data.stats.todayAppointments}</div>
            <div className="text-xs text-muted-foreground">Today's Visits</div>
            <div className="text-xs text-muted-foreground mt-1">{data.stats.pendingBills} pending bills</div>
          </Card>

          <Card className="p-4 shadow-soft">
            <div className="flex items-start justify-between mb-2">
              <div className="bg-info/10 p-2 rounded-lg">
                <Package className="h-5 w-5 text-info" />
              </div>
              {data.stats.lowStockItems > 0 && (
                <AlertTriangle className="h-4 w-4 text-warning" />
              )}
            </div>
            <div className="text-2xl font-bold text-foreground">{data.stats.lowStockItems}</div>
            <div className="text-xs text-muted-foreground">Low Stock Items</div>
            <div className="text-xs text-muted-foreground mt-1">{data.stats.expiringItems} expiring soon</div>
          </Card>
        </div>

        {/* Alerts */}
        {data.alerts.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-foreground">Alerts</h2>
            {data.alerts.map((alert) => (
              <Card 
                key={alert.id} 
                className={`p-3 border-l-4 ${
                  alert.type === 'error' 
                    ? 'border-l-destructive bg-destructive/5' 
                    : 'border-l-warning bg-warning/5'
                }`}
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle className={`h-4 w-4 mt-0.5 ${
                    alert.type === 'error' ? 'text-destructive' : 'text-warning'
                  }`} />
                  <p className="text-sm text-foreground flex-1">{alert.message}</p>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Recent Patients */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground">Recent Patients</h2>
            <Link to="/">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="space-y-2">
            {data.recentPatients.map((patient) => (
              <Card key={patient.id} className="p-3 shadow-soft">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-sm text-foreground">{patient.name}</h3>
                    <p className="text-xs text-muted-foreground">{patient.registrationNumber}</p>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant={patient.status === 'Active' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {patient.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(patient.lastVisit).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Pending Bills */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground">Pending Bills</h2>
            <Link to="/billing">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="space-y-2">
            {data.pendingBills.map((bill) => (
              <Card key={bill.id} className="p-3 shadow-soft">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-sm text-foreground">{bill.patientName}</h3>
                    <p className="text-xs text-muted-foreground">
                      Due: {new Date(bill.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-warning">${bill.amount}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 pt-4">
          <Link to="/">
            <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
              <Users className="h-5 w-5" />
              <span className="text-xs">Patients</span>
            </Button>
          </Link>
          <Link to="/billing">
            <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
              <DollarSign className="h-5 w-5" />
              <span className="text-xs">Billing</span>
            </Button>
          </Link>
          <Link to="/inventory">
            <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
              <Package className="h-5 w-5" />
              <span className="text-xs">Inventory</span>
            </Button>
          </Link>
          <Link to="/reports">
            <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
              <FileText className="h-5 w-5" />
              <span className="text-xs">Reports</span>
            </Button>
          </Link>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Dashboard;
