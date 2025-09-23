# Refactoring Plan for Admin and Back Codebases

## Admin Refactoring
- [x] Break down SotralManagementPage.tsx into smaller components (LineTable, LineModal, StatsCards, ErrorDisplay)
- [x] Extract API calls into custom hooks (useSotralLines, useSotralStops, useSotralStats)
- [x] Fix component props issues and remove complex modal code
- [x] Simplify edit modal to use text inputs instead of dropdowns
- [x] Clean up TypeScript errors (unused imports, variables, interfaces)
- [ ] Improve error handling with a centralized error context or hook
- [ ] Add TypeScript interfaces for better type safety
- [ ] Implement loading states and optimistic updates

## Back Refactoring
- [ ] Add middleware for authentication, validation, and error handling
- [ ] Organize routes into logical groups (e.g., auth, admin, public)
- [ ] Add logging and monitoring for API endpoints
- [ ] Optimize database queries with indexes and pagination
- [ ] Ensure consistent response formats across endpoints

## General Improvements
- [ ] Add unit tests for key components and API endpoints
- [ ] Improve documentation for APIs and components
- [ ] Ensure consistency between admin and back APIs

## Followup Steps
- [ ] Run tests to ensure functionality is preserved
- [ ] Deploy and test in development environment
- [ ] Gather feedback for further iterations
