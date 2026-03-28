import { Badge } from "@/components/ui/badge";

interface UrgencyBadgeProps {
  score: number;
  className?: string;
}

const UrgencyBadge = ({ score, className }: UrgencyBadgeProps) => {
  const getVariant = () => {
    if (score >= 7) return "urgencyHigh" as const;
    if (score >= 4) return "urgencyMedium" as const;
    return "urgencyLow" as const;
  };

  const getLabel = () => {
    if (score >= 7) return "High Urgency";
    if (score >= 4) return "Medium Urgency";
    return "Low Urgency";
  };

  return (
    <Badge variant={getVariant()} className={className}>
      {getLabel()} ({score}/10)
    </Badge>
  );
};

export default UrgencyBadge;
