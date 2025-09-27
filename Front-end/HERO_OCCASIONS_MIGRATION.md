# Hero Occasions Migration to Backend

## Overview

This document describes the migration of hero occasions data from local JSON files to the backend API.

## Changes Made

### 1. Created API Service (`src/services/api.ts`)

- Created a comprehensive API service for communicating with the backend
- Includes proper error handling and TypeScript types
- Supports all hero occasions endpoints:
  - `getAll()` - Get all occasions with filtering and pagination
  - `getActive()` - Get active occasions only
  - `getUpcoming()` - Get upcoming occasions
  - `getById()` - Get single occasion by ID
  - `search()` - Search occasions

### 2. Created Custom Hook (`src/hooks/useHeroOccasions.ts`)

- `useHeroOccasions()` - General purpose hook for hero occasions
- `useHeroSliderOccasions()` - Specialized hook for the hero slider
- Includes loading states, error handling, and automatic data fetching
- Provides computed values like `nearestOccasion` and `activeOccasions`

### 3. Updated HeroSlider Component (`src/components/home/HeroSlider.tsx`)

- Removed dependency on local `heroOccasions.json` file
- Now uses the `useHeroSliderOccasions` hook
- Added loading state UI
- Added error handling with fallback to promotional slides
- Updated TypeScript interfaces to match backend data structure

### 4. Removed Local Data File

- Deleted `src/data/heroOccasions.json`
- All hero occasions data now comes from the backend API

## Backend API Endpoints Used

The frontend now communicates with these backend endpoints:

- `GET /api/hero-occasions` - Get all occasions
- `GET /api/hero-occasions/active` - Get active occasions
- `GET /api/hero-occasions/upcoming` - Get upcoming occasions
- `GET /api/hero-occasions/:id` - Get single occasion
- `GET /api/hero-occasions/search` - Search occasions

## Data Structure Changes

### Old Structure (Local JSON)

```typescript
interface Occasion {
  id: string;
  nameAr: string;
  nameEn: string;
  date: string;
  images: string[];
  celebratoryMessageAr: string;
  celebratoryMessageEn: string;
  priority: number;
  isActive: boolean;
}
```

### New Structure (Backend API)

```typescript
interface HeroOccasion {
  _id: string;
  id: string;
  nameAr: string;
  nameEn: string;
  date: string;
  images: string[];
  celebratoryMessageAr: string;
  celebratoryMessageEn: string;
  priority: number;
  isActive: boolean;
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
  updatedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}
```

## Benefits

1. **Centralized Data Management**: All hero occasions are now managed through the admin panel
2. **Real-time Updates**: Changes in the admin panel are immediately reflected in the frontend
3. **Better Performance**: Data is fetched only when needed
4. **Error Handling**: Proper error handling with fallback mechanisms
5. **Type Safety**: Full TypeScript support with proper interfaces
6. **Scalability**: Easy to add new features and endpoints

## Configuration

The API service is configured to connect to:

- **Development**: `https://localhost:3002/api`
- **Production**: Update the `API_BASE_URL` in `src/services/api.ts`

## Error Handling

The system includes comprehensive error handling:

- Network errors are caught and logged
- Fallback to promotional slides when hero occasions fail to load
- Loading states provide user feedback
- Console errors help with debugging

## Testing

To test the integration:

1. Ensure the backend server is running on port 3002
2. Start the frontend development server
3. Check the browser console for any API errors
4. Verify that hero occasions load correctly
5. Test error scenarios by stopping the backend server

## Future Improvements

1. Add caching for better performance
2. Implement retry logic for failed requests
3. Add offline support
4. Implement real-time updates using WebSockets
5. Add data validation on the frontend
