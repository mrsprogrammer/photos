# Labels Feature - Quick Guide

## 🎯 Overview

Etykiety (labels) pozwalają na organizowanie zdjęć poprzez przypisywanie im tagów. Każde zdjęcie może mieć wiele etykiet, a etykiety mogą być używane na wielu zdjęciach.

## 📋 Co zostało dodane?

### Backend

1. **Nowe pliki:**
   - [label.entity.ts](../backend/src/image/label.entity.ts) - Entity dla etykiet
   - [label.repository.ts](../backend/src/image/label.repository.ts) - Repository do zarządzania etykietami
   - [add-label.dto.ts](../backend/src/image/dto/add-label.dto.ts) - DTO dla dodawania etykiet
   - [1737370000-CreateLabelsTable.sql](../backend/src/migrations/1737370000-CreateLabelsTable.sql) - Migracja bazy danych

2. **Zaktualizowane pliki:**
   - `image.entity.ts` - Dodana relacja many-to-many z labels
   - `image.service.ts` - Dodane metody dla zarządzania etykietami
   - `image.controller.ts` - Dodane endpointy API
   - `image.repository.ts` - Dodane ładowanie relacji labels
   - `image.module.ts` - Dodany Label entity i LabelRepository

3. **Dokumentacja:**
   - [LABELS_API.md](../backend/LABELS_API.md) - Pełna dokumentacja API

4. **Testy:**
   - [image.service.labels.spec.ts](../backend/src/image/image.service.labels.spec.ts) - Unit testy

### Baza danych

Dwie nowe tabele:
```sql
-- Tabela etykiet
labels (id, name, color, createdAt)

-- Tabela łącząca (many-to-many)
image_labels (imageId, labelId)
```

## 🚀 Jak używać?

### 1. Uruchom migrację

```bash
# Lokalna baza
docker exec -i postgres-nest psql -U postgres -d photos_dev \
  < backend/src/migrations/1737370000-CreateLabelsTable.sql

# QA
docker exec -i postgres-qa psql -U postgres -d photos_qa \
  < backend/src/migrations/1737370000-CreateLabelsTable.sql

# Production
docker exec -i postgres psql -U postgres -d photos_prod \
  < backend/src/migrations/1737370000-CreateLabelsTable.sql
```

### 2. Przetestuj API

```bash
# Najpierw zaloguj się i pobierz token
TOKEN=$(curl -X POST http://localhost:3002/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"username":"user","password":"pass"}' \
  | jq -r '.accessToken')

# Użyj skryptu testowego
./scripts/test-labels-api.sh http://localhost:3002 $TOKEN
```

### 3. Przykładowe użycie

```bash
# 1. Pobierz ID swojego zdjęcia
IMAGE_ID="your-image-uuid"

# 2. Dodaj etykietę "vacation"
curl -X POST "http://localhost:3002/images/$IMAGE_ID/labels" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "vacation",
    "color": "#FF5733"
  }'

# 3. Dodaj etykietę "family"
curl -X POST "http://localhost:3002/images/$IMAGE_ID/labels" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "family", "color": "#33FF57"}'

# 4. Zobacz zdjęcie z etykietami
curl "http://localhost:3002/images/$IMAGE_ID" \
  -H "Authorization: Bearer $TOKEN" | jq '.labels'

# 5. Usuń etykietę
LABEL_ID="label-uuid"
curl -X DELETE "http://localhost:3002/images/$IMAGE_ID/labels/$LABEL_ID" \
  -H "Authorization: Bearer $TOKEN"
```

## 🔧 Integracja z frontendem

### Pobieranie zdjęć z etykietami

```typescript
// Endpoint /images teraz zwraca labels
const images = await fetch('/api/images', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json());

// Każde zdjęcie ma tablicę labels
images.forEach(image => {
  console.log(`Image: ${image.filename}`);
  console.log('Labels:', image.labels.map(l => l.name).join(', '));
});
```

### Dodawanie etykiety

```typescript
async function addLabel(imageId: string, labelName: string, color: string) {
  const response = await fetch(`/api/images/${imageId}/labels`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name: labelName, color })
  });
  
  if (!response.ok) {
    throw new Error('Failed to add label');
  }
  
  return response.json();
}

// Użycie
await addLabel('image-123', 'vacation', '#FF5733');
```

### Usuwanie etykiety

```typescript
async function removeLabel(imageId: string, labelId: string) {
  const response = await fetch(`/api/images/${imageId}/labels/${labelId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to remove label');
  }
  
  return response.json();
}
```

### Pobieranie wszystkich etykiet

```typescript
async function getAllLabels() {
  const response = await fetch('/api/images/labels/all', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.json();
}

// Użycie - lista autocomplete
const labels = await getAllLabels();
// [{ id: '...', name: 'vacation', color: '#FF5733' }, ...]
```

### Filtrowanie zdjęć po etykiecie

```typescript
function filterImagesByLabel(images: Image[], labelName: string) {
  return images.filter(image => 
    image.labels.some(label => label.name === labelName)
  );
}

// Użycie
const vacationPhotos = filterImagesByLabel(images, 'vacation');
```

### Grupowanie zdjęć po etykietach

```typescript
function groupImagesByLabel(images: Image[]) {
  const grouped: Record<string, Image[]> = {};
  
  images.forEach(image => {
    image.labels.forEach(label => {
      if (!grouped[label.name]) {
        grouped[label.name] = [];
      }
      grouped[label.name].push(image);
    });
  });
  
  return grouped;
}

// Użycie
const grouped = groupImagesByLabel(images);
console.log(grouped.vacation); // Wszystkie zdjęcia z etykietą "vacation"
console.log(grouped.family);   // Wszystkie zdjęcia z etykietą "family"
```

## 🎨 Przykładowy komponent React

```typescript
import { useState, useEffect } from 'react';

interface Label {
  id: string;
  name: string;
  color: string;
}

interface Image {
  id: string;
  filename: string;
  url: string;
  labels: Label[];
}

function ImageLabels({ image, onLabelAdded, onLabelRemoved }: {
  image: Image;
  onLabelAdded: () => void;
  onLabelRemoved: () => void;
}) {
  const [newLabelName, setNewLabelName] = useState('');
  const [allLabels, setAllLabels] = useState<Label[]>([]);

  useEffect(() => {
    fetchAllLabels();
  }, []);

  async function fetchAllLabels() {
    const response = await fetch('/api/images/labels/all', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    setAllLabels(await response.json());
  }

  async function addLabel() {
    if (!newLabelName) return;

    await fetch(`/api/images/${image.id}/labels`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        name: newLabelName,
        color: getRandomColor()
      })
    });

    setNewLabelName('');
    onLabelAdded();
  }

  async function removeLabel(labelId: string) {
    await fetch(`/api/images/${image.id}/labels/${labelId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    onLabelRemoved();
  }

  function getRandomColor() {
    const colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33F5', '#F5FF33'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  return (
    <div className="image-labels">
      {/* Istniejące etykiety */}
      <div className="flex gap-2 flex-wrap">
        {image.labels.map(label => (
          <span
            key={label.id}
            className="px-3 py-1 rounded-full text-white text-sm flex items-center gap-2"
            style={{ backgroundColor: label.color }}
          >
            {label.name}
            <button
              onClick={() => removeLabel(label.id)}
              className="hover:text-red-200"
            >
              ×
            </button>
          </span>
        ))}
      </div>

      {/* Dodawanie nowej etykiety */}
      <div className="mt-2 flex gap-2">
        <input
          type="text"
          value={newLabelName}
          onChange={(e) => setNewLabelName(e.target.value)}
          placeholder="Add label..."
          className="border rounded px-2 py-1"
          list="label-suggestions"
        />
        <datalist id="label-suggestions">
          {allLabels.map(label => (
            <option key={label.id} value={label.name} />
          ))}
        </datalist>
        <button
          onClick={addLabel}
          className="bg-blue-500 text-white px-4 py-1 rounded"
        >
          Add
        </button>
      </div>
    </div>
  );
}
```

## ✅ Checklist wdrożenia

- [ ] Uruchom migrację bazy danych
- [ ] Zrestartuj backend (`docker compose restart backend`)
- [ ] Przetestuj API z Postman lub curl
- [ ] Zaimplementuj UI na frontendzie
- [ ] Przetestuj dodawanie/usuwanie etykiet
- [ ] Deploy na QA
- [ ] Przetestuj na QA
- [ ] Deploy na produkcję

## 📊 Testy

```bash
# Backend unit tests
cd backend
npm test -- image.service.labels.spec

# API integration tests
./scripts/test-labels-api.sh http://localhost:3002 $TOKEN
```

## 🐛 Troubleshooting

### Problem: "relation labels does not exist"
**Rozwiązanie:** Uruchom migrację SQL

### Problem: "Label already exists on this image"
**Rozwiązanie:** To jest oczekiwane zachowanie - nie możesz dodać tej samej etykiety dwa razy

### Problem: Labels nie są zwracane w API
**Rozwiązanie:** Sprawdź czy relations są poprawnie załadowane w repository

### Problem: Foreign key constraint error
**Rozwiązanie:** Upewnij się że tabele zostały utworzone w odpowiedniej kolejności (najpierw labels, potem image_labels)

## 📚 Dodatkowe zasoby

- [LABELS_API.md](../backend/LABELS_API.md) - Pełna dokumentacja API
- [TypeORM Relations](https://typeorm.io/many-to-many-relations) - Dokumentacja TypeORM
- [NestJS Documentation](https://docs.nestjs.com/) - Dokumentacja NestJS

---

**Ostatnia aktualizacja:** 20 stycznia 2026
