---
description: 
globs: *.tsx,*.ts,*.js
alwaysApply: false
---

You are an expert in TypeScript, React Native, Expo, and Mobile UI development.

Code Style and Structure

- Write concise, technical TypeScript code with accurate examples.
- Use functional and declarative programming patterns; avoid classes.
- Prefer iteration and modularization over code duplication.
- Use descriptive variable names with auxiliary verbs (e.g., isLoading, hasError).
- Structure files: exported component, subcomponents, helpers, static content, types.
- Follow Expo's official documentation for setting up and configuring your projects: https://docs.expo.dev/

Naming Conventions

- Use lowercase with dashes for directories (e.g., components/auth-wizard).
- Favor named exports for components.

TypeScript Usage

- Use TypeScript for all code; prefer types over interfaces.
- Avoid enums; use maps instead.
- Use functional components with TypeScript types.
- Use strict mode in TypeScript for better type safety.

Syntax and Formatting

- Use the "function" keyword for pure functions.
- Avoid unnecessary curly braces in conditionals; use concise syntax for simple statements.
- Use declarative JSX.
- Use Prettier for consistent code formatting.

UI and Styling

- Use Expo's built-in components for common UI patterns and layouts.
- Implement responsive design with Flexbox and Expo's useWindowDimensions for screen size adjustments.
- Use styled-components for component styling.
<!-- - Implement dark mode support using Expo's useColorScheme. -->
- Ensure high accessibility (a11y) standards using ARIA roles and native accessibility props.
- Leverage react-native-reanimated and react-native-gesture-handler for performant animations and gestures.

Safe Area Management

- Use SafeAreaProvider from react-native-safe-area-context to manage safe areas globally in your app.
- Wrap top-level components with SafeAreaView to handle notches, status bars, and other screen insets on both iOS and Android.
- Use SafeAreaScrollView for scrollable content to ensure it respects safe area boundaries.
- Avoid hardcoding padding or margins for safe areas; rely on SafeAreaView and context hooks.

Performance Optimization

- Minimize the use of useState and useEffect; prefer context and reducers for state management.
- Use zustand for global state management with local storage async; sometimes with encryption.
- Use Expo's AppLoading and SplashScreen for optimized app startup experience.
- Optimize images: use WebP format where supported, include size data, implement lazy loading with expo-image.
- Implement code splitting and lazy loading for non-critical components with React's Suspense and dynamic imports.
- Profile and monitor performance using React Native's built-in tools and Expo's debugging features.
- Avoid unnecessary re-renders by memoizing components and using useMemo and useCallback hooks appropriately.

Navigation

- Use expo navigation/react-navigation for routing and navigation; follow its best practices for stack, tab, and drawer navigators.
- Leverage deep linking and universal links for better user engagement and navigation flow.
- Use dynamic routes with expo-router for better navigation handling.

State Management

- Use Zustand and React Context for managing global state.
- Leverage tanstack-query or react-query for data fetching and caching; avoid excessive API calls.
- For complex state management, consider using Zustand.
- Handle URL search parameters using libraries like expo-linking.

Error Handling and Validation

- Use Zod for runtime validation and error handling.
- Implement proper error logging using Sentry or a similar service.
- Prioritize error handling and edge cases:
  - Handle errors at the beginning of functions.
  - Use early returns for error conditions to avoid deeply nested if statements.
  - Avoid unnecessary else statements; use if-return pattern instead.
  - Implement global error boundaries to catch and handle unexpected errors.
- Use expo-error-reporter for logging and reporting errors in production.

Testing

- Write unit tests using Jest and React Native Testing Library.
- Implement integration tests for critical user flows using Detox.
- Use Expo's testing tools for running tests in different environments.
- Consider snapshot testing for components to ensure UI consistency.

Security

- Sanitize user inputs to prevent XSS attacks.
- Use react-native-encrypted-storage for secure storage of sensitive data.
- Ensure secure communication with APIs using HTTPS and proper authentication.
- Use Expo's Security guidelines to protect your app: https://docs.expo.dev/guides/security/

Internationalization (i18n)

- Use react-native-i18n or expo-localization for internationalization and localization.
- Support multiple languages and RTL layouts.
- Ensure text scaling and font adjustments for accessibility.

Key Conventions

1. Rely on Expo's managed workflow for streamlined development and deployment.
2. Prioritize Mobile Web Vitals (Load Time, Jank, and Responsiveness).
3. Use expo-constants for managing environment variables and configuration.
4. Use expo-permissions to handle device permissions gracefully.
5. Implement expo-updates for over-the-air (OTA) updates.
6. Follow Expo's best practices for app deployment and publishing: https://docs.expo.dev/distribution/introduction/
7. Ensure compatibility with iOS and Android by testing extensively on both platforms.

API Documentation

- Use Expo's official documentation for setting up and configuring your projects: https://docs.expo.dev/

Refer to Expo's documentation for detailed information on Views, Blueprints, and Extensions for best practices.

## Database Schema Reference

### Supabase Schema v9

This project uses Supabase as the backend database. All backend/API/SDK integrations MUST reference the following schema file:

**Schema File:** `lib/schema/v9.sql`

### Key Database Tables and Relationships

#### Core User Tables
- **users**: Base user table with authentication data
- **admins**: Admin users with roles (super_admin, admin, manager, analyst, support, content_moderator)
- **shoppers**: Consumer users with KYC verification
- **brands**: Brand/business users with GST verification and approval workflow

#### Product and Campaign Management
- **product_categories**: Categories for products (Electronics, Fashion, Beauty, etc.)
- **platforms**: Marketplace platforms (Amazon, Flipkart, Myntra, etc.)
- **products**: Brand products with pricing, images, and platform links
- **campaigns**: Marketing campaigns with rebate percentages and enrollment limits
- **deliverables**: Required deliverables for campaigns (reviews, social posts, etc.)
- **campaign_deliverables**: Junction table linking campaigns to required deliverables

#### Enrollment and Transaction Flow
- **enrollments**: Shopper enrollments in campaigns with order tracking
- **deliverable_submissions**: Proof submissions for campaign deliverables
- **invoices**: Brand invoices with GST and TDS calculations
- **invoice_items**: Line items for invoices
- **payments**: Payment tracking via Razorpay
- **payouts**: Shopper payouts with status tracking

#### Supporting Tables
- **coupons**: Discount coupons with usage limits
- **coupon_redemptions**: Coupon usage tracking
- **notifications**: In-app notifications
- **notification_preferences**: User notification settings
- **payout_methods**: Shopper payout method details

### Important Schema Features

#### Enums
- `approval_status`: pending, approved, rejected
- `campaign_status`: draft, active, completed, expired, cancelled
- `enrollment_status`: pending, submitted, approved, rejected, invoiced, paid, withdrawn, expired
- `invoice_status`: draft, sent, viewed, overdue, partially_paid, paid, void
- `payment_status`: pending, completed, failed, refunded
- `payout_status`: queued, processing, completed, failed, cancelled

#### Business Rules
- Brands must be GST verified and approved before creating campaigns
- Status transitions are validated with specific business logic
- Row Level Security (RLS) policies enforce data access controls
- Automatic invoice numbering with sequence (HD000001, HD000002, etc.)

#### Storage Buckets
- `brand-logos`: Public brand logo storage
- `product-images`: Public product image storage
- `deliverables`: Private deliverable file storage
- `purchase-proofs`: Private purchase proof storage
- `profile-pictures`: Public profile picture storage

### Integration Guidelines

1. **Always use the latest schema version** (`lib/schema/v9.sql`)
2. **Follow RLS policies** for data access and security
3. **Respect enum constraints** and status transition rules
4. **Use proper TypeScript types** generated from the schema
5. **Handle file uploads** through designated storage buckets
6. **Implement proper error handling** for business rule violations

### Schema Updates

When updating the schema:
1. Create a new version file (e.g., `v10.sql`)
2. Update this documentation
3. Regenerate TypeScript types
4. Update service layer implementations
5. Test all affected functionality
