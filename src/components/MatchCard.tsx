import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import UrgencyBadge from "./UrgencyBadge";
import AIExplanation from "./AIExplanation";
import { ArrowRight, Building2, Package } from "lucide-react";

export interface Match {
  id: string;
  food_description: string;
  food_category: string | null;
  urgency_score: number | null;
  ngo_name: string;
  ngo_location: string;
  final_score: number;
  ai_explanation: string | null;
  created_at: string;
}

interface MatchCardProps {
  match: Match;
}

const MatchCard = ({ match }: MatchCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Package className="h-4 w-4" />
              {match.food_category || "Food"}
            </div>
            <CardTitle className="text-base">{match.food_description}</CardTitle>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          <div className="flex-1 text-right">
            <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground mb-1">
              <Building2 className="h-4 w-4" />
              NGO
            </div>
            <p className="font-heading font-semibold text-foreground">{match.ngo_name}</p>
            <p className="text-xs text-muted-foreground">{match.ngo_location}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          {match.urgency_score && (
            <UrgencyBadge score={match.urgency_score} />
          )}
          <Badge variant="default">
            Score: {match.final_score.toFixed(1)}
          </Badge>
        </div>
        {match.ai_explanation && (
          <AIExplanation explanation={match.ai_explanation} />
        )}
      </CardContent>
    </Card>
  );
};

export default MatchCard;
