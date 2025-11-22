# Vokal App - Codebase Index

## Overview
Vokal is a React Native/Expo application for discovering and viewing properties. Users can browse properties on a map or list view, view property details, and submit suggestions for vacant spaces. The app uses Supabase for backend services including authentication, database, and storage.

## Technology Stack
- **Framework**: React Native with Expo (v54.0.21)
- **Language**: TypeScript (v5.9.2)
- **Navigation**: React Navigation (v7.x) with Native Stack Navigator
- **Backend**: Supabase (Auth, Database, Storage)
- **Maps**: react-native-maps (v1.20.1), expo-maps (v0.12.8)
- **UI Libraries**: 
  - Expo Linear Gradient
  - React Native SVG
  - React Native Confirmation Code Field
  - React Native Element Dropdown

## Project Structure

### Entry Point
- `App.tsx` - Main app component with providers (FontLoader, AuthProvider, AppProvider, RootNavigator)

### Core Directories

#### `/src/navigation/`
Navigation configuration and routing:
- `RootNavigator.tsx` - Root navigator that switches between AuthStack and AppStack based on authentication state
- `AuthStack.tsx` - Authentication and onboarding flow screens
- `AppStack.tsx` - Main app screens (Home, Details, PropertyDetails, Settings, Profile, etc.)

#### `/src/context/`
React Context providers for global state:
- `AuthContext.tsx` - Authentication state management using reducer pattern
  - Handles OTP verification, session management, profile state
  - Manages authentication flow with Supabase
  - Tracks onboarding status
- `AppContext.tsx` - Application-level state
  - Map region state
  - Properties data

#### `/src/api/`
API layer for backend communication:
- `auth.ts` - Authentication functions
  - `sendOtp()` - Send OTP to phone number
  - `verifyOtp()` - Verify OTP code
  - `fetchUserProfile()` - Get user profile from database
  - `saveProfile()` - Save/update user profile
  - `checkIfUserExists()` - Check if user exists via edge function
- `properties.ts` - Property-related functions
  - `fetchProperties()` - Fetch all properties
  - `fetchPropertiesInBounds()` - Fetch properties within map bounds with images
  - Property types and interfaces
- `images.ts` - Image handling
  - `buildImageURL()` - Construct public image URLs
  - `getImageURL()` - Get signed URLs from Supabase Storage
  - `fetchCoverImage()` - Fetch cover image for a property

#### `/src/lib/`
Library configurations and utilities:
- `supabase.ts` - Supabase client configuration with SecureStore for token storage
- `authHelpers.ts` - Authentication helper functions

#### `/src/screens/`

**Auth Flow** (`/auth-flow/`):
- `EnterPhoneNumber.tsx` - Phone number input screen
- `Otp.tsx` - OTP verification screen
- `CreateProfile1.tsx` - Profile creation (first step)
- `CreateProfile2.tsx` - Profile creation (second step)
- `/onboarding-flow/`:
  - `Onboarding1.tsx` through `Onboarding4.tsx` - Onboarding screens

**Main App Screens**:
- `HomeScreen.tsx` - Main screen with map/list view of properties
  - Map view with markers for properties
  - List view with property cards
  - Search functionality
  - Toggle between map/list views
- `PropertyDetailsScreen.tsx` - Detailed property view
  - Property images carousel
  - Property information (address, description, owner's note, estimated opening)
  - Action buttons (Submit Suggestions / View Instagram)
- `DetailsScreen.tsx` - Additional details screen

**Settings Flow** (`/settings-flow/`):
- `SettingsMainScreen.tsx` - Settings main menu
- `ProfileScreen.tsx` - User profile screen
- `ContactUsScreen.tsx` - Contact us screen
- `VoteHistoryScreen.tsx` - Voting history screen

#### `/src/components/`
Reusable UI components:
- `FontLoader.tsx` - Font loading component (Montserrat)
- `ImageWithLoader.tsx` - Image component with loading state
- `PageIndicator.tsx` - Page indicator for onboarding/carousels
- `ProfileIconButton.tsx` - Profile icon button component
- `PurpleButtonLarge.tsx` - Large purple gradient button
- `RoundNextButton.tsx` - Round next button component
- `SectionOptionsButton.tsx` - Section options button component

#### `/src/assets/`
Static assets and theming:
- `/theme/`:
  - `index.ts` - Theme exports
  - `colors.ts` - Color palette definitions
  - `textStyles.ts` - Typography styles
  - `typography.ts` - Typography configuration
  - `onboardingStyles.ts` - Onboarding-specific styles
- `/icons/` - SVG icon assets
- `/images/` - Image assets
- `/fonts/` - Font files (Montserrat Regular, Italic)

#### `/src/types/`
TypeScript type definitions:
- `navigation.ts` - Navigation param lists (AppStackParamList, AuthStackParamList)
- `profile.ts` - Profile type definition
- `birthday.ts` - Birthday type definition
- `userId.ts` - User ID type
- `svg.d.ts` - SVG module declarations

#### `/src/schemas/`
Database schema types:
- `images.ts` - DatabaseImage interface
- `property_image_links.ts` - Property image links schema

## Key Features

### Authentication Flow
1. User enters phone number
2. Receives OTP via SMS
3. Verifies OTP
4. Creates profile (first name, last name, email, zip code, gender, birthday)
5. Completes onboarding (4 screens)
6. Session persists using SecureStore

### Property Discovery
- **Map View**: Interactive map with property markers
  - Purple markers for vacant spaces
  - Blue markers for "opening soon" properties
  - Markers show property images and info in callouts
  - Properties loaded based on visible map bounds with buffer
- **List View**: Scrollable list of properties with images
- **Property Details**: 
  - Image carousel
  - Full property information
  - Actions based on property status (submit suggestions or view Instagram)

### State Management
- **AuthContext**: Manages authentication state with reducer pattern
  - Session management
  - Profile state
  - Onboarding status
- **AppContext**: Manages app-level state
  - Map region
  - Properties list

### Data Flow
1. User opens app → RootNavigator checks auth state
2. If not authenticated → AuthStack (phone → OTP → profile → onboarding)
3. If authenticated → AppStack (Home screen loads)
4. Home screen → Fetches properties based on map bounds
5. Property selection → Navigate to PropertyDetailsScreen

## Environment Variables
Required environment variables (stored in `.env` or `eas.json`):
- `EXPO_PUBLIC_SUPABASE_URL` - Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `EXPO_PUBLIC_SUPABASE_PUBLIC_KEY` - Supabase public key

## Database Schema (Supabase)

### Tables
- `profiles` - User profile information
  - id, first_name, last_name, email, zip_code, gender, date_of_birth, email_subscription, role
- `properties` - Property listings
  - id, title, address_1, address_2, city, state, county, postal_code, latitude, longitude, status, site_status, description, owners_note, instagram_link, estimated_open
- `images` - Image metadata
  - id, bucket, path, width, height, mime, etc.
- `property_image_links` - Junction table linking properties to images
  - property_id, image_id, is_cover, order_index

## Key Configuration Files
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration with path aliases (`@/*` → `src/*`)
- `app.json` - Expo app configuration
- `eas.json` - EAS Build configuration
- `babel.config.js` - Babel configuration
- `metro.config.js` - Metro bundler configuration

## Platform Support
- iOS (native via Expo)
- Android (native via Expo)

## Navigation Flow

### Auth Stack
```
EnterPhoneNumber → OTP → CreateProfile1 → CreateProfile2 → 
Onboarding1 → Onboarding2 → Onboarding3 → Onboarding4 → App Stack
```

### App Stack
```
Home (Map/List) 
  ↓ (tap property)
PropertyDetails
  ↓ (vote button)
VotingStack: Category → SubCategory → AdditionalNote → [Submit]
  ↓ (settings)
SettingsMain → Profile | ContactUs | VoteHistory
```

## Styling Approach
- Centralized theme in `/src/assets/theme/`
- Theme includes colors and text styles
- Components use theme for consistent styling
- StyleSheet.create for component styles

## Image Handling
- Images stored in Supabase Storage
- Public URLs constructed using `buildImageURL()`
- Signed URLs generated for private images
- ImageWithLoader component handles loading states
- Fallback images for missing property images

## Voting Flow
- **Category Screen**: Users select a main category
- **Subcategory Screen**: Users select a specific subcategory
- **Additional Notes**: Optional note field with character limit
- **State Management**: Uses VotingContext to maintain selections across screens

## Future Considerations
- Voting submission and API integration
- Search functionality implementation (search bar exists but not fully implemented)
- Instagram link integration (currently commented out)
- Country code handling for phone numbers (currently hardcoded to "+1")

