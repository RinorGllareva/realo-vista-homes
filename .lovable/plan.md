
# Restyle Properties Map Section - Light Theme

## Current Issue
The map section uses a dark background (#292929) and dark CARTO map tiles, creating a harsh visual break between:
- **PropertyPreview** (light cream #ebe1cf)
- **PropertiesMap** (dark gray #292929) - jarring contrast
- **AboutSection** (white/light background)

## Solution
Restyle the map section to use a light theme that flows naturally with the surrounding sections.

## Color Changes

### Section Background
- **From:** `bg-real-estate-dark` (dark gray #292929)
- **To:** `bg-[#ebe1cf]` (cream, same as PropertyPreview)

### Section Text
- **Title:** Change from gold (`text-real-estate-secondary`) to olive (`text-[#7e7859]`) to match PropertyPreview headers
- **Subtitle:** Change from `text-gray-400` to `text-[#888]` for better visibility on light background
- **Property count:** Change from `text-gray-500` to `text-[#888]`

### Map Tiles
- **From:** CARTO Dark Matter (dark themed)
- **To:** CARTO Voyager or Positron (light themed map)

### Marker Colors
Keep the existing gold/green marker colors (#c9ab03 outer, #0a4834 inner) - these match the brand and work well on light maps.

### Popup Styling
Update CSS to ensure popups look clean on the light map with proper shadows and borders.

## Files to Modify

### 1. `src/components/PropertiesMap.tsx`
- Change section background class from `bg-real-estate-dark` to `bg-[#ebe1cf]`
- Update title text color to `text-[#7e7859]`
- Update subtitle and count text colors to `text-[#888]`
- Change TileLayer URL from dark tiles to light CARTO Voyager tiles

### 2. `src/index.css`
- Update popup styles for light theme compatibility
- Adjust shadow values for better visibility on light background

## Visual Result

```text
+---------------------------------+
|      PropertyPreview            |
|   (cream bg #ebe1cf)            |
+---------------------------------+
|      PropertiesMap              |  
|   (cream bg #ebe1cf)            |  <-- Now matches!
|   (light map tiles)             |
|   (olive text #7e7859)          |
+---------------------------------+
|      AboutSection               |
|   (white/light bg)              |
+---------------------------------+
```

The section will now blend seamlessly between PropertyPreview and AboutSection, creating a cohesive visual flow throughout the homepage.
