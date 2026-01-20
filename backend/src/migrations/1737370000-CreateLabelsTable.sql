-- Create labels table
CREATE TABLE IF NOT EXISTS labels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    color VARCHAR(7),
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS image_labels (
    "imageId" UUID NOT NULL,
    "labelId" UUID NOT NULL,
    PRIMARY KEY ("imageId", "labelId"),
    FOREIGN KEY ("imageId") REFERENCES images(id) ON DELETE CASCADE,
    FOREIGN KEY ("labelId") REFERENCES labels(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_image_labels_imageId ON image_labels("imageId");
CREATE INDEX IF NOT EXISTS idx_image_labels_labelId ON image_labels("labelId");
CREATE INDEX IF NOT EXISTS idx_labels_name ON labels(name);
