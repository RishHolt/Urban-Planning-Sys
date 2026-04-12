# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Start Development Server
```bash
composer dev
# Runs concurrently: PHP server, queue listener, and Vite dev server
```

### Frontend Only
```bash
npm run dev       # Vite dev server
npm run build     # Production build
npm run lint      # ESLint with auto-fix
npm run format    # Prettier format
npm run types     # TypeScript type check (no emit)
```

### Backend
```bash
php artisan serve
php artisan migrate                    # Run all migrations
php artisan migrate --path=database/migrations/zcs_db   # Run specific DB migrations
composer test                          # Run all tests (clears config first)
php artisan test --filter TestName     # Run a single test
./vendor/bin/pint                      # PHP code style fixer
```

## Architecture Overview

This is a **Laravel 12 + Inertia.js + React 19 + TypeScript** application for urban planning management — a multi-department government system for zoning, housing, building permits, infrastructure, and subdivision applications.

### Multi-Database Architecture

The system uses **6 separate MySQL databases**, one per department, configured in `config/database.php`:

| Connection | Database | Department |
|------------|----------|------------|
| `user_db` | user_db | Users, Roles, Auth |
| `zcs_db` | zcs_db | Zoning Clearance Section |
| `hbr_db` | hbr_db | Housing Beneficiary Registry |
| `sbr_db` | sbr_db | Subdivision & Building Review |
| `omt_db` | omt_db | Operations & Maintenance |
| `ipc_db` | ipc_db | Infrastructure Projects |

Migrations are organized under `database/migrations/{db_name}/`. Models declare their connection via `protected $connection = 'zcs_db'` etc.

In tests, `phpunit.xml` only configures `sqlite` in-memory for `user_db` and `zcs_db` — other DB connections will need manual test setup.

### Roles & Access

Users have a `role` field: `user`, `staff`, `admin`, `superadmin`. Staff/admin also have a `department` field (`ZCS`, `SBR`, `HBR`, `OMT`, `IPC`). The `RedirectByRole` middleware routes users to `/admin` or `/user` home after login. Authorization is enforced via Laravel Policies in `app/Policies/`.

### Frontend Structure

- **Pages** (`resources/js/pages/`): Inertia page components — `Admin/`, `Housing/`, `Applications/`, `User/`
- **Components** (`resources/js/components/`): Shared UI — `AdminLayout.tsx`, `Sidebar.tsx`, `MapComponent.tsx`, `StatusBadge.tsx`, etc.
- **Types** (`resources/js/types/index.d.ts`): Shared TypeScript interfaces for `User`, `Profile`, `SharedData`, etc.
- **Hooks** (`resources/js/hooks/`): Custom React hooks

Route helpers use **Laravel Wayfinder** — import typed route functions from `@/routes` (auto-generated from Laravel routes). Inertia `SharedData` (defined in `types/index.d.ts`) is available in all pages via `usePage().props`.

### Key Backend Patterns

- **Controllers** split between `app/Http/Controllers/` (user-facing) and `app/Http/Controllers/Admin/` (admin-facing)
- **Services** (`app/Services/`) handle business logic — eligibility checks, fee assessment, allocation, notifications, etc.
- **DTOs** (`app/DataTransferObjects/`) — `EligibilityResult`, `ValidationResult`, `DuplicateResult`
- **Resources** (`app/Http/Resources/`) — API response shaping
- **Real-time**: Laravel Echo + Pusher for live notifications (`resources/js/lib/echo.ts`)
- **Maps**: Leaflet + react-leaflet with Turf.js for geospatial operations
- **AI**: TensorFlow.js bundled separately as `tensorflow` chunk for lazy loading
- **PDF export**: `barryvdh/laravel-dompdf`
- **Auth**: Email/password with OTP verification + Google OAuth via Laravel Socialite

### Module Access Control

`app/Models/Module.php` and `Role.php` implement a fine-grained module-based permission system (beyond simple roles). `AdminModuleAccessController` manages which modules each role can access.
