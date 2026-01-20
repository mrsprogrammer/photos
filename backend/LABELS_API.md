# Labels API Documentation

## Overview

Labels allow you to tag and categorize your images. Each image can have multiple labels, and labels can be reused across different images.

## Endpoints

### 1. Add Label to Image

Add a new label to an image. If the label doesn't exist, it will be created automatically.

**Endpoint:** `POST /images/:id/labels`

**Authentication:** Required (JWT)

**Request Body:**
```json
{
  "name": "vacation",
  "color": "#FF5733"
}
```

**Parameters:**
- `name` (required): Label name (string)
- `color` (optional): Hex color code for UI display (string, e.g., "#FF5733")

**Response:** `200 OK`
```json
{
  "id": "image-uuid",
  "labels": [
    {
      "id": "label-uuid",
      "name": "vacation",
      "color": "#FF5733",
      "createdAt": "2026-01-20T10:30:00.000Z"
    }
  ]
}
```

**Error Responses:**
- `400 Bad Request` - Label already exists on this image
- `404 Not Found` - Image not found
- `401 Unauthorized` - Not authenticated

**Example:**
```bash
curl -X POST "http://localhost:3002/api/images/abc123/labels" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "vacation",
    "color": "#FF5733"
  }'
```

---

### 2. Remove Label from Image

Remove a label from an image. The label itself is not deleted, only the association.

**Endpoint:** `DELETE /images/:id/labels/:labelId`

**Authentication:** Required (JWT)

**URL Parameters:**
- `id` - Image UUID
- `labelId` - Label UUID

**Response:** `200 OK`
```json
{
  "id": "image-uuid",
  "labels": []
}
```

**Error Responses:**
- `404 Not Found` - Image or label not found on image
- `401 Unauthorized` - Not authenticated

**Example:**
```bash
curl -X DELETE "http://localhost:3002/api/images/abc123/labels/label456" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 3. Get All Labels

Retrieve all available labels in the system.

**Endpoint:** `GET /images/labels/all`

**Authentication:** Required (JWT)

**Response:** `200 OK`
```json
[
  {
    "id": "label-uuid-1",
    "name": "vacation",
    "color": "#FF5733",
    "createdAt": "2026-01-20T10:30:00.000Z"
  },
  {
    "id": "label-uuid-2",
    "name": "family",
    "color": "#33FF57",
    "createdAt": "2026-01-20T11:00:00.000Z"
  }
]
```

**Example:**
```bash
curl "http://localhost:3002/api/images/labels/all" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 4. Create Label

Create a new label without attaching it to any image.

**Endpoint:** `POST /images/labels/new`

**Authentication:** Required (JWT)

**Request Body:**
```json
{
  "name": "important",
  "color": "#FF0000"
}
```

**Response:** `201 Created`
```json
{
  "id": "label-uuid",
  "name": "important",
  "color": "#FF0000",
  "createdAt": "2026-01-20T12:00:00.000Z"
}
```

**Error Responses:**
- `400 Bad Request` - Label with this name already exists

**Example:**
```bash
curl -X POST "http://localhost:3002/api/images/labels/new" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "important",
    "color": "#FF0000"
  }'
```

---

### 5. Delete Label

Delete a label completely. This will remove it from all images.

**Endpoint:** `DELETE /images/labels/:labelId`

**Authentication:** Required (JWT)

**URL Parameters:**
- `labelId` - Label UUID

**Response:** `204 No Content`

**Example:**
```bash
curl -X DELETE "http://localhost:3002/api/images/labels/label456" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 6. Get User Images (with labels)

Get all images for the authenticated user. Now includes labels array.

**Endpoint:** `GET /images`

**Authentication:** Required (JWT)

**Response:** `200 OK`
```json
[
  {
    "id": "image-uuid",
    "filename": "photo.jpg",
    "fileSize": 1024000,
    "uploadedAt": "2026-01-20T10:00:00.000Z",
    "s3Key": "user123/photo.jpg",
    "url": "https://...",
    "labels": [
      {
        "id": "label-uuid",
        "name": "vacation",
        "color": "#FF5733"
      }
    ]
  }
]
```

---

### 7. Get Single Image (with labels)

Get a single image metadata including labels.

**Endpoint:** `GET /images/:id`

**Authentication:** Required (JWT)

**Response:** `200 OK`
```json
{
  "id": "image-uuid",
  "filename": "photo.jpg",
  "fileSize": 1024000,
  "uploadedAt": "2026-01-20T10:00:00.000Z",
  "s3Key": "user123/photo.jpg",
  "url": "https://...",
  "labels": [
    {
      "id": "label-uuid-1",
      "name": "vacation",
      "color": "#FF5733"
    },
    {
      "id": "label-uuid-2",
      "name": "family",
      "color": "#33FF57"
    }
  ]
}
```

---

## Database Schema

### Tables

**labels**
```sql
id          UUID PRIMARY KEY
name        VARCHAR(255) UNIQUE NOT NULL
color       VARCHAR(7)
createdAt   TIMESTAMP
```

**image_labels** (junction table)
```sql
imageId     UUID FOREIGN KEY -> images(id)
labelId     UUID FOREIGN KEY -> labels(id)
PRIMARY KEY (imageId, labelId)
```

### Relationships

- **Image ↔ Label**: Many-to-Many
  - One image can have many labels
  - One label can be on many images

---

## Common Use Cases

### 1. Add multiple labels to an image

```bash
# Add "vacation" label
curl -X POST "http://localhost:3002/api/images/abc123/labels" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "vacation", "color": "#FF5733"}'

# Add "family" label
curl -X POST "http://localhost:3002/api/images/abc123/labels" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "family", "color": "#33FF57"}'
```

### 2. Organize images by label

```javascript
// Frontend example
const images = await fetch('/api/images', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json());

// Group images by label
const imagesByLabel = images.reduce((acc, image) => {
  image.labels.forEach(label => {
    if (!acc[label.name]) acc[label.name] = [];
    acc[label.name].push(image);
  });
  return acc;
}, {});

console.log(imagesByLabel.vacation); // All vacation photos
```

### 3. Remove all labels from an image

```javascript
const image = await fetch(`/api/images/${imageId}`, {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json());

// Remove each label
for (const label of image.labels) {
  await fetch(`/api/images/${imageId}/labels/${label.id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
}
```

---

## Error Handling

All endpoints follow standard HTTP status codes:

- `200 OK` - Success
- `201 Created` - Resource created
- `204 No Content` - Success with no response body
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

Error response format:
```json
{
  "statusCode": 400,
  "message": "Label already exists on this image",
  "error": "Bad Request"
}
```

---

## Best Practices

1. **Consistent naming**: Use lowercase for label names (e.g., "vacation", "family")
2. **Color coding**: Use distinct colors for different label categories
3. **Limit labels**: Aim for 5-10 commonly used labels
4. **Reuse labels**: Create labels once and reuse them across images
5. **Batch operations**: When adding multiple labels, do it sequentially to avoid race conditions

---

## Migration

To apply the labels feature to your database, run the migration:

```bash
# Connect to your PostgreSQL database
psql -U postgres -d photos_prod

# Run migration
\i backend/src/migrations/1737370000-CreateLabelsTable.sql
```

Or for Docker:

```bash
docker exec -i postgres psql -U postgres -d photos_prod < backend/src/migrations/1737370000-CreateLabelsTable.sql
```
