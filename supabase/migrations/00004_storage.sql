-- Create documents bucket (private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES ('documents', 'documents', false, 52428800, ARRAY['application/pdf']::text[]);

-- Security policies for objects inside the documents bucket
-- We assume files are uploaded with the path structure: user_id/order_id/filename.pdf
-- Service role will handle uploads, so we only need a SELECT policy for authenticated users to download.

CREATE POLICY "Users can download their own documents"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'documents' AND
  (string_to_array(name, '/'))[1] = auth.uid()::text
);

-- Note: Inserts/Updates/Deletes are handled exclusively via the Next.js API using Service Role Keys, 
-- ensuring business logic and proper order association is enforced before any file hits storage.
