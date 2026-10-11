import { LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: "primary" | "accent" | "success" | "warning";
  isLoading?: boolean;
}

const colorClasses = {
  primary: "bg-primary/10 text-primary",
  accent: "bg-accent/10 text-accent",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
};

const StatsCard = ({ title, value, icon: Icon, color, isLoading }: StatsCardProps) => {
  return (
    <div className="stats-card place-items-center">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {isLoading ? (
        <>
          <Skeleton className="h-8 w-16 mb-2" />
          <Skeleton className="h-4 w-24" />
        </>
      ) : (
        <>
          <p className="text-3xl font-bold text-foreground">{value.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground mt-1">{title}</p>
        </>
      )}
    </div>
  );
};

export default StatsCard;
