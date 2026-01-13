-- SQL Migration: Create images table
-- Use with: npx typeorm migration:run

CREATE TABLE IF NOT EXISTS images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL,
  s3_key VARCHAR NOT NULL UNIQUE,
  filename VARCHAR NOT NULL,
  file_size BIGINT,
  content_type VARCHAR,
  status VARCHAR DEFAULT 'active',
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user_id (user_id),
  INDEX idx_status (status)
);
