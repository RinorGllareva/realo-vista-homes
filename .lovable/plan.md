
# Add Interactive Property Map to Homepage

## Overview
Adding an interactive map section above the About Us section on your homepage that displays property locations with custom markers. The map will show properties from your API with clickable markers that display property details.

## What You'll Get
- A full-width interactive map showing Prishtina and surrounding areas
- Custom red markers for each property location (similar to your reference image)
- Clicking a marker shows property info (price, type, address)
- Dark-themed map matching your site's aesthetic
- Responsive design that works on all devices

## Implementation Steps

### 1. Install Map Libraries
Add the required packages for React Leaflet:
- `leaflet` - Core mapping library
- `react-leaflet` - React wrapper for Leaflet
- `@types/leaflet` - TypeScript definitions

### 2. Create Map Component
Build a new `PropertiesMap.tsx` component that:
- Fetches properties from your existing API (`api/Property/GetProperties`)
- Filters to properties with valid latitude/longitude coordinates
- Displays up to 60 properties on an interactive map
- Uses CARTO dark tile layer for the map style (matching your reference image)
- Shows custom red pin markers for each property

### 3. Create Custom Marker Styles
Add CSS for Leaflet and custom red property markers that match your brand colors.

### 4. Add Marker Popups
When clicking a property marker, show:
- Property title
- Price in euros
- Property type (Shtepi, Banesa, etc.)
- Sale/Rent indicator
- "View Details" button linking to property page

### 5. Update Homepage Layout
Modify `HomePage.tsx` to include the new map section between PropertyPreview and AboutSection:

```text
+------------------+
|     Header       |
+------------------+
|   MainSection    |
+------------------+
| PropertyPreview  |
+------------------+
|  PropertiesMap   |  <-- NEW
+------------------+
|   AboutSection   |
+------------------+
|     Footer       |
+------------------+
```

### 6. Section Styling
Add a title section above the map:
- "Gjeni Pronat ne Harte" (Find Properties on Map)
- Consistent styling with other section headers
- Map height: 500px on desktop, 400px on mobile

---

## Technical Details

### New Dependencies
```json
{
  "leaflet": "^1.9.4",
  "react-leaflet": "^4.2.1",
  "@types/leaflet": "^1.9.12"
}
```

### API Integration
Uses your existing endpoint:
```
GET /api/Property/GetProperties
```
Filters properties where:
- `latitude` and `longitude` are valid numbers
- `isForSale` or `isForRent` is true

### Map Configuration
- Center: Prishtina (42.6629, 21.1655)
- Zoom level: 11
- Tile provider: CARTO Dark Matter (dark theme)
- Attribution: CARTO, OpenStreetMap contributors

### Files to Create/Modify
1. **Create** `src/components/PropertiesMap.tsx` - Main map component
2. **Modify** `src/index.css` - Add Leaflet CSS import and custom marker styles
3. **Modify** `src/pages/HomePage.tsx` - Add PropertiesMap to layout
4. **Modify** `package.json` - Add leaflet dependencies

### Error Handling
- Loading state while fetching properties
- Graceful fallback if API fails
- Skip properties without valid coordinates
