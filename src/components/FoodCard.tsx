import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import UrgencyBadge from "./UrgencyBadge";
import AIExplanation from "./AIExplanation";
import { Clock, MapPin, Package } from "lucide-react";

export interface FoodListing {
  id: string;
  food_description: string;
  quantity: string;
  location: string;
  expiry_time: string;
  donor_name: string;
  food_category: string | null;
  urgency_score: number | null;
  ai_tags: string[] | null;
  created_at: string;
  status: string;
}

interface FoodCardProps {
  listing: FoodListing;
  matchExplanation?: string;
}

const FoodCard = ({ listing, matchExplanation }: FoodCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg">{listing.food_description}</CardTitle>
          {listing.urgency_score && (
            <UrgencyBadge score={listing.urgency_score} />
          )}
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {listing.food_category && (
            <Badge variant="secondary" className="text-xs">
              <Package className="h-3 w-3 mr-1" />
              {listing.food_category}
            </Badge>
          )}
          {listing.ai_tags?.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {listing.location}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            {listing.expiry_time}
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          Qty: <span className="font-medium text-foreground">{listing.quantity}</span> · 
          Donor: <span className="font-medium text-foreground">{listing.donor_name}</span>
        </div>
        {matchExplanation && (
          <AIExplanation explanation={matchExplanation} />
        )}
      </CardContent>
    </Card>
  );
};

export default FoodCard;
