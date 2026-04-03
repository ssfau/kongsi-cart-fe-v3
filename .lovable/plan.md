

# Plan: Add 10 Pantry/Staple Categories + Fix Build Errors

## Summary
Add 10 new Malaysian pantry staple items (Beras, Tepung Gandum, etc.) as valid listing categories with AI-generated images, and fix all existing build errors.

## Build Error Fixes

### 1. Fix `collection_point` → `collectionPoint` (4 files)
The `ListingItem` interface uses `collectionPoint` but several files reference `collection_point` (snake_case from backend). Fix by updating the `ListingItem` interface to include an optional `collection_point` field OR normalizing at fetch time. Safest: add `collection_point?: string` to the interface since backend may return snake_case.

**Files**: `ShopPage.tsx`, `LiveNearYou.tsx`, `SplitHeroMap.tsx`, `Explore.tsx`

### 2. Fix `OrdersPage.tsx` line 117-119
`{discount > 0 && ( {/* Community Discount Removed */} )}` returns `{}` which isn't valid ReactNode. Replace with `null` or remove the block entirely.

### 3. Fix `chart.tsx` type errors
These are known recharts type compatibility issues. Add type assertions or update the component types.

## New Categories

### 4. Generate images for 10 new items
Use the AI image generation skill to create product images for:
- Beras (Rice), Tepung Gandum (Wheat Flour), Kicap (Soy Sauce), Sos Cili (Chili Sauce), Sos Tomato (Ketchup), Minyak Masak (Cooking Oil), Gula (Sugar), Garam (Salt), Santan (Coconut Milk), Mee/Bihun (Noodles)

Save as `.jpg` files in `src/assets/produce/`.

### 5. Add new group type "Pantry Staples"
Update `src/data/shopItems.ts`:
- Add `"Pantry Staples"` to the `group` union type
- Add 10 new `ShopItemCategory` entries

### 6. Update produce image index
Add all 10 new imports and mappings in `src/assets/produce/index.ts`.

### 7. Update category group filter
In `ShopPage.tsx`, add `"Pantry Staples"` to the `CategoryGroup` type and the group filter tabs. Similarly update `Explore.tsx` if it has group filtering.

### 8. Update fake listings data
Add entries for the new categories in `src/data/fakeListings.ts` so fallback data includes them.

### 9. Update hero banner config
Add a `"Pantry Staples"` entry in the `categoryHeroMap` in `ShopPage.tsx`.

### 10. Update CreateListings category dropdown
The dropdown already reads from `shopItemCategories`, so it will automatically include the new items — no change needed.

## Technical Details

- **Image generation**: 10 calls to AI image generation model, saved to `src/assets/produce/`
- **New group type**: `"Pantry Staples"` added to the union in `ShopItemCategory`
- **CategoryGroup type** expanded: `"All" | "Leafy Greens" | "Vegetables" | "Fruits" | "Pantry Staples"`
- **ListingItem interface**: Add `collection_point?: string` to resolve snake_case TS errors across 4 files
- **chart.tsx**: Apply `any` type assertions to resolve recharts type mismatch

