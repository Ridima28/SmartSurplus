-- Food Listings table
CREATE TABLE public.food_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  food_description TEXT NOT NULL,
  quantity TEXT NOT NULL,
  location TEXT NOT NULL,
  expiry_time TEXT,
  donor_name TEXT NOT NULL,
  food_category TEXT,
  urgency_score INTEGER DEFAULT 5,
  ai_tags TEXT[],
  status TEXT NOT NULL DEFAULT 'available',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.food_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view food listings" ON public.food_listings FOR SELECT USING (true);
CREATE POLICY "Anyone can insert food listings" ON public.food_listings FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update food listings" ON public.food_listings FOR UPDATE USING (true);

-- NGOs table
CREATE TABLE public.ngos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 100,
  demand_level TEXT NOT NULL DEFAULT 'medium',
  contact TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.ngos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view NGOs" ON public.ngos FOR SELECT USING (true);
CREATE POLICY "Anyone can insert NGOs" ON public.ngos FOR INSERT WITH CHECK (true);

-- Matches table
CREATE TABLE public.matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  food_listing_id UUID REFERENCES public.food_listings(id) ON DELETE CASCADE,
  ngo_id UUID REFERENCES public.ngos(id) ON DELETE CASCADE,
  food_description TEXT NOT NULL,
  food_category TEXT,
  urgency_score INTEGER,
  ngo_name TEXT NOT NULL,
  ngo_location TEXT NOT NULL,
  final_score NUMERIC NOT NULL DEFAULT 0,
  ai_explanation TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view matches" ON public.matches FOR SELECT USING (true);
CREATE POLICY "Anyone can insert matches" ON public.matches FOR INSERT WITH CHECK (true);