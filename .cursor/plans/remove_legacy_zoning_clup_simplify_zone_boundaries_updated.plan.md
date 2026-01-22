---
name: Remove Legacy Zoning & CLUP, Simplify Zone Boundaries (Option 1)
overview: Remove old zoning application migrations and all CLUP-related code. Simplify zoning boundaries to work directly with the `zones` table using Leaflet Draw. Implement Option 1: Two-step zone creation (details first, then draw boundaries). Complete rewrite of ZoningMap.tsx.
todos:
  - id: "1"
    content: Create migration to drop CLUP and old zoning tables
    status: pending
  - id: "2"
    content: Delete CLUP and old zoning models, controllers, requests
    status: pending
  - id: "3"
    content: Create ZoneController with CRUD operations and overlap checking
    status: pending
    dependencies:
      - "2"
  - id: "4"
    content: Create StoreZoneRequest and UpdateZoneRequest with validation
    status: pending
    dependencies:
      - "3"
  - id: "5"
    content: Update routes - remove CLUP routes, add zone routes
    status: pending
    dependencies:
      - "3"
  - id: "6"
    content: Delete CLUP frontend pages and components
    status: pending
  - id: "7"
    content: Update services.ts - remove CLUP functions, add zone functions
    status: pending
    dependencies:
      - "3"
  - id: "8"
    content: Create new zone components (ZoneCard, ZoneDetailsPanel, CreateZoneModal)
    status: pending
    dependencies:
      - "7"
  - id: "9"
    content: Complete rewrite of ZoningMap.tsx for Option 1 workflow
    status: pending
    dependencies:
      - "8"
  - id: "10"
    content: Update Sidebar to remove CLUP menu item
    status: pending
    dependencies:
      - "6"
  - id: "11"
    content: Implement overlap detection using Turf.js
    status: pending
    dependencies:
      - "9"
  - id: "12"
    content: Test zone creation, editing, deletion, and overlap prevention
    status: pending
    dependencies:
      - "11"
---

# Remove Legacy Zoning & CLUP, Simplify Zone Boundaries (Option 1)

## Overview
Remove all legacy zoning application migrations and CLUP-related code. Simplify the zoning boundary system to work directly with the `zones` table. **Complete rewrite of ZoningMap.tsx** implementing Option 1: Two-step zone creation workflow (details first, then draw boundaries). Keep Leaflet Draw and Turf.js (both already installed).

## ⚠️ Important: ZoningMap.tsx Will Be Completely Rewritten
The current `resources/js/pages/Admin/Zoning/ZoningMap.tsx` (1025+ lines) will be completely refactored/rewritten to implement the new simplified zone management system.

## Current Architecture (to be removed)
```
CLUP Master → Zoning Classification → Zoning GIS Polygon
     ↓              ↓                        ↓
clup_master   zoning_classification   zoning_gis_polygon
```

## New Architecture (simplified)
```
Zone (direct)
     ↓
zones table (with geometry field)
```

## Zone Creation Workflow (Option 1: Two-Step Process)

### Step 1: Create Zone Classification (Details First)
1. Admin clicks "Create Zone" button in sidebar
2. Modal/form opens with zone details:
   - **Zone Code** (e.g., "R-1", "C-2", "BP-220") - unique, required, validated format
   - **Zone Name** (e.g., "Low Density Residential") - required
   - **Description** - optional text area
   - **Allowed Uses** - text area (e.g., "Single-detached houses, duplex, churches")
   - **Color** - auto-generated from code using hash function (with manual color picker override)
3. Save zone (without geometry) - zone created but inactive/empty
4. Zone appears in sidebar list with status indicator (e.g., "R-1 [No Boundaries]")

### Step 2: Draw Boundaries
1. Select zone from sidebar (zone details panel opens)
2. Click "Draw Boundaries" button - enables Leaflet Draw tools
3. Draw polygon(s) on map using Leaflet Draw
4. Support multiple polygons per zone (stored as MultiPolygon GeoJSON)
5. Overlap detection before saving (prevent overlapping zones using Turf.js)
6. Save - geometry stored in `zones.geometry` field
7. Zone becomes active, boundaries render with zone color

### Zone Editing Flow
1. Select zone from sidebar
2. Existing boundaries render on map with zone color
3. Zone details panel shows:
   - Code, Name, Description, Allowed Uses
   - Color picker (can change)
   - Status: Active / Inactive
   - [Edit Boundaries] button
   - [Delete Zone] button
4. Click "Edit Boundaries" - enables Leaflet Draw edit mode
5. Edit/delete polygons using Leaflet Draw
6. Overlap detection before saving
7. Save changes - updates `zones.geometry`

## Zone Management UI Structure

**Sidebar Layout:**
```
┌─────────────────────────────┐
│ Zone Management             │
├─────────────────────────────┤
│ [+ Create New Zone]         │
├─────────────────────────────┤
│ Zone List:                  │
│ • R-1 - Low Density Res.    │
│   [Active] [Edit]           │
│ • R-2 - Medium Density Res. │
│   [Active] [Edit]           │
│ • C-1 - Neighborhood Comm.  │
│   [No Boundaries] [Draw]    │
├─────────────────────────────┤
│ Selected Zone Details:       │
│ Code: R-1                   │
│ Name: Low Density Res.      │
│ Description: ...            │
│ Allowed Uses: ...           │
│ Color: [Color Picker]       │
│ Status: Active              │
│ [Draw Boundaries]           │
│ [Edit Boundaries]           │
│ [Delete Zone]               │
└─────────────────────────────┘
```

## Files to Delete

### Migrations
- `database/migrations/2026_01_18_035701_create_zoning_applications_table.php`
- `database/migrations/2026_01_18_035704_create_zoning_application_documents_table.php`
- `database/migrations/2026_01_18_035706_create_zoning_application_status_history_table.php`
- `database/migrations/2026_01_18_145131_create_clup_master_table.php`
- `database/migrations/2026_01_18_145139_create_zoning_classification_table.php`
- `database/migrations/2026_01_18_145142_create_zoning_gis_polygon_table.php`
- `database/migrations/2026_01_22_041127_drop_old_zoning_tables.php` (update to also drop CLUP tables)

### Models
- `app/Models/ClupMaster.php`
- `app/Models/ZoningClassification.php`
- `app/Models/ZoningGisPolygon.php`

### Controllers
- `app/Http/Controllers/Admin/ClupController.php`

### Requests
- `app/Http/Requests/StoreClupRequest.php`
- `app/Http/Requests/UpdateClupRequest.php`
- `app/Http/Requests/StoreZoningClassificationRequest.php`
- `app/Http/Requests/StoreZoningGisPolygonRequest.php`

### Frontend Pages
- `resources/js/pages/Admin/Zoning/ClupCreate.tsx`
- `resources/js/pages/Admin/Zoning/ClupEdit.tsx`
- `resources/js/pages/Admin/Zoning/ClupIndex.tsx`
- `resources/js/pages/Admin/Zoning/ClupShow.tsx`

### Frontend Components
- `resources/js/components/Clup/ZoningClassificationsStep.tsx`
- `resources/js/components/ZoningClassificationCard.tsx`
- `resources/js/components/ZoningClassificationDetailsModal.tsx`
- `resources/js/components/ZoningClassificationModal.tsx`
- `resources/js/components/ZoningPolygonModal.tsx`

## Files to Create/Update

### 1. Create New Migration
**File:** `database/migrations/YYYY_MM_DD_HHMMSS_drop_clup_and_old_zoning_tables.php`
- Drop `clup_master` table
- Drop `zoning_classification` table  
- Drop `zoning_gis_polygon` table
- Drop old `zoning_applications` table (if exists)
- Drop old `zoning_application_documents` table (if exists)
- Drop old `zoning_application_status_history` table (if exists)

### 2. Update Routes
**File:** `routes/web.php`
- Remove all CLUP routes (`/admin/zoning/clup/*`)
- Add zone routes:
  - `GET /admin/zoning/zones` - List zones
  - `POST /admin/zoning/zones` - Create zone
  - `GET /admin/zoning/zones/{id}` - Get zone
  - `PATCH /admin/zoning/zones/{id}` - Update zone
  - `DELETE /admin/zoning/zones/{id}` - Delete zone
  - `GET /api/zones` - Get all active zones for map rendering
- Remove ClupController import

### 3. Create ZoneController
**File:** `app/Http/Controllers/Admin/ZoneController.php`
- `index()` - List all zones (with optional filters: status, search)
- `store()` - Create new zone (can be created without geometry initially)
- `show($id)` - Get zone details with geometry
- `update($id)` - Update zone details and/or geometry
- `destroy($id)` - Delete zone
- `getAllZones()` - API endpoint for map (returns all active zones with geometry for rendering)
- `checkOverlap()` - Optional: Check if new/updated geometry overlaps with existing zones

### 4. Create Zone Requests
**File:** `app/Http/Requests/StoreZoneRequest.php`
- Validate:
  - `code` - required, string, max:20, unique in zones table, format validation (alphanumeric with dashes)
  - `name` - required, string, max:100
  - `description` - nullable, text
  - `allowed_uses` - nullable, text
  - `geometry` - nullable, array (GeoJSON Polygon or MultiPolygon) - can be null for initial creation
  - `color` - nullable, string, max:20 (hex color or HSL)
  - `is_active` - boolean, default true

**File:** `app/Http/Requests/UpdateZoneRequest.php`
- Same validation as StoreZoneRequest
- `code` - unique except for current zone
- `geometry` - can be updated separately from other fields

### 5. Update Zone Model
**File:** `app/Models/Zone.php`
- Already exists and is correct
- Ensure geometry cast is `array` for GeoJSON
- Add scope for active zones
- Add scope for zones with geometry

### 6. Create New Zone Components
**File:** `resources/js/components/Zones/ZoneCard.tsx`
- Display zone in list (code, name, status indicator)
- Click to select zone

**File:** `resources/js/components/Zones/ZoneDetailsPanel.tsx`
- Show selected zone details
- Zone info (code, name, description, allowed uses)
- Color picker
- Action buttons (Draw Boundaries, Edit Boundaries, Delete)

**File:** `resources/js/components/Zones/CreateZoneModal.tsx`
- Form for creating new zone
- Fields: code, name, description, allowed uses, color
- Validation
- Submit creates zone without geometry

### 7. Complete Rewrite of ZoningMap Component
**File:** `resources/js/pages/Admin/Zoning/ZoningMap.tsx`

**⚠️ Complete refactor - will rewrite entire file**

**New Structure:**
- **Remove**: All CLUP/Classification logic, imports, components
- **Add**: Zone management sidebar with:
  - Zone list (all zones with status indicators)
  - "Create New Zone" button (opens CreateZoneModal)
  - Zone details panel (shows selected zone info)
  - Zone action buttons (Draw Boundaries, Edit Boundaries, Delete)
- **Map functionality:**
  - Render all active zones with their colors on map load
  - Select zone from sidebar → highlights on map
  - Draw mode: Select zone → Click "Draw Boundaries" → Draw polygon(s) → Check overlap → Save to `zones.geometry`
  - Edit mode: Select zone → Click "Edit Boundaries" → Edit/delete polygons → Check overlap → Save
  - Support MultiPolygon (multiple disconnected areas per zone)
  - Overlap detection using Turf.js before saving

**Key Changes:**
- Remove all CLUP imports: `getClups`, `getClassifications`, `getPolygons`, `getAllPolygonsForClup`, `savePolygon`, `updatePolygon`, `deletePolygon`
- Remove CLUP types: `Clup`, `ZoningClassification`, `ZoningPolygon`
- Add zone imports: `getZones`, `getZone`, `createZone`, `updateZone`, `deleteZone`
- Add zone type: `Zone` interface
- Remove CLUP components: `ZoningClassificationCard`, `ZoningClassificationDetailsModal`
- Add zone components: `ZoneCard`, `ZoneDetailsPanel`, `CreateZoneModal`
- Update `handlePolygonCreated`: Save to `zones.geometry` field (not separate polygon table)
- Update polygon rendering: Use `zones.color` field for styling
- Add overlap detection: Use Turf.js `intersect` to check for intersections before saving
- Simplify UI: No CLUP hierarchy, direct zone management

### 8. Update Services
**File:** `resources/js/data/services.ts`
- Remove CLUP-related functions:
  - `getClups()`
  - `getClassifications()`
  - `getPolygons()`
  - `getAllPolygonsForClup()`
  - `savePolygon()`
  - `updatePolygon()`
  - `deletePolygon()`
- Remove CLUP types: `Clup`, `ZoningClassification`, `ZoningPolygon`
- Add zone-related functions:
  - `getZones(filters?)` - Get all zones (with optional filters)
  - `getZone(id)` - Get single zone
  - `createZone(data)` - Create zone (geometry optional)
  - `updateZone(id, data)` - Update zone (can update geometry separately)
  - `deleteZone(id)` - Delete zone
- Add zone type: `Zone` interface

### 9. Update Sidebar
**File:** `resources/js/components/Sidebar.tsx`
- Remove CLUP menu item
- Keep Zoning Map item (now simplified)

### 10. Update Zone Detection
**File:** `resources/js/lib/zoneDetection.ts`
- Already uses `zones` table - verify it works correctly
- Ensure it handles MultiPolygon geometry
- No changes needed (already correct)

### 11. Add Overlap Detection Utility
**File:** `resources/js/lib/zoneOverlapDetection.ts` (new)
- Function to check if new geometry overlaps with existing zones
- Uses Turf.js `intersect` function
- Returns list of overlapping zones
- Used before saving zone geometry

## Implementation Notes

### Zone Geometry Storage
- Store as GeoJSON in `zones.geometry` field (JSON type)
- Support both Polygon and MultiPolygon
- When user draws multiple polygons for same zone, combine into MultiPolygon
- Geometry can be null initially (zone created without boundaries)

### Overlap Detection
- Use Turf.js `turf.intersect()` to check if new geometry overlaps with existing zones
- Check before saving zone geometry
- Show warning/error if overlap detected
- Allow admin to proceed anyway (with warning) or cancel

### Zone Status
- **Draft**: Zone created but no geometry (`geometry` is null)
- **Active**: Zone has geometry (`geometry` is not null and `is_active` is true)
- **Inactive**: Zone disabled (`is_active` is false)

### Features to Implement
1. **Zone Code Validation**: Unique, format validation (e.g., "R-1", "C-2", alphanumeric with dashes)
2. **Auto-Color Generation**: Hash function generates color from zone code (with manual override)
3. **Zone Status Indicators**: Visual indicators for Active/No Boundaries/Inactive
4. **Multi-Polygon Support**: One zone can have multiple disconnected areas (MultiPolygon GeoJSON)
5. **Overlap Detection**: Prevent zones from overlapping (using Turf.js intersection checks)
6. **Zone Filtering**: Filter zones by status, search by code/name
7. **Zone Templates** (Optional): Pre-defined templates for common classifications (R-1, R-2, C-1, etc.)

## Migration Strategy
1. Create new migration to drop old tables
2. Data migration: If zones table has data from old migration, keep it
3. Remove all CLUP-related code
4. Create new zone components
5. Complete rewrite of ZoningMap.tsx
6. Test zone creation, editing, deletion, and overlap prevention

## Benefits
- Simpler architecture (1 table vs 3 tables)
- Direct zone management
- No CLUP hierarchy complexity
- Easier to maintain
- Leaflet Draw already working - no library changes needed
- Turf.js already installed for overlap detection
- Clear two-step workflow (details first, then boundaries)
