import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Package,
  ShoppingCart,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";

interface DashboardStats {
  todaySales: number;
  totalPurchases: number;
  lowStockCount: number;
  expiringCount: number;
  totalProfit: number;
  totalMedicines: number;
}

const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendUp,
  accentClass,
}: {
  title: string;
  value: string | number;
  icon: any;
  trend?: string;
  trendUp?: boolean;
  accentClass: string;
}) => (
  <div className="stat-card animate-fade-in group">
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trendUp ? 'text-success' : 'text-destructive'}`}>
            {trendUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {trend}
          </div>
        )}
      </div>
      <div className={`h-11 w-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${accentClass}`}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  </div>
);

const mockMonthlyData = [
  { month: "Jan", sales: 4200, purchases: 2800 },
  { month: "Feb", sales: 5100, purchases: 3200 },
  { month: "Mar", sales: 4800, purchases: 2900 },
  { month: "Apr", sales: 6200, purchases: 3800 },
  { month: "May", sales: 5900, purchases: 3500 },
  { month: "Jun", sales: 7100, purchases: 4100 },
];

const mockWeeklyData = [
  { day: "Mon", sales: 820 },
  { day: "Tue", sales: 950 },
  { day: "Wed", sales: 1100 },
  { day: "Thu", sales: 780 },
  { day: "Fri", sales: 1250 },
  { day: "Sat", sales: 1400 },
  { day: "Sun", sales: 600 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-xl">
        <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
        {payload.map((entry: any, i: number) => (
          <p key={i} className="text-sm font-semibold" style={{ color: entry.color }}>
            {entry.name}: ₹{entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    todaySales: 0,
    totalPurchases: 0,
    lowStockCount: 0,
    expiringCount: 0,
    totalProfit: 0,
    totalMedicines: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const today = new Date().toISOString().split("T")[0];

      const [salesRes, medsRes, lowStockRes, expiringRes] = await Promise.all([
        supabase.from("sales").select("total_amount").gte("created_at", today),
        supabase.from("medicines").select("id", { count: "exact", head: true }),
        supabase.from("medicines").select("id", { count: "exact", head: true }).lt("stock_quantity", 10),
        supabase.from("medicines").select("id", { count: "exact", head: true })
          .lte("expiry_date", new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0])
          .gte("expiry_date", today),
      ]);

      const todaySales = salesRes.data?.reduce((sum, s) => sum + Number(s.total_amount), 0) ?? 0;

      setStats({
        todaySales,
        totalPurchases: 0,
        lowStockCount: lowStockRes.count ?? 0,
        expiringCount: expiringRes.count ?? 0,
        totalProfit: todaySales * 0.25,
        totalMedicines: medsRes.count ?? 0,
      });
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            Dashboard
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Real-time pharmacy performance overview</p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground bg-card border border-border/50 rounded-lg px-3 py-2">
          <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
          System Online
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Today's Sales"
          value={`₹${stats.todaySales.toLocaleString()}`}
          icon={DollarSign}
          trend="+12.5% vs yesterday"
          trendUp
          accentClass="bg-primary/15 text-primary"
        />
        <StatCard
          title="Total Medicines"
          value={stats.totalMedicines}
          icon={Package}
          accentClass="bg-info/15 text-info"
        />
        <StatCard
          title="Low Stock"
          value={stats.lowStockCount}
          icon={AlertTriangle}
          accentClass="bg-warning/15 text-warning"
        />
        <StatCard
          title="Expiring Soon"
          value={stats.expiringCount}
          icon={Clock}
          accentClass="bg-warning/15 text-warning"
        />
        <StatCard
          title="Today's Profit"
          value={`₹${stats.totalProfit.toLocaleString()}`}
          icon={TrendingUp}
          trend="+8.2% growth"
          trendUp
          accentClass="bg-success/15 text-success"
        />
        <StatCard
          title="Total Revenue"
          value={`₹${stats.todaySales.toLocaleString()}`}
          icon={ShoppingCart}
          accentClass="bg-chart-3/15 text-chart-3"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold">Monthly Revenue</CardTitle>
            <span className="text-xs text-muted-foreground">Last 6 months</span>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockMonthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 25%, 18%)" />
                <XAxis dataKey="month" tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="sales" name="Sales" fill="hsl(172, 66%, 50%)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="purchases" name="Purchases" fill="hsl(210, 100%, 56%)" radius={[6, 6, 0, 0]} opacity={0.6} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold">Weekly Sales Trend</CardTitle>
            <span className="text-xs text-muted-foreground">This week</span>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={mockWeeklyData}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(172, 66%, 50%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(172, 66%, 50%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 25%, 18%)" />
                <XAxis dataKey="day" tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="sales" name="Sales" stroke="hsl(172, 66%, 50%)" strokeWidth={2.5} fill="url(#salesGradient)" dot={{ r: 4, fill: 'hsl(172, 66%, 50%)', strokeWidth: 0 }} activeDot={{ r: 6, fill: 'hsl(172, 66%, 50%)', strokeWidth: 2, stroke: 'hsl(222, 47%, 6%)' }} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "New Sale", href: "/pos", icon: ShoppingCart, color: "bg-primary/10 text-primary border-primary/20" },
              { label: "Add Medicine", href: "/medicines", icon: Package, color: "bg-info/10 text-info border-info/20" },
              { label: "Stock Alerts", href: "/stock", icon: AlertTriangle, color: "bg-warning/10 text-warning border-warning/20" },
              { label: "View Reports", href: "/reports", icon: TrendingUp, color: "bg-success/10 text-success border-success/20" },
            ].map(({ label, href, icon: Icon, color }) => (
              <a
                key={label}
                href={href}
                className={`flex items-center gap-3 p-4 rounded-xl border transition-all hover:scale-[1.02] hover:shadow-md ${color}`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="text-sm font-semibold">{label}</span>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;