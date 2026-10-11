-- Allow both admin and super_admin to manage stock requests
DROP POLICY IF EXISTS "Admins can manage stock requests" ON public.stock_requests;

CREATE POLICY "Admins can manage stock requests"
ON public.stock_requests
FOR ALL
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'super_admin')
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'super_admin')
);
