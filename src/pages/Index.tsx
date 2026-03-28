import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import StatsCard from "@/components/StatsCard";
import FoodCard, { FoodListing } from "@/components/FoodCard";
import { Button } from "@/components/ui/button";
import { Package, Users, Zap, TrendingUp, PlusCircle, ArrowRight } from "lucide-react";

const Index = () => {
  const [listings, setListings] = useState<FoodListing[]>([]);
  const [stats, setStats] = useState({ listings: 0, ngos: 0, matches: 0 });

  useEffect(() => {
    const fetchData = async () => {
      const [{ count: listingCount }, { count: ngoCount }, { count: matchCount }, { data: recentListings }] =
        await Promise.all([
          supabase.from("food_listings").select("*", { count: "exact", head: true }),
          supabase.from("ngos").select("*", { count: "exact", head: true }),
          supabase.from("matches").select("*", { count: "exact", head: true }),
          supabase
            .from("food_listings")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(3),
        ]);

      setStats({
        listings: listingCount || 0,
        ngos: ngoCount || 0,
        matches: matchCount || 0,
      });
      setListings((recentListings as FoodListing[]) || []);
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl">
          <h1 className="font-heading text-5xl font-bold tracking-tight text-foreground leading-tight">
            AI-Powered Food
            <br />
            <span className="text-primary">Redistribution</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-xl">
            SmartSurplus AI intelligently matches surplus food with NGOs using AI classification,
            urgency prediction, and smart matching — reducing waste, feeding communities.
          </p>
          <div className="flex gap-3 mt-8">
            <Button asChild size="lg">
              <Link to="/donate">
                <PlusCircle className="h-5 w-5 mr-2" />
                Donate Food
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/matches">
                View Matches
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="container mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatsCard title="Food Listings" value={stats.listings} icon={Package} description="Active donations" />
          <StatsCard title="Partner NGOs" value={stats.ngos} icon={Users} description="Ready to receive" />
          <StatsCard title="Matches Made" value={stats.matches} icon={Zap} description="AI-powered connections" />
          <StatsCard title="AI Accuracy" value="94%" icon={TrendingUp} description="Classification rate" />
        </div>
      </section>

      {/* Recent Listings */}
      <section className="container mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading text-2xl font-bold text-foreground">Recent Listings</h2>
          <Button variant="ghost" asChild>
            <Link to="/donate">View All <ArrowRight className="h-4 w-4 ml-1" /></Link>
          </Button>
        </div>
        {listings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {listings.map((listing) => (
              <FoodCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border rounded-lg bg-card">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No food listings yet. Be the first to donate!</p>
            <Button className="mt-4" asChild>
              <Link to="/donate"><PlusCircle className="h-4 w-4 mr-2" /> Donate Food</Link>
            </Button>
          </div>
        )}
      </section>
    </div>
  );
};

export default Index;
