# Fix Database Error - Create New Supabase Project

## Current Issue
Your Supabase project (ggqmzavgcmphbqvhzwhu) doesn't exist or was deleted.

## Solution: Create New Project

### Step 1: Create Supabase Project
1. Go to https://supabase.com/dashboard
2. Click **New Project**
3. Fill in:
   - **Name**: e-kart
   - **Database Password**: (create a strong password - SAVE IT!)
   - **Region**: Choose closest to you
4. Click **Create new project**
5. Wait 2-3 minutes for setup

### Step 2: Get Your Credentials
1. Go to **Project Settings** (gear icon)
2. Click **API** in sidebar
3. Copy:
   - **Project URL** (looks like: https://xxxxx.supabase.co)
   - **anon public key** (long string starting with eyJ...)

### Step 3: Update .env File
Replace the content in `.env` file with:
```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### Step 4: Run Database Setup
1. In Supabase Dashboard, go to **SQL Editor**
2. Click **New Query**
3. Paste ALL this SQL:

```sql
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Create categories table
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are publicly readable"
ON public.categories FOR SELECT USING (true);

CREATE POLICY "Admins can insert categories"
ON public.categories FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update categories"
ON public.categories FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete categories"
ON public.categories FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Create products table with brand and model
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand TEXT,
    model TEXT,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image TEXT,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    badge TEXT,
    rating DECIMAL(2, 1) DEFAULT 4.5,
    reviews_count INTEGER DEFAULT 0,
    in_stock BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    specifications JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products are publicly readable"
ON public.products FOR SELECT USING (true);

CREATE POLICY "Admins can insert products"
ON public.products FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update products"
ON public.products FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete products"
ON public.products FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Create indexes
CREATE INDEX idx_products_brand ON public.products(brand);
CREATE INDEX idx_products_price ON public.products(price);
CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_products_featured ON public.products(featured);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to assign default role on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert default categories
INSERT INTO public.categories (name) VALUES 
('Smartphones'),
('Laptops'),
('Headphones'),
('Tablets'),
('Accessories'),
('Wearables');
```

4. Click **Run**
5. Wait for "Success"

### Step 5: Create Admin User
1. Sign up at your app: http://localhost:5173/auth
2. Use your email
3. Go back to Supabase **SQL Editor**
4. Run this (replace with YOUR email):

```sql
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'your-email@example.com';
```

### Step 6: Restart App
```bash
npm run dev
```

Now everything should work!
