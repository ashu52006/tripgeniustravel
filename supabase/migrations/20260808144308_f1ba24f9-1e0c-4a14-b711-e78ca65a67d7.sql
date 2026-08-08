GRANT SELECT ON public.reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;

GRANT SELECT, INSERT, DELETE ON public.review_votes TO authenticated;
GRANT ALL ON public.review_votes TO service_role;

GRANT SELECT, INSERT, UPDATE ON public.review_reports TO authenticated;
GRANT ALL ON public.review_reports TO service_role;