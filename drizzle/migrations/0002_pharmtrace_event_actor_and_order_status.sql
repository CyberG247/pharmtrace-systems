ALTER TABLE public.supply_events ADD COLUMN actor_organization_id uuid REFERENCES public.organizations(id) ON DELETE RESTRICT;
GRANT SELECT, INSERT ON public.supply_events TO authenticated;
DROP POLICY "Members can record events on their batches" ON public.supply_events;
CREATE POLICY "Members can record valid supply events for a batch" ON public.supply_events FOR INSERT TO authenticated
WITH CHECK (
  performed_by = auth.uid()
  AND actor_organization_id IS NOT NULL
  AND public.is_org_member(actor_organization_id)
  AND EXISTS (SELECT 1 FROM public.batches b WHERE b.id = batch_id AND b.organization_id = organization_id)
  AND (
    (event_type IN ('commissioning', 'packing', 'shipping') AND actor_organization_id = organization_id AND public.has_org_role(actor_organization_id, 'manufacturer'))
    OR (event_type = 'receiving' AND public.has_org_role(actor_organization_id, 'pharmacy'))
    OR public.has_global_role('super_admin')
  )
);
DROP POLICY "Organization members and auditors can read supply events" ON public.supply_events;
CREATE POLICY "Related organizations and auditors can read supply events" ON public.supply_events FOR SELECT TO authenticated
USING (public.is_org_member(organization_id) OR public.is_org_member(actor_organization_id) OR public.has_global_role('regulator') OR public.has_global_role('super_admin'));
REVOKE UPDATE ON public.orders FROM authenticated;
GRANT UPDATE (status) ON public.orders TO authenticated;
DROP POLICY "Participating organizations can update request status" ON public.orders;
CREATE POLICY "Only the supplying manufacturer can advance an order" ON public.orders FOR UPDATE TO authenticated
USING (public.has_org_role(supplier_organization_id, 'manufacturer'))
WITH CHECK (public.has_org_role(supplier_organization_id, 'manufacturer'));
