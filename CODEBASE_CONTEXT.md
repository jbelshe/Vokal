# Vokal App - Codebase Context Documentation

## Overview

Vokal is a React Native mobile application built with Expo that enables users to vote on properties (likely commercial real estate) and provide feedback about what types of businesses they'd like to see in those locations. The app uses Supabase for backend services, authentication, and database operations.

## Tech Stack

- **Framework**: React Native 0.81.5 with Expo SDK 54
- **Language**: TypeScript
- **Navigation**: React Navigation (Native Stack Navigator)
- **Backend**: Supabase (PostgreSQL database, Auth, Storage)
- **State Management**: React Context API (multiple context providers)
- **Maps**: React Native Maps + Expo Maps
- **Location**: Expo Location
- **Notifications**: Expo Notifications
- **Analytics**: PostHog (with session replay)
- **Error Tracking**: Sentry
- **UI Libraries**: 
  - React Native Reanimated
  - React Native SVG
  - Expo Linear Gradient
  - Various custom components

## Project Structure

```
my-app/
├── src/
│   ├── api/              # API layer - Supabase queries and external API calls
│   ├── assets/           # Images, icons, fonts, theme files
│   ├── components/       # Reusable UI components
│   ├── context/          # React Context providers for global state
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions and helpers
│   ├── navigation/       # Navigation stack definitions
│   ├── screens/          # Screen components organized by feature
│   ├── schemas/          # Database schema type definitions
│   └── types/            # TypeScript type definitions
├── App.tsx               # Root component with providers
├── index.ts              # Entry point
└── package.json          # Dependencies and scripts
```

## Core Architecture

### Application Entry Point

**`App.tsx`** is the root component that wraps the entire application with:
1. **Sentry** - Error tracking and monitoring
2. **PostHogProvider** - Analytics and session replay
3. **FontLoader** - Loads custom fonts (Montserrat)
4. **AuthProvider** - Authentication state management
5. **AppProvider** - Application-wide state (properties, categories, map region)
6. **VotingProvider** - Voting flow state management
7. **RootNavigator** - Main navigation container

### Context Providers

#### 1. AuthContext (`src/context/AuthContext.tsx`)

Manages user authentication and profile state.

**State:**
- `loading`: Initialization state
- `isAuthenticated`: Whether user has valid session AND complete profile
- `session`: Supabase session object
- `profile`: User profile data (Profile type)
- `isOnboarding`: Whether user needs to complete onboarding

**Key Functions:**
- `handleSendOtp(phoneNumber)`: Sends OTP via Supabase Auth
- `handleVerifyOtp(otpInput)`: Verifies OTP and creates session
- `signOut()`: Signs out user and clears state
- `saveNewProfileToDatabase(profile)`: Creates new user profile
- `updateProfileInDatabase(profile)`: Updates existing profile

**Authentication Flow:**
1. User enters phone number → `handleSendOtp` → Supabase sends SMS
2. User enters OTP → `handleVerifyOtp` → Supabase verifies → Session created
3. Session triggers `onAuthStateChange` listener
4. `handleSessionChange` checks if user exists in `profiles` table
5. If no profile → `isOnboarding = true` → User goes through onboarding
6. If profile exists → Load profile → `isAuthenticated = true`

**Important Notes:**
- Authentication requires BOTH session AND profile with `firstName` (complete profile)
- Session is persisted using Expo SecureStore
- Race condition protection via `isProcessingSession` ref
- Sentry user ID is set when profile.userId exists

#### 2. AppContext (`src/context/AppContext.tsx`)

Manages application-wide state for properties, categories, and map.

**State:**
- `mapRegion`: Current map viewport region
- `properties`: Array of Property objects
- `currProperty`: Currently selected property
- `currentPropertyId`: ID of current property
- `currentTopVotes`: Top vote results for current property
- `categoriesDataMap`: Map of category codes to category data with subcategories
- `categoryToSubcategoryMap`: Maps category codes to their subcategories
- `subcategoryToIdMap`: Maps subcategory codes to database IDs
- `idToCategoryMap`: Maps category/subcategory IDs to codes and names
- `subcategoryToCategoryMap`: Maps subcategory codes to parent category codes

**Initialization:**
- On mount, fetches all categories via `loadCategoriesAll()` from `api/voting.ts`
- Creates various lookup maps for efficient category/subcategory navigation

#### 3. VotingContext (`src/context/VotingContext.tsx`)

Manages state during the voting flow.

**State:**
- `categorySelected`: Selected category code
- `subCategorySelected`: Selected subcategory code
- `additionalNote`: Optional text note for vote
- `resetVoting()`: Clears all voting state

**Usage:**
- Used during the voting flow (Category → SubCategory → AdditionalNote → VoteConfirm)
- State is cleared after vote submission

### Navigation Structure

#### RootNavigator (`src/navigation/RootNavigator.tsx`)

Top-level navigator that:
- Shows loading spinner while `AuthContext.state.loading` is true
- Routes to `AuthStack` if `!isAuthenticated || isOnboarding`
- Routes to `AppStack` if authenticated and not onboarding
- Sets up notification listeners (foreground and tap handlers)

#### AuthStack (`src/navigation/AuthStack.tsx`)

Handles unauthenticated user flows:
1. **EnterPhoneNumber** - Phone number input
2. **OTP** - OTP verification code input
3. **CreateProfile1** - Profile creation (name, email, etc.)
4. **CreateProfile2** - Additional profile details
5. **Onboarding1-4** - Onboarding screens

#### AppStack (`src/navigation/AppStack.tsx`)

Main authenticated app navigation:
- **Home** - Map/list view of properties
- **Details** - Property details screen
- **PropertyDetails** - Detailed property view
- **SettingsMain** - Settings menu
- **Profile** - User profile screen
- **ContactUs** - Contact form
- **VoteHistory** - User's voting history
- **VotingFlow** - Modal voting flow (nested VotingStack)
- **VotingResults** - Modal showing vote results

#### VotingStack (`src/navigation/VotingStack.tsx`)

Nested stack for voting flow (presented as modal):
1. **Category** - Select property category
2. **SubCategory** - Select subcategory within category
3. **AdditionalNote** - Optional text note
4. **VoteConfirm** - Confirm and submit vote

### API Layer (`src/api/`)

#### auth.ts

**Functions:**
- `sendOtp(phone)`: Sends OTP via Supabase Auth
- `verifyOtp(phone, token)`: Verifies OTP and returns session + profile
- `doesUserExist(userId)`: Checks if user profile exists in `profiles` table
- `fetchUserProfile(userId, phone)`: Fetches user profile from `profiles` table
- `saveProfile(profile, session)`: Creates new profile in database
- `updateProfile(profile)`: Updates existing profile

**Database Tables:**
- `profiles` - User profile data (id, first_name, last_name, email, zip_code, gender, date_of_birth, etc.)

#### properties.ts

**Functions:**
- `fetchProperties(profileId)`: Fetches all properties (unused in current code)
- `fetchPropertiesInBounds(bounds, profileId)`: Fetches properties within map bounds
  - Includes cover images via `property_image_links` join
  - Includes user's votes via `votes` join
  - Filters by `site_status = 'active'`
  - Orders by cover image flag and order_index
- `fetchPropertiesForUser(userId, offset, limit)`: Fetches properties user has voted on
  - Ordered by vote `updated_at` (most recent votes first)

**Database Tables:**
- `properties` - Property data (id, title, address fields, lat/lng, description, etc.)
- `property_image_links` - Links properties to images (is_cover flag, order_index)
- `images` - Image metadata (id, bucket, path, width, height, mime)
- `votes` - User votes on properties (user_id, property_id, choice, free_text, updated_at)

**Property Data Structure:**
- Includes location (latitude, longitude)
- Address fields (address_1, address_2, city, state, county, postal_code)
- Images (cover_image_url, image_urls array)
- User's vote (if exists): `{ choice_id, free_text }`

#### voting.ts

**Functions:**
- `loadCategoriesAll()`: Loads all categories and subcategories, creates lookup maps
- `submitVote(user_id, property_id, subcategory_choice, note)`: Submits vote to database
- `getTopVotes(property_id)`: Calls Supabase RPC function `get_top_property_votes` to get top 5 vote categories

**Database Tables:**
- `property_categories` - Categories (id, name, code, index_order, description)
- `property_subcategories` - Subcategories (id, code, name, linked to category)
- `votes` - User votes (property_id, user_id, choice (subcategory_id), free_text)

#### images.ts

**Functions:**
- `getImageURL(bucket, path)`: Creates signed URL (60 min expiry)
- `buildImageURL(bucket, path)`: Builds public URL for Supabase storage
- `fetchCoverImage(propertyId)`: Fetches cover image for a property

**Image Storage:**
- Uses Supabase Storage buckets
- Images referenced via `property_image_links` table
- Public URLs format: `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`

#### places.ts

**Functions:**
- `fetchPlaces(input)`: Google Places Autocomplete API for location search
- `fetchPredictedPlace(prediction)`: Google Places Details API to get lat/lng for selected place

**External APIs:**
- Google Places API (autocomplete and details)
- Uses different API keys for Android vs iOS

### Key Screens

#### HomeScreen (`src/screens/HomeScreen.tsx`)

Main screen showing properties on a map or list.

**Features:**
- Map view with markers for properties
- List view with property cards
- Search bar with Google Places autocomplete
- Location permission handling
- Property loading based on map bounds
- Toggle between map/list views
- Property selection and navigation to details

**State Management:**
- Uses `AppContext` for properties and map region
- Uses `AuthContext` for user session
- Uses `useUserLocation` hook for location services

**Key Functions:**
- `loadPropertiesInBounds()`: Fetches properties when map region changes
- `handleMapRegionChange()`: Updates map region and triggers property loading
- `handlePropertySelect()`: Sets selected property and navigates to details

#### PropertyDetailsScreen (`src/screens/PropertyDetailsScreen.tsx`)

Shows detailed information about a property.

**Features:**
- Property images gallery
- Address and description
- Vote button (opens VotingFlow modal)
- View voting results
- User's existing vote display

#### Voting Flow Screens (`src/screens/voting-flow/`)

1. **CategoryScreen**: Displays categories from `AppContext.categoriesDataMap`
2. **SubCategoryScreen**: Shows subcategories for selected category
3. **AdditionalNoteScreen**: Optional text input for vote note
4. **VoteConfirmScreen**: Confirms vote details and submits via `submitVote()`

### Type Definitions (`src/types/`)

#### property.ts
```typescript
interface Property {
  id: string;
  title: string;
  address_1: string;
  address_2?: string;
  city: string;
  state: string;
  county: string;
  postal_code: string;
  latitude: number;
  longitude: number;
  description?: string;
  cover_image_url?: string;
  image_urls?: string[];
  vote: DBVote | null; // User's vote if exists
  // ... other fields
}
```

#### profile.ts
```typescript
type Profile = {
  phoneNumber: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  zipCode: string | null;
  gender: string | null;
  birthday: Birthday | null;
  emailSubscribed: boolean;
  userId: string | null;
  role: string | null;
  notificationsEnabled: boolean;
  expoPushToken: string | null;
}
```

#### vote.ts
```typescript
type DBVote = {
  choice_id: string; // Subcategory ID
  free_text?: string; // Optional note
}

type TopVoteResults = {
  top_categories: VoteTally[];
  total_votes: number;
}

type VoteTally = {
  category_code: string;
  category_name: string;
  count: number;
}
```

#### categories.ts
```typescript
type CategoryWithSubcategories = {
  id: number;
  name: string;
  code: string;
  description: string;
  subcategories: Subcategory[];
}

type Subcategory = {
  name: string;
  id: number;
  code: string;
}
```

#### navigation.ts
Defines TypeScript types for navigation params:
- `AppStackParamList`: Params for main app screens
- `AuthStackParamList`: Params for auth screens
- `VotingStackParamList`: Params for voting flow screens

### Custom Hooks

#### useNotificationSetup (`src/hooks/useNotificationSetup.ts`)
- Registers for push notifications when user is authenticated
- Saves Expo push token to user profile
- Only runs when session exists

#### useUserLocation (`src/hooks/useUserLocation.ts`)
- Manages location permissions
- Requests and tracks user location
- Returns location status and request function

### Utilities (`src/lib/`)

#### supabase.ts
- Creates Supabase client with custom storage adapter (Expo SecureStore)
- Configures auth with auto-refresh and session persistence

#### authHelpers.ts
- `authedFetch()`: Wrapper for API calls that require authentication
- Checks session before executing function

#### imageHelper.ts
- Image path conversion utilities
- Handles different image sizes

#### notifications.ts
- Push notification registration
- Token saving to database

### Key Data Flows

#### 1. Authentication Flow
```
EnterPhoneNumber → handleSendOtp → Supabase SMS
→ OTP Screen → handleVerifyOtp → Supabase verify
→ Session created → onAuthStateChange → handleSessionChange
→ Check doesUserExist → If no: onboarding, If yes: load profile
→ isAuthenticated = true → Navigate to AppStack
```

#### 2. Property Loading Flow
```
HomeScreen mounts → Map region changes → handleMapRegionChange
→ fetchPropertiesInBounds(bounds, userId) → Supabase query
→ Join with property_image_links and votes → Map to Property[]
→ Update AppContext.properties → Render markers/cards
```

#### 3. Voting Flow
```
PropertyDetails → Open VotingFlow modal → CategoryScreen
→ Select category → Update VotingContext.categorySelected
→ SubCategoryScreen → Select subcategory → Update VotingContext.subCategorySelected
→ AdditionalNoteScreen → Optional note → Update VotingContext.additionalNote
→ VoteConfirmScreen → submitVote() → Insert into votes table
→ Reset VotingContext → Close modal → Refresh property data
```

#### 4. Category Loading Flow
```
AppProvider mounts → useEffect → loadCategoriesAll()
→ Query property_categories with subcategories join
→ Build lookup maps (categoryToSubcategoryMap, subcategoryToIdMap, etc.)
→ Store in AppContext → Available throughout app
```

### Environment Variables

Required environment variables (in `.env` or `app.json`):
- `EXPO_PUBLIC_SUPABASE_URL`: Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
- `EXPO_PUBLIC_SUPABASE_PUBLIC_KEY`: Supabase public key
- `EXPO_PUBLIC_GOOGLE_PLACES_API_KEY`: Google Places API key
- `EXPO_PUBLIC_GOOGLE_PLACES_API_KEY_ANDROID`: Android-specific key

### Database Schema (Inferred)

**profiles**
- id (UUID, primary key, references auth.users)
- first_name, last_name, email, zip_code, gender
- date_of_birth, email_subscription, role
- notifications_enabled, expo_push_token
- created_at, updated_at

**properties**
- id (UUID, primary key)
- title, address_1, address_2, city, state, county, postal_code
- latitude, longitude
- description, owners_note, tenant
- site_status, status
- link_type, link_url
- estimated_open
- listed_by (UUID, references profiles)
- created_at, last_edited

**property_categories**
- id (UUID, primary key)
- name, code, index_order, description

**property_subcategories**
- id (UUID, primary key)
- code, name
- category_id (references property_categories)

**votes**
- id (UUID, primary key)
- property_id (references properties)
- user_id (references profiles)
- choice (UUID, references property_subcategories)
- free_text (text)
- created_at, updated_at

**images**
- id (UUID, primary key)
- bucket, path, width, height, mime

**property_image_links**
- property_id (references properties)
- image_id (references images)
- is_cover (boolean)
- order_index (integer)

### Important Patterns

1. **Session Management**: Uses Supabase's `onAuthStateChange` as single source of truth. Race conditions prevented with refs.

2. **State Updates**: Batch state updates after async operations to prevent React re-render interference.

3. **Image Loading**: Uses public URLs for Supabase storage, with size conversion via `convertImagePath()`.

4. **Error Handling**: Sentry integration for error tracking. User ID set in Sentry when profile exists.

5. **Navigation**: Type-safe navigation using TypeScript param lists. Modal presentations for voting flow.

6. **Data Fetching**: Properties fetched based on map bounds for performance. Includes user's votes in same query.

7. **Category Lookups**: Pre-loaded category maps for efficient O(1) lookups during voting flow.

### Common Tasks

#### Adding a New Screen
1. Create screen component in `src/screens/`
2. Add route to appropriate stack navigator
3. Add param type to `src/types/navigation.ts`
4. Use navigation hook: `navigation.navigate('ScreenName', { params })`

#### Adding a New API Function
1. Create function in appropriate `src/api/*.ts` file
2. Use `supabase` client from `src/lib/supabase.ts`
3. Return typed data matching TypeScript interfaces
4. Handle errors appropriately

#### Accessing Context
```typescript
// Auth
const { state, handleSendOtp, signOut } = useAuth();

// App state
const { properties, setProperties, categoriesDataMap } = useAppContext();

// Voting
const { categorySelected, setCategorySelected, resetVoting } = useVotingContext();
```

#### Database Queries
- Use Supabase client: `supabase.from('table_name').select(...)`
- Join related tables: `.select('*, related_table(*)')`
- Filter: `.eq('column', value)`, `.gte('column', value)`, etc.
- Order: `.order('column', { ascending: true })`

### Testing Considerations

- Authentication requires valid Supabase project
- Location features require device/simulator with location services
- Google Places API requires valid API keys
- Push notifications require Expo push notification service
- Sentry and PostHog configured with API keys

### Build & Deployment

- **Development**: `npm start` or `expo start`
- **iOS**: `npm run ios` or `expo run:ios`
- **Android**: `npm run android` or `expo run:android`
- **Type Check**: `npm run typecheck`
- **Lint**: `npm run lint`

Uses Expo Application Services (EAS) for builds (see `eas.json`).

---

This document provides a comprehensive overview of the Vokal app codebase. For specific implementation details, refer to the source files mentioned in each section.

