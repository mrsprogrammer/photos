-- Sample data for testing labels feature
-- Run this after the main migration

-- Insert sample labels
INSERT INTO labels (id, name, color, "createdAt")
VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', 'vacation', '#FF5733', NOW()),
    ('550e8400-e29b-41d4-a716-446655440002', 'family', '#33FF57', NOW()),
    ('550e8400-e29b-41d4-a716-446655440003', 'work', '#3357FF', NOW()),
    ('550e8400-e29b-41d4-a716-446655440004', 'friends', '#FF33F5', NOW()),
    ('550e8400-e29b-41d4-a716-446655440005', 'nature', '#33FFF5', NOW()),
    ('550e8400-e29b-41d4-a716-446655440006', 'food', '#F5FF33', NOW()),
    ('550e8400-e29b-41d4-a716-446655440007', 'travel', '#FF8C33', NOW()),
    ('550e8400-e29b-41d4-a716-446655440008', 'pets', '#8C33FF', NOW()),
    ('550e8400-e29b-41d4-a716-446655440009', 'sports', '#33FF8C', NOW()),
    ('550e8400-e29b-41d4-a716-446655440010', 'art', '#FF338C', NOW())
ON CONFLICT (name) DO NOTHING;

-- Note: To associate labels with your images, use the API:
-- POST /images/:imageId/labels with body: {"name": "vacation"}
