CREATE POLICY "Review photos are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'review-photos');

CREATE POLICY "Users can upload their own review photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'review-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update their own review photos"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'review-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their own review photos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'review-photos' AND (storage.foldername(name))[1] = auth.uid()::text);