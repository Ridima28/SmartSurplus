import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Users } from "lucide-react";

interface NGO {
  id: string;
  name: string;
  location: string;
  capacity: number;
  demand_level: string;
  contact: string;
  created_at: string;
}

const NGOsPage = () => {
  const [ngos, setNgos] = useState<NGO[]>([]);

  useEffect(() => {
    const fetchNGOs = async () => {
      const { data } = await supabase.from("ngos").select("*").order("name");
      setNgos((data as NGO[]) || []);
    };
    fetchNGOs();
  }, []);

  const getDemandVariant = (level: string) => {
    if (level === "high") return "urgencyHigh" as const;
    if (level === "medium") return "urgencyMedium" as const;
    return "urgencyLow" as const;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-10">
        <h1 className="font-heading text-3xl font-bold text-foreground mb-2">Partner NGOs</h1>
        <p className="text-muted-foreground mb-8">Organizations ready to receive surplus food.</p>

        {ngos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ngos.map((ngo) => (
              <Card key={ngo.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{ngo.name}</CardTitle>
                    </div>
                    <Badge variant={getDemandVariant(ngo.demand_level)}>
                      {ngo.demand_level} demand
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" /> {ngo.location}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" /> Capacity: {ngo.capacity} meals/day
                  </div>
                  <p className="text-muted-foreground">Contact: {ngo.contact}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border rounded-lg bg-card">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No NGOs registered yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NGOsPage;
