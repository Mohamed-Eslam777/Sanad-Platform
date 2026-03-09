# Phase 2: Homepage Refactor & Dashboard Modularization

## 🎯 Objective

Dismantle the monolithic `HomePage.jsx` (currently **357 lines**, containing 4 separate components mixed together) into a clean, scalable feature-based architecture. Each role-specific dashboard will live in its own file under `src/features/dashboard/`, the sidebar navigation will become a shared layout component, and the landing page will become its own route-level page. Every UI element will be rebuilt using the Phase 1 glassmorphism design system — no primitive `bg-white`, `bg-gray-50`, or hardcoded hex colors will remain.

### Current Monolith Breakdown (what lives inside `HomePage.jsx` today)

| Component (lines) | Responsibility | Destination |
|---|---|---|
| `LandingPage` (L19–L33) | Guest welcome screen with register/login CTAs | → `src/pages/LandingPage.jsx` |
| `BeneficiaryDashboard` (L38–L135) | Request list, stats, SOS, create-request modal | → `src/features/dashboard/BeneficiaryDashboard.jsx` |
| `VolunteerDashboard` (L140–L292) | Profile card, tabs (nearby/accepted), accept flow | → `src/features/dashboard/VolunteerDashboard.jsx` |
| `HomePage` (L297–L357) | Sidebar nav, mobile toggle, role-based switch | → `src/pages/HomePage.jsx` (slim orchestrator) + `src/components/layout/Sidebar.jsx` |

---

## 📁 Files to Modify / Create

### New Files to Create

| File | Purpose |
|---|---|
| `src/features/dashboard/BeneficiaryDashboard.jsx` | Extracted beneficiary dashboard with Phase 1 components |
| `src/features/dashboard/VolunteerDashboard.jsx` | Extracted volunteer dashboard with Phase 1 components |
| `src/features/dashboard/components/RequestCard.jsx` | Shared request list-item card (used in both dashboards) |
| `src/features/dashboard/components/DashboardTabs.jsx` | Glassmorphism tab switcher (volunteer nearby/accepted) |
| `src/components/layout/Sidebar.jsx` | Extracted sidebar navigation — shared app shell |
| `src/pages/LandingPage.jsx` | Extracted guest landing page with premium styling |

### Files to Modify

| File | Changes |
|---|---|
| `src/pages/HomePage.jsx` | Strip to ~30 lines — import dashboards, render by role inside layout |
| `src/App.jsx` | Add `/landing` route for the new `LandingPage`, adjust root route logic |

---

## 🛠️ Step-by-Step Implementation Plan

### Step 1: Create Feature Folder Structure

Create the following directory tree:

```
src/
├── features/
│   └── dashboard/
│       ├── BeneficiaryDashboard.jsx
│       ├── VolunteerDashboard.jsx
│       └── components/
│           ├── RequestCard.jsx
│           └── DashboardTabs.jsx
├── components/
│   └── layout/
│       └── Sidebar.jsx
└── pages/
    ├── LandingPage.jsx   (NEW)
    └── HomePage.jsx      (refactored to orchestrator)
```

---

### Step 2: Extract & Restyle the Sidebar (`Sidebar.jsx`)

**Source:** `HomePage.jsx` lines 311–341 (the `<aside>` block).

**Current problems:**

- Uses primitive `bg-white`, `border-gray-100`, hardcoded `bg-[#1D4ED8]` for logo.
- `mr-0 md:mr-64` uses physical margin — RTL-unsafe.
- Mobile toggle button at lines 306–309 uses `bg-white` and hardcoded colors.
- Active nav link is hardcoded to `bg-blue-50 text-blue-700`.

**New implementation spec:**

- **Glass sidebar:** Use `glass-heavy` class for the sidebar background (frosted dark panel).
- **Logo section:** Import `logo.png` from assets. Display with subtle `shadow-glow-sm`.
- **Navigation links:** Use `bg-royal-600/15 text-royal-400` for active state, `text-gray-400 hover:bg-glass-light hover:text-white` for inactive. Use `me-3` not `mr-3` for icon spacing.
- **User email section:** Style with `text-gray-500` on the dark theme.
- **Logout button:** `text-danger-400 hover:bg-danger-500/10`.
- **Mobile toggle:** Glass button with `glass` class, positioned `fixed top-4 end-4` (RTL-safe).
- **Mobile overlay:** `bg-black/60 backdrop-blur-md` (matches Modal backdrop).
- **Sidebar position:** Use `end-0` instead of `right-0`, and `translate-x-full` logic should use logical direction.
- **Props:** Accept `user`, `onLogout`, and `currentPath` (to highlight active link).
- **Framer Motion:** Wrap nav links in `motion.div` with `whileHover={{ x: -4 }}` for a subtle slide effect.

---

### Step 3: Extract & Restyle the Landing Page (`LandingPage.jsx`)

**Source:** `HomePage.jsx` lines 19–33.

**Current problems:**

- Uses `bg-gray-50`, `text-gray-900`, `bg-blue-50/50` — all light-theme primitives.
- CTA buttons use hardcoded `bg-[#1D4ED8]` and `bg-white`.

**New implementation spec:**

- **Background:** Transparent (inherits `AnimatedBackground` orbs from `App.jsx`).
- **Hero headline:** Use `text-gradient-royal` for "سَنَد" text or part of the heading.
- **Subheading:** `text-gray-400` (readable on dark bg).
- **Shield icon container:** `glass` card with `glow-border-sm`.
- **CTA buttons:** Use Phase 1 `Button` component — primary variant for "سجل معنا الآن", outline variant for "تسجيل الدخول".
- **Logo:** Import and display `logo.png` above the heading instead of the Shield icon.
- **Framer Motion:** `motion.div` with `fadeInUp` stagger on headline → subtitle → buttons (staggerChildren: 0.15).
- **Route:** This page will be rendered at `/` when user is NOT logged in (handled via the `HomePage.jsx` orchestrator redirect or directly in `App.jsx`).

---

### Step 4: Build the Beneficiary Dashboard (`BeneficiaryDashboard.jsx`)

**Source:** `HomePage.jsx` lines 38–135.

**Current problems:**

- Loading state uses a raw `<Loader2>` spinner — no skeleton.
- Empty state is a plain string in a `bg-gray-50 rounded-xl` div.
- Request list items are raw `<div>`s with inline Tailwind — not using `Card`.
- Cancel confirmation uses `window.confirm()` — ugly native dialog.
- Error handling uses `alert()`.
- `bg-white`, `text-gray-800`, `text-gray-900` — all light-theme.
- `mr-` and `ml-` used in various places.

**New implementation spec:**

1. **Header section:**
   - Greeting: `text-white` instead of `text-gray-900`. Subtitle: `text-gray-400`.
   - "طلب مساعدة جديد" button: Use Phase 1 `Button` with `variant="primary"`.

2. **Stats row:**
   - Use Phase 1 `StatCard` with updated dark-theme colors:
     - Pending: `color="text-warning-400"` `bg="bg-warning-500/15"`
     - In progress: `color="text-royal-400"` `bg="bg-royal-600/15"`
     - Completed: `color="text-success-400"` `bg="bg-success-500/15"`

3. **Request list — Loading state:**
   - Replace `<Loader2>` spinner with 3× `<Skeleton variant="card" height="80px" />` stacked vertically.

4. **Request list — Empty state:**
   - Replace inline string with `<EmptyState icon={Inbox} title="لا توجد طلبات سابقة" subtitle="ابدأ بإضافة طلب جديد!" action={<Button onClick={...}>طلب مساعدة جديد</Button>} />`.

5. **Request list — Data rows:**
   - Extract each row into the shared `<RequestCard>` component (see Step 6).
   - Wrap the list in `motion.div` with staggered children (`staggerChildren: 0.06`).

6. **Request list container:**
   - Replace `bg-white rounded-2xl p-6 shadow-soft border border-gray-100` with `<Card variant="glass" padding="p-6">`.

7. **Cancel flow:**
   - Replace `window.confirm()` with a small inline state toggle or use the Phase 1 `Modal` for confirmation.
   - Replace `alert(err...)` with a toast-style error message (can emit via context or local state).

8. **SOS Button:** Keep `<SOSButton />` as-is (will be restyled in a future phase).

---

### Step 5: Build the Volunteer Dashboard (`VolunteerDashboard.jsx`)

**Source:** `HomePage.jsx` lines 140–292.

**Current problems:**

- Profile card is a hardcoded `<div className="bg-white ...">` with a manual avatar circle.
- Stats use light-theme `bg-blue-50`, `bg-amber-50`, `bg-green-50`.
- Tab switcher uses `bg-gray-100 p-1 rounded-xl` — light theme, no glass.
- Request cards are raw divs with `bg-white`, `border-gray-100`.
- Loading/empty states same issues as beneficiary.
- `bg-white`, `text-gray-800` throughout.

**New implementation spec:**

1. **Profile card:**
   - Use `<Card variant="glow">` wrapper.
   - Replace manual avatar circle with `<Avatar name={user?.name} size="lg" ring status="online" />`.
   - "هوية موثقة" badge: `text-success-400` with a `CheckCircle` icon.
   - Name: `text-white font-bold`.

2. **Stats row:**
   - Use Phase 1 `StatCard` with dark-theme colors:
     - Active tasks: `color="text-royal-400"` `bg="bg-royal-600/15"`
     - Rating: `color="text-warning-400"` `bg="bg-warning-500/15"`
     - Completed: `color="text-success-400"` `bg="bg-success-500/15"`

3. **Tab switcher:**
   - Extract into `<DashboardTabs>` component (see Step 7).
   - Glass background: `bg-glass-light rounded-xl p-1`.
   - Active tab: `glass-medium text-royal-400 shadow-glow-sm`.
   - Inactive tab: `text-gray-500 hover:text-white`.
   - Count badges: `bg-royal-600/20 text-royal-400` for active, `bg-glass-light text-gray-400` for inactive.

4. **Nearby requests — Loading state:**
   - Replace spinner with 3× `<Skeleton variant="card" height="90px" />`.

5. **Nearby requests — Empty state:**
   - Use `<EmptyState icon={MapPinOff} title="لا توجد طلبات متاحة" subtitle="لا توجد طلبات بالقرب منك حالياً." action={<Button variant="outline" onClick={fetchNearby}>تحديث القائمة</Button>} />`.

6. **Nearby request cards:**
   - Use the shared `<RequestCard>` component.
   - Action buttons: `<Button variant="outline" size="sm">التفاصيل</Button>` + `<Button size="sm" loading={processingId === req.id}>قبول</Button>`.

7. **Accepted requests:** Same pattern — `Skeleton` for loading, `EmptyState` for empty, `RequestCard` for rows.

8. **Accept error handling:** Replace `alert(...)` with local error state or toast emission.

---

### Step 6: Create Shared `RequestCard.jsx`

Both dashboards render request list items with very similar markup. Extract into a shared component:

**Props:**

- `request` — the request object
- `variant` — `'beneficiary'` | `'volunteer'` (subtle layout differences)
- `actions` — ReactNode slot for action buttons (details link, accept, cancel)
- `showBeneficiary` — boolean, shows beneficiary name (for volunteer's accepted tab)

**Styling:**

- Wrapper: `<Card variant="glass" padding="p-5">` with `motion.div` `whileHover={{ y: -2 }}`.
- Type emoji in a `bg-royal-600/10 rounded-xl` icon box.
- Description: `text-white font-bold`.
- Location: `text-gray-400` with `MapPin` icon.
- Date: `text-gray-500`.
- Uses `StatusBadge` and `Avatar` where applicable.
- Staggered entrance via parent `staggerChildren`.

---

### Step 7: Create `DashboardTabs.jsx`

Reusable glassmorphism tab component used in the Volunteer Dashboard.

**Props:**

- `tabs` — array of `{ key, label, count }`.
- `activeTab` — current selected key.
- `onTabChange` — callback `(key) => void`.

**Styling:**

- Container: `glass rounded-xl p-1 w-fit`.
- Tab button: `motion.button` with `whileTap={{ scale: 0.97 }}`.
- Active state: `glass-medium text-royal-400 shadow-sm rounded-lg font-bold`.
- Inactive state: `text-gray-500 hover:text-gray-300 rounded-lg`.
- Count badge: `rounded-full px-1.5 py-0.5 text-[10px] font-bold`.
- Framer Motion `layoutId` on the active indicator for smooth sliding transition.

---

### Step 8: Refactor `HomePage.jsx` into Slim Orchestrator

**Target:** Reduce from 357 lines to ~50 lines.

```
HomePage.jsx responsibilities (after refactor):
  1. Check auth state → if not logged in, render <LandingPage />
  2. If logged in, render <Sidebar> + <main> layout shell
  3. Inside <main>, switch on user.role:
     - 'volunteer'   → <VolunteerDashboard />
     - 'beneficiary' → <BeneficiaryDashboard />
  4. Wrap main content in motion.div for page transition
```

**Layout structure:**

```jsx
<div dir="rtl" className="min-h-screen flex">
  <Sidebar user={user} onLogout={logout} currentPath="/" />
  <main className="flex-1 ms-0 md:ms-64 p-4 md:p-8 pt-20 md:pt-8">
    <motion.div initial/animate/exit ...>
      {user?.role === 'volunteer'
        ? <VolunteerDashboard user={user} />
        : <BeneficiaryDashboard user={user} />}
    </motion.div>
  </main>
</div>
```

Note: use `ms-0 md:ms-64` instead of the current `mr-0 md:mr-64` for RTL safety.

---

### Step 9: Framer Motion Page Transitions

Apply `motion.div` wrappers for smooth dashboard transitions:

**Dashboard entrance animation:**

```jsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4, ease: 'easeOut' }}
>
  {/* dashboard content */}
</motion.div>
```

**Staggered list animation for request cards:**

```jsx
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

<motion.div variants={containerVariants} initial="hidden" animate="visible">
  {requests.map(req => (
    <motion.div key={req.id} variants={itemVariants}>
      <RequestCard ... />
    </motion.div>
  ))}
</motion.div>
```

---

## ✅ Acceptance Criteria

### Architecture

- [ ] `HomePage.jsx` is reduced to ~50 lines and acts purely as an orchestrator (auth check + role switch + layout shell).
- [ ] `BeneficiaryDashboard` and `VolunteerDashboard` live in isolated files under `src/features/dashboard/`.
- [ ] `Sidebar` is a standalone layout component in `src/components/layout/`.
- [ ] `LandingPage` is a standalone page in `src/pages/`.
- [ ] Shared `RequestCard` and `DashboardTabs` sub-components exist in `src/features/dashboard/components/`.

### Phase 1 Integration

- [ ] All dashboards use `Card` (glass variant) instead of raw `bg-white` divs.
- [ ] All dashboards use `StatCard` with dark-theme color tokens.
- [ ] `Skeleton` loaders replace all `<Loader2>` spinner loading states.
- [ ] `EmptyState` replaces all inline "no data" strings.
- [ ] `Avatar` replaces all manual initial-circle divs.
- [ ] `StatusBadge` is used for all status displays.
- [ ] `Button` replaces all raw `<button>` and `<Link>` action elements.

### Styling & RTL

- [ ] Zero instances of `bg-white`, `bg-gray-50`, `text-gray-900`, or other light-theme primitives.
- [ ] Zero instances of `mr-`, `ml-`, `pr-`, `pl-` — all replaced with `ms-`, `me-`, `ps-`, `pe-`.
- [ ] Zero hardcoded hex colors (no `#1D4ED8`, etc.) — all using Tailwind token classes.

### UX Polish

- [ ] `window.confirm()` and `alert()` are eliminated from all dashboard code.
- [ ] Framer Motion page entrance animation on dashboard mount.
- [ ] Framer Motion staggered list animation on request card lists.
- [ ] Tab switching in Volunteer Dashboard has smooth `layoutId` indicator transition.

### Non-Breaking

- [ ] All existing routes (`/`, `/profile`, `/requests/:id`, `/admin`) continue to work.
- [ ] `requestService` API calls are unchanged — only the UI consumption layer is refactored.
- [ ] `SOSButton` integration is preserved in the Beneficiary Dashboard.
- [ ] `CreateRequestModal` integration is preserved in the Beneficiary Dashboard.
