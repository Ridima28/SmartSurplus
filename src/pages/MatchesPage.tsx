import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import MatchCard, { Match } from "@/components/MatchCard";
import { Zap } from "lucide-react";

const MatchesPage = () => {
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    const fetchMatches = async () => {
      const { data } = await supabase
        .from("matches")
        .select("*")
        .order("created_at", { ascending: false });
      setMatches((data as Match[]) || []);
    };
    fetchMatches();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-10">
        <h1 className="font-heading text-3xl font-bold text-foreground mb-2">AI-Powered Matches</h1>
        <p className="text-muted-foreground mb-8">
          Each match is scored using AI urgency, distance, and NGO demand.
        </p>

        {matches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border rounded-lg bg-card">
            <Zap className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No matches yet. Donate food to trigger AI matching!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchesPage;
