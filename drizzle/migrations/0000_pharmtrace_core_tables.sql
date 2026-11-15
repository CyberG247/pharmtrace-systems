CREATE TYPE public.app_role AS ENUM ('super_admin', 'manufacturer', 'pharmacy', 'regulator');
CREATE TYPE public.organization_type AS ENUM ('manufacturer', 'distributor', 'pharmacy');
CREATE TYPE public.batch_state AS ENUM ('active', 'quarantined', 'recalled');
CREATE TYPE public.supply_event_type AS ENUM ('commissioning', 'packing', 'shipping', 'receiving');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read their own profile" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "Users update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE TABLE public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type public.organization_type NOT NULL,
  license_number text NOT NULL DEFAULT '',
  state text NOT NULL DEFAULT '',
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.organizations TO authenticated;
GRANT ALL ON public.organizations TO service_role;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE NULLS NOT DISTINCT (user_id, organization_id, role)
);
GRANT SELECT, INSERT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE FUNCTION public.is_org_member(_organization_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_catalog
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND organization_id = _organization_id) $$;

CREATE FUNCTION public.has_global_role(_role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_catalog
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND organization_id IS NULL AND role = _role) $$;

CREATE FUNCTION public.has_org_role(_organization_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_catalog
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND organization_id = _organization_id AND role = _role) $$;

GRANT EXECUTE ON FUNCTION public.is_org_member(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_global_role(public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_org_role(uuid, public.app_role) TO authenticated;

CREATE POLICY "Users view own memberships and global admins view all" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_global_role('super_admin'));
CREATE POLICY "Users can join only their own new organization with a basic role" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (
  user_id = auth.uid()
  AND role IN ('manufacturer', 'pharmacy')
  AND organization_id IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.organizations o
    WHERE o.id = organization_id AND o.created_by = auth.uid()
      AND ((o.type IN ('manufacturer', 'distributor') AND role = 'manufacturer') OR (o.type = 'pharmacy' AND role = 'pharmacy'))
  )
);

CREATE POLICY "Organization members and auditors can read organizations" ON public.organizations FOR SELECT TO authenticated
USING (created_by = auth.uid() OR public.is_org_member(id) OR public.has_global_role('regulator') OR public.has_global_role('super_admin'));
CREATE POLICY "Signed-in users can create an organization as its owner" ON public.organizations FOR INSERT TO authenticated
WITH CHECK (created_by = auth.uid());
CREATE POLICY "Organization members can update their organization" ON public.organizations FOR UPDATE TO authenticated
USING (public.is_org_member(id)) WITH CHECK (public.is_org_member(id));

CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'Medicine',
  gtin text NOT NULL,
  unit_price numeric(12,2) NOT NULL DEFAULT 0 CHECK (unit_price >= 0),
  inventory integer NOT NULL DEFAULT 0 CHECK (inventory >= 0),
  currency text NOT NULL DEFAULT 'NGN',
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published catalogue and organization members can read products" ON public.products FOR SELECT TO authenticated
USING (published OR public.is_org_member(organization_id) OR public.has_global_role('regulator') OR public.has_global_role('super_admin'));
CREATE POLICY "Manufacturers manage their products" ON public.products FOR INSERT TO authenticated
WITH CHECK (public.has_org_role(organization_id, 'manufacturer'));
CREATE POLICY "Manufacturers update their products" ON public.products FOR UPDATE TO authenticated
USING (public.has_org_role(organization_id, 'manufacturer')) WITH CHECK (public.has_org_role(organization_id, 'manufacturer'));
CREATE POLICY "Manufacturers remove their products" ON public.products FOR DELETE TO authenticated
USING (public.has_org_role(organization_id, 'manufacturer'));

CREATE TABLE public.batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  gtin text NOT NULL,
  batch_number text NOT NULL,
  expiry_date date NOT NULL,
  serial_number text NOT NULL UNIQUE,
  state public.batch_state NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.batches TO authenticated;
GRANT ALL ON public.batches TO service_role;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Organizations and authorized auditors can inspect batches" ON public.batches FOR SELECT TO authenticated
USING (public.is_org_member(organization_id) OR public.has_global_role('regulator') OR public.has_global_role('super_admin'));
CREATE POLICY "Manufacturers manage their serialized batches" ON public.batches FOR INSERT TO authenticated
WITH CHECK (public.has_org_role(organization_id, 'manufacturer') AND EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.organization_id = organization_id));
CREATE POLICY "Manufacturers update their batches" ON public.batches FOR UPDATE TO authenticated
USING (public.has_org_role(organization_id, 'manufacturer')) WITH CHECK (public.has_org_role(organization_id, 'manufacturer'));

CREATE TABLE public.supply_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
  batch_id uuid NOT NULL REFERENCES public.batches(id) ON DELETE RESTRICT,
  event_type public.supply_event_type NOT NULL,
  location text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  performed_by uuid NOT NULL,
  occurred_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.supply_events TO authenticated;
GRANT ALL ON public.supply_events TO service_role;
ALTER TABLE public.supply_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Organization members and auditors can read supply events" ON public.supply_events FOR SELECT TO authenticated
USING (public.is_org_member(organization_id) OR public.has_global_role('regulator') OR public.has_global_role('super_admin'));
CREATE POLICY "Members can record events on their batches" ON public.supply_events FOR INSERT TO authenticated
WITH CHECK (
  performed_by = auth.uid()
  AND public.is_org_member(organization_id)
  AND EXISTS (SELECT 1 FROM public.batches b WHERE b.id = batch_id AND b.organization_id = organization_id)
  AND (
    (event_type IN ('commissioning', 'packing', 'shipping') AND (public.has_org_role(organization_id, 'manufacturer') OR public.has_global_role('super_admin')))
    OR (event_type = 'receiving' AND (public.has_org_role(organization_id, 'pharmacy') OR public.has_global_role('super_admin')))
  )
);

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
  supplier_organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price_at_order numeric(12,2) NOT NULL CHECK (unit_price_at_order >= 0),
  status text NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'confirmed', 'shipped', 'received', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Only participating organizations can view procurement requests" ON public.orders FOR SELECT TO authenticated
USING (public.is_org_member(buyer_organization_id) OR public.is_org_member(supplier_organization_id) OR public.has_global_role('regulator') OR public.has_global_role('super_admin'));
CREATE POLICY "Pharmacies request listed supplier stock" ON public.orders FOR INSERT TO authenticated
WITH CHECK (
  public.has_org_role(buyer_organization_id, 'pharmacy')
  AND EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.organization_id = supplier_organization_id AND p.published AND p.unit_price = unit_price_at_order)
);
CREATE POLICY "Participating organizations can update request status" ON public.orders FOR UPDATE TO authenticated
USING (public.is_org_member(buyer_organization_id) OR public.is_org_member(supplier_organization_id))
WITH CHECK (public.is_org_member(buyer_organization_id) OR public.is_org_member(supplier_organization_id));

CREATE FUNCTION public.create_profile_for_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_catalog
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''), COALESCE(NEW.email, ''))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created_create_profile
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.create_profile_for_new_user();

CREATE FUNCTION public.verify_product_serial(_serial_number text)
RETURNS TABLE (is_authentic boolean, product_name text, batch_number text, expiry_date date, batch_state public.batch_state, supplier_name text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_catalog
AS $$
  SELECT true, p.name, b.batch_number, b.expiry_date, b.state, o.name
  FROM public.batches b
  JOIN public.products p ON p.id = b.product_id
  JOIN public.organizations o ON o.id = b.organization_id
  WHERE b.serial_number = _serial_number
    AND auth.uid() IS NOT NULL
  LIMIT 1
$$;
GRANT EXECUTE ON FUNCTION public.verify_product_serial(text) TO authenticated;
REVOKE ALL ON FUNCTION public.create_profile_for_new_user() FROM PUBLIC, anon, authenticated;

INSERT INTO public.organizations (id, name, type, license_number, state, created_by)
VALUES ('10000000-0000-4000-8000-000000000001', 'PharmTrace Demonstration Supplier', 'manufacturer', 'DEMO-NOT-A-LICENSE', 'Lagos', '00000000-0000-0000-0000-000000000001');
INSERT INTO public.products (id, organization_id, name, category, gtin, unit_price, inventory, currency, published)
VALUES
  ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'DEMO · Paracetamol 500 mg · 100 tablets', 'Analgesic', '05012345678903', 2850.00, 240, 'NGN', true),
  ('20000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000001', 'DEMO · ORS sachets · carton of 100', 'Rehydration', '05012345678910', 11200.00, 86, 'NGN', true),
  ('20000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000001', 'DEMO · Amoxicillin 500 mg · 100 capsules', 'Antibiotic', '05012345678927', 8400.00, 62, 'NGN', true);