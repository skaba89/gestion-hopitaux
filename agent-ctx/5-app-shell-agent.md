# Task 5 - Application Shell Agent

## Task
Create the application shell for HealthFlow Guinea - a hospital information system with client-side navigation between landing page and app view.

## Completed Work

### Files Created
1. `/src/hooks/use-mobile.ts` - useIsMobile hook for shadcn/ui Sidebar
2. `/src/lib/store.ts` - Zustand navigation store (currentView, sidebarOpen, user, actions)
3. `/src/components/app/app-shell.tsx` - Full app shell with Sidebar (AppSidebar) + Header (TopHeader) + Content area
4. `/src/components/app/modules/placeholder.tsx` - Reusable PlaceholderPage component
5. 15 module files in `/src/components/app/modules/` (dashboard, patients, appointments, consultations, laboratory, pharmacy, hospitalization, emergencies, maternity, vaccination, billing, teleconsultation, analytics, administration, settings)

### Files Modified
6. `/src/app/page.tsx` - Uses Zustand store for conditional rendering (landing vs app shell)
7. `/src/components/landing/landing-page.tsx` - CTA buttons now navigate to dashboard view via store

### Key Architecture
- Client-side navigation via Zustand store (no URL routing)
- Landing page CTA buttons → setCurrentView('dashboard') → shows AppShell
- AppShell: SidebarProvider + AppSidebar + SidebarInset
- Sidebar: 4 nav groups (Principal, Médical, Gestion, Système) with 15 items
- Header: SidebarTrigger, title, search, notifications(3), theme toggle, user dropdown
- Déconnexion → setCurrentView('landing') → back to landing page
- Teal/emerald color scheme consistent with landing page

### Lint Status
✅ `bun run lint` passes with zero errors
