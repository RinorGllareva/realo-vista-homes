

# Add Section Dividers to Homepage

## Overview
Adding elegant semi-width dividers between homepage sections to create visual separation while maintaining the cohesive flow of the design.

## Divider Design
- **Width:** 70% of the container (centered)
- **Color:** `#bdb8a1` - matches the existing header divider in PropertyPreview
- **Style:** Simple horizontal line with subtle styling
- **Placement:** Centered horizontally

## Where Dividers Will Be Added

```text
+---------------------------+
|      PropertyPreview      |
|   [Shikoni Të Gjitha...]  |
+---------------------------+
|     ─────────────────     |  <-- Divider 1 (70% width)
+---------------------------+
|      PropertiesMap        |
|   [Map + property count]  |
+---------------------------+
|     ─────────────────     |  <-- Divider 2 (70% width)
+---------------------------+
|      AboutSection         |
+---------------------------+
```

## Implementation Approach

### Option A: Add Dividers Inside Components (Recommended)
Add the divider at the bottom of `PropertyPreview` and bottom of `PropertiesMap` components. This keeps the dividers contextually tied to their sections.

### Option B: Add Dividers in HomePage
Add separate divider elements between components in `HomePage.tsx` using the existing `Separator` component or custom styling.

## Files to Modify

### 1. `src/components/PropertyPreview.tsx`
Add a centered divider below the "Shikoni Të Gjitha Pronat" button:
- Position: At the very bottom of the section, inside the cream background
- Styling: `w-[70%] mx-auto border-t border-[#bdb8a1]` with some padding above

### 2. `src/components/PropertiesMap.tsx`
Add a centered divider below the property count text:
- Position: At the bottom of the section
- Styling: Same as above for consistency

## Visual Details
- The dividers use the same muted olive-tan color (`#bdb8a1`) already used in the PropertyPreview header
- Semi-transparent appearance blends naturally with the cream background
- 70% width creates a clean, modern look that doesn't span edge-to-edge

## Technical Details

### Divider CSS Classes
```
w-[70%] mx-auto border-t border-[#bdb8a1] mt-10
```

This creates:
- 70% width centered (`w-[70%] mx-auto`)
- Single border line on top (`border-t`)
- Matching color (`border-[#bdb8a1]`)
- Spacing above (`mt-10`)

### Changes Summary
| File | Change |
|------|--------|
| `PropertyPreview.tsx` | Add divider div after the button container |
| `PropertiesMap.tsx` | Add divider div after the property count paragraph |

