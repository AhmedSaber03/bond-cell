-- Add specifications and stock management columns to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS specifications jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS in_stock boolean DEFAULT true;

-- Create stock_requests table for pre-orders
CREATE TABLE IF NOT EXISTS public.stock_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    customer_name text NOT NULL,
    phone_number text NOT NULL,
    quantity integer NOT NULL DEFAULT 1,
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'fulfilled', 'cancelled')),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS on stock_requests
ALTER TABLE public.stock_requests ENABLE ROW LEVEL SECURITY;

-- Allow public inserts for pre-orders (customers can submit)
CREATE POLICY "Anyone can submit stock requests" 
ON public.stock_requests 
FOR INSERT 
WITH CHECK (true);

-- Admins can view and manage stock requests
CREATE POLICY "Admins can manage stock requests" 
ON public.stock_requests 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Add trigger for updated_at on stock_requests
CREATE TRIGGER update_stock_requests_updated_at
BEFORE UPDATE ON public.stock_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();