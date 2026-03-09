# Phase 3: Auth & Inner Pages Premium Refactor

## 🎯 Objective

Upgrade every remaining page and modal in the application to the Phase 1 ultra-premium glassmorphism design system. Currently, all auth pages (Login, Register, ForgotPassword, ResetPassword) and inner pages (ProfilePage, RequestDetailsPage, AdminDashboard) still use a **light theme** (`bg-gray-50`, `bg-white`, `text-gray-900`) and primitive HTML elements (raw `<input>`, `<textarea>`, `<select>`), creating a jarring visual disconnect with the new dark glassmorphism dashboard.

After this phase, **every** screen in the app will share the same premium dark aesthetic, Framer Motion transitions, and Phase 1 component library — zero visual inconsistencies.

---

## 📁 Files to Modify

### Auth Pages

| File | Lines | Key Problems |
| --- | --- | --- |
| `src/pages/LoginPage.jsx` | 108 | `bg-gray-50` body, hardcoded `bg-[#1D4ED8]` logo square, raw `<input>` for password (not using `InputField`), `text-gray-900` heading, error banner uses `bg-red-50 text-red-700`, link uses `text-[#1D4ED8]` |
| `src/pages/RegisterPage.jsx` | 122 | Same light theme, `bg-blue-50` banner, raw role toggle with `bg-gray-50 p-1`, raw `<input>` for password, hardcoded hex links |
| `src/pages/ForgotPasswordPage.jsx` | 88 | `bg-gray-50` body, `bg-indigo-50` icon box, light error/success banners, `text-gray-900` headings |
| `src/pages/ResetPasswordPage.jsx` | 160 | `bg-gray-50` body, raw `<input>` for both password fields, `bg-blue-50` icon, `bg-[#1D4ED8]` link button, light success/error banners |

### Inner Pages

| File | Lines | Key Problems |
| --- | --- | --- |
| `src/pages/ProfilePage.jsx` | 216 | `bg-gray-50 py-10` body, spinner-only loading, light error/success banners (`bg-red-50`, `bg-green-50`), `Card` without variant, raw `<textarea>` fields, `text-gray-800` section headers, `border-gray-100` dividers, `ml-1` on labels |
| `src/pages/RequestDetailsPage.jsx` | 251 | `bg-gray-50` body, dark-navy `bg-white` sticky header, `Loader2` spinner loading, `window.confirm()` + `alert()` on complete action, raw avatar circles, `mr-auto` (RTL-unsafe), light-theme TYPE_META backgrounds, hardcoded `bg-[#1D4ED8]` chat button |
| `src/pages/AdminDashboard.jsx` | 590 | Inline `Toast` component (should use Phase 1 Toast), `bg-[#f8fafc]` body, custom sidebar (should use adapted Sidebar or standalone admin sidebar), `bg-white` cards everywhere, raw `<input>`, `<select>` for filters, `Loader2` spinners, inline empty states, `mr-0 md:mr-[260px]` (RTL-unsafe), light-theme stat cards, `bg-gray-50` table header, `bg-white` table body |

### Modals

| File | Lines | Key Problems |
| --- | --- | --- |
| `src/components/CreateRequestModal.jsx` | 157 | Custom modal shell (doesn't use Phase 1 `Modal`), raw `<input>`/`<textarea>`/`<select>` for form fields, light-theme `inputClass`, custom `Alert` component |
| `src/components/ChatModal.jsx` | 347 | Custom modal shell, `bg-white` chat body, light-theme bubble colors, raw `<input>` for message field. **Note:** This is a complex real-time component — restyle only, do NOT touch Socket.io logic |

---

## 🛠️ Step-by-Step Implementation Plan

### Step 1: Auth Pages Revamp (Login, Register, Forgot Password, Reset Password)

All four auth pages share the same structural pattern. Apply a **consistent auth template**:

#### Shared Auth Layout Pattern

```jsx
<div dir="rtl" className="min-h-screen flex items-center justify-center p-4">
  <motion.div initial/animate stagger ...>
    {/* Logo + glass container */}
    <div className="glass glow-border-sm p-4 rounded-2xl mb-6 mx-auto w-fit">
      <img src={logo} alt="سَنَد" className="w-12 h-12" />
    </div>
    {/* Heading */}
    <h1 className="text-white ...">...</h1>
    <p className="text-gray-400 ...">...</p>
    {/* Form in glass card */}
    <Card variant="glass" padding="p-8">
      {/* InputField components, Buttons, etc. */}
    </Card>
  </motion.div>
</div>
```

#### `LoginPage.jsx` — Specific Changes

- **Remove** `bg-gray-50` wrapper → transparent (inherits animated orbs).
- **Replace** `bg-[#1D4ED8]` logo square → import `logo.png`, wrap in `glass glow-border-sm` container.
- **Replace** `text-gray-900` heading → `text-white`.
- **Replace** `text-gray-500` subtitle → `text-gray-400`.
- **Card** → `<Card variant="glass" padding="p-8">`.
- **Error banner** → replace `bg-red-50 border-red-200 text-red-700` with `bg-danger-500/10 border border-danger-500/30 text-danger-400`.
- **Password field** → replace raw `<input>` + manual label with `<InputField>` component with a `type="password"` toggle prop or an `endIcon` prop for the eye toggle.
  - **Note:** The Phase 1 `InputField` doesn't natively support password toggle. Two options:
    1. Add an `endAdornment` slot to `InputField` for the eye button.
    2. OR keep a minimal custom wrapper around `InputField` for the password toggle.
  - **Recommended:** Option 1 — Add an `endAdornment` prop to `InputField.jsx` that renders a button at the `end` (left in RTL) of the input. This is a small, non-breaking addition.
- **Forgot password link** → `text-royal-400 hover:text-royal-300`.
- **"Create account" link** → `text-royal-400 font-bold hover:text-royal-300`.
- **Submit button** → Already uses `<Button>` — just ensure `loading` prop is used.
- **Framer Motion** → Wrap entire card area in `motion.div` with `fadeInUp` entrance.

#### `RegisterPage.jsx` — Specific Changes

- Same dark theme conversion as Login.
- **Banner** → Replace `bg-blue-50 rounded-3xl` with `glass rounded-3xl` and place `logo.png` inside.
- **Role toggle** → Replace `bg-gray-50 p-1 border border-gray-200/60` with `glass rounded-xl p-1`. Active button: `glass-medium text-royal-400 shadow-sm`. Inactive: `text-gray-500 hover:text-gray-300`.
- **Password field** → Same `InputField` + endAdornment pattern as Login.
- **Link text** → `text-royal-400`.
- **Terms text** → `text-gray-500`.

#### `ForgotPasswordPage.jsx` — Specific Changes

- Same dark theme conversion.
- **Icon box** → `glass glow-border-sm` instead of `bg-indigo-50 border-indigo-100`.
- **Success state** → Replace `bg-green-50 border-green-100` circle with `glass` circle, `CheckCircle` icon → `text-success-400`, heading → `text-white`.
- **"Send again" button** → `text-royal-400 hover:text-royal-300`.
- **Back to login link** → `text-gray-500 hover:text-white`.

#### `ResetPasswordPage.jsx` — Specific Changes

- Same dark theme conversion.
- **Both password fields** → Use `InputField` with `endAdornment` for eye toggle.
- **Password strength bar** → Replace `bg-gray-200` track with `bg-glass-light`, keep red → amber → green gradient colors.
- **Mismatch error** → `text-danger-400`.
- **"Request new link" button** → Use Phase 1 `<Button variant="primary">` instead of raw `<Link>` with hardcoded `bg-[#1D4ED8]`.
- **Success state** → Glass circle with `text-success-400` icon.

---

### Step 2: Profile Page Refactor (`ProfilePage.jsx`)

**Source:** 216 lines. Needs full dark theme conversion + Skeleton loader + Sidebar integration.

#### Structural Change

- **Wrap in layout shell:** Currently a standalone page with no sidebar. Should be wrapped in the same Sidebar + main pattern as `HomePage.jsx`:

  ```jsx
  <div dir="rtl" className="min-h-screen flex">
    <Sidebar user={user} onLogout={logout} currentPath="/profile" />
    <main className="flex-1 ms-0 md:ms-64 p-4 md:p-8 pt-20 md:pt-8 w-full">
      {/* profile content */}
    </main>
  </div>
  ```

#### Specific Changes

- **Loading state** → Replace `Loader2` spinner with `<Skeleton variant="card" />` blocks (2–3 cards stacked).
- **Remove** `bg-gray-50 py-10` wrapper → transparent.
- **Heading** → `text-white` instead of `text-gray-900`.
- **Subtitle** → `text-gray-400` instead of `text-gray-500`.
- **Error banner** → `bg-danger-500/10 border-danger-500/30 text-danger-400`.
- **Success banner** → `bg-success-500/10 border-success-500/30 text-success-400`.
- **Card** → `<Card variant="glass" padding="p-8">`.
- **Section headers** → `text-white` instead of `text-gray-800`, `border-glass-border` instead of `border-gray-100`.
- **Add `Avatar` display** → Above the form, display `<Avatar name={formData.name} size="lg" ring />` in a centered position.
- **Raw `<textarea>` fields** → Style with glass input classes: `bg-glass-light border border-glass-border text-white rounded-xl px-4 py-3 text-sm focus:border-royal-400 focus:ring-2 focus:ring-royal-500/20 placeholder-gray-500`.
- **Labels** → Replace `text-gray-700 ml-1` with `text-gray-400 ms-1`.
- **Email disabled field caption** → `text-gray-500` instead of `text-gray-400`.
- **Save button border** → `border-glass-border` instead of `border-gray-100`.
- **Framer Motion** → `motion.div` fadeInUp entrance on the profile card.

---

### Step 3: Request Details Page Refactor (`RequestDetailsPage.jsx`)

**Source:** 251 lines. Complex two-column layout with conditional sections.

#### Specific Changes

- **Remove** `bg-gray-50` body → transparent.
- **Loading state** → Replace full-page `Loader2` spinner with Skeleton layout:

  ```jsx
  <Skeleton variant="card" height="200px" className="mb-6" />
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <div className="lg:col-span-2"><Skeleton variant="card" height="250px" /></div>
    <Skeleton variant="card" height="200px" />
  </div>
  ```

- **Error state** → Use `<EmptyState icon={AlertCircle} title="..." subtitle={error} action={<Button onClick={() => navigate(-1)} variant="outline" icon={<ArrowRight />}>العودة</Button>} />`.

- **Sticky header** → Replace `bg-white border-b border-gray-100` with `glass-heavy border-b border-glass-border sticky top-0 z-10`.
- **Back button** → Replace `bg-gray-50 hover:bg-gray-100 text-gray-500` with `glass text-gray-400 hover:text-white`.
- **Title** → `text-white` instead of `text-gray-900`.
- **Status badge** → already uses `<StatusBadge>`, just fix `mr-auto` → `ms-auto`.

- **Main info card** → `<Card variant="glass" padding="p-7">`.
- **TYPE_META** → Replace light backgrounds:
  - `bg-blue-50 text-blue-500` → `bg-royal-600/15 text-royal-400`
  - `bg-violet-50 text-violet-500` → `bg-[#7C3AED]/15 text-[#A78BFA]`
  - `bg-amber-50 text-amber-500` → `bg-warning-500/15 text-warning-400`
  - `bg-gray-100 text-gray-500` → `bg-glass-light text-gray-400`
- **Type label badge** → `bg-glass-light text-gray-300 border-glass-border`.
- **Location/time text** → `text-gray-400` instead of `text-gray-500`/`text-gray-700`.

- **Beneficiary/volunteer avatar cards** → Replace raw `<div>` manual avatar circles with `<Avatar name={...} size="md" />`.
- **Volunteer card** → `<Card variant="glass" padding="p-6">`, rating → `text-warning-400`.
- **Chat button** → Replace hardcoded `bg-[#1D4ED8]` with `<Button size="lg" fullWidth icon={<MessageCircle />}>فتح المحادثة 💬</Button>`.
- **Pending waiting card** → `<Card variant="glass">`, icon → `text-warning-400`, text → `text-gray-300`/`text-gray-500`.

- **`window.confirm` / `alert`** on complete action → Replace with Phase 1 `Modal` confirmation (same pattern as BeneficiaryDashboard cancel modal).

- **Framer Motion** → `motion.div` entrance on main content.

---

### Step 4: Admin Dashboard Refactor (`AdminDashboard.jsx`)

**Source:** 590 lines. The largest file — contains its own sidebar, Toast, and three tab panels.

#### Strategy

This is a massive file but has a different role than the user dashboards. The Admin needs its **own sidebar** (different nav items: Overview, Users, SOS) not the user-facing `Sidebar.jsx`. Rather than reusing the user Sidebar, we will **restyle the existing admin sidebar in-place** to match the glassmorphism theme.

#### Sidebar Changes

- Replace `bg-[#0f172a]` with `glass-heavy`.
- Logo → import `logo.png`, place in `shadow-glow-sm` container.
- "لوحة تحكم سَنَد" → `text-white`, "مدير النظام" → `text-royal-400`.
- Active nav item → `bg-royal-600/20 text-royal-400 shadow-glow-sm` instead of `bg-blue-600 text-white`.
- Inactive → `text-gray-400 hover:bg-glass-light hover:text-white`.
- SOS badge → keep `bg-red-500 animate-pulse`, add `shadow-glow-sm`.
- Logout → `text-danger-400 hover:bg-danger-500/10`.
- Mobile toggle → `glass text-royal-400` instead of `bg-white text-[#1D4ED8]`.
- `mr-0 md:mr-[260px]` → `ms-0 md:ms-[260px]`.

#### Inline Toast → Remove

- Delete the inline `Toast` component.
- Use a local toast state pattern or integrate Phase 1 Toast. **Simplest approach:** Keep a local state `toast` and render `<Toast>` from `components/common/Toast.jsx` with `AnimatePresence`.

#### Overview Tab Changes

- Replace `bg-white rounded-2xl p-6 border border-gray-100` stat cards with `<Card variant="glass">`.
- Replace inline gradient icon boxes with `StatCard`-style or keep custom but use glass bg: `bg-royal-600/15`, `bg-warning-500/15`, `bg-success-500/15`, `bg-danger-500/15`.
- `text-gray-900` → `text-white` for all value numbers and headings.
- `text-gray-500` → `text-gray-400` for labels.
- **ProgressBar** → Restyle: `bg-glass-light` track, keep colored bars, `text-gray-400` label, `text-white` value.
- **Recent Users / Recent Requests** → `<Card variant="glass">`, avatar circles → `<Avatar>`, hover → `hover:bg-glass-light`.
- Loading state → `<Skeleton>` blocks.
- Empty state → `<EmptyState>`.

#### Users Tab Changes

- Table container → `<Card variant="glass" padding="p-0">`.
- Search input → Glass-styled: `bg-glass-light border border-glass-border text-white placeholder-gray-500 focus:border-royal-400`.
- Select dropdowns → Same glass styling.
- Table header → `bg-glass-light text-gray-400`.
- Table rows → `hover:bg-glass-light/50 transition-colors`, text → `text-white`/`text-gray-400`.
- Avatar circles in table → `<Avatar>`.
- Role badges → glass-styled with semantic colors.
- Pagination → glass buttons: `glass text-gray-400 hover:text-white`.
- Loading → `<Skeleton variant="list">`.
- Empty → `<EmptyState>`.

#### SOS Tab Changes

- Alert cards → `<Card variant="glass">`, red icon box → `bg-danger-500/15 text-danger-400`.
- Phone/location pills → glass-styled.
- Message box → `bg-danger-500/10 border border-danger-500/30`.
- Empty state → `<EmptyState icon={ShieldAlert} title="النظام مستقر وآمن" ...>`.
- Auto-refresh badge → `bg-glass-light text-gray-400`.

#### Framer Motion

- Add `motion.div` entrance on tab content switch.
- Stagger on SOS alert list items.

---

### Step 5: Global Modals Refactor

#### `CreateRequestModal.jsx` — Refactor to use Phase 1 `Modal`

- **Replace** custom AnimatePresence + backdrop + modal shell with `<Modal isOpen={isOpen} onClose={onClose} title="طلب مساعدة جديد" size="md">`.
- **Replace** inline `Alert` component with the error banner pattern: `bg-danger-500/10 text-danger-400`.
- **Replace** raw `<input>` `inputClass` with `<InputField>` component.
- **Replace** raw `<textarea>` with glass-styled textarea.
- **Replace** raw `<select>` with glass-styled select (or custom button group with icons for request types).
- **Request type selector** → Convert from `<select>` to a visual card-style picker using glass cards with `TYPE_OPTIONS` icons.
- **All text** → dark theme (`text-white` headings, `text-gray-400` labels/subtitles).
- **Success state** → `text-success-400`.

#### `ChatModal.jsx` — Restyle Only (preserve Socket.io logic)

- **Replace** custom modal shell with `<Modal isOpen={isOpen} onClose={onClose} title="المحادثة" size="lg">`.
- **Chat body** → Replace `bg-white` with transparent or `bg-navy-950/50`.
- **Own bubble** → `bg-royal-600 text-white rounded-2xl`.
- **Other bubble** → `glass text-gray-200 rounded-2xl`.
- **Typing indicator** → Glass-styled with current dot animation.
- **Message input** → `bg-glass-light border border-glass-border text-white rounded-xl`.
- **Send button** → `bg-royal-600 hover:bg-royal-500 text-white`.
- **Error banner** → `bg-danger-500/10 text-danger-400`.
- **CRITICAL:** Do NOT modify any Socket.io event handlers, message send logic, or typing indicator emission logic.

---

### Step 6: `InputField` Enhancement — `endAdornment` Prop

Before the auth pages can fully use `InputField`, add an `endAdornment` prop:

#### `src/components/common/InputField.jsx`

- Add `endAdornment` prop (ReactNode).
- Render it in a positioned `<div>` on the `end` side of the input (left in RTL).
- This enables the password eye toggle to be passed as a prop rather than requiring raw `<input>` elements.
- Non-breaking change — existing usages without `endAdornment` continue to work.

---

## ✅ Acceptance Criteria

### Visual Consistency

- [ ] No `bg-gray-50`, `bg-white`, `text-gray-900`, or other light-theme primitives remain in **any** page or modal.
- [ ] No hardcoded hex colors (`#1D4ED8`, `#0f172a`, `#f8fafc`) — all using Tailwind token classes.
- [ ] All pages use the same dark glassmorphism aesthetic as the dashboard.
- [ ] `logo.png` is used on all auth pages instead of text/icon placeholders.

### Phase 1 Component Usage

- [ ] All form cards use `<Card variant="glass">`.
- [ ] All text inputs use `<InputField>` (including password fields via `endAdornment`).
- [ ] All loading states use `<Skeleton>` — zero `<Loader2>` spinners remain for page-level loading.
- [ ] All empty states use `<EmptyState>` — zero inline "no data" strings.
- [ ] All user avatars use `<Avatar>` — zero manual initial-circle divs.
- [ ] `CreateRequestModal` uses Phase 1 `<Modal>` shell.

### Eliminated Anti-Patterns

- [ ] `window.confirm()` eliminated from `RequestDetailsPage`.
- [ ] `alert()` eliminated from `RequestDetailsPage`.
- [ ] Inline `Toast` in `AdminDashboard` replaced with Phase 1 `Toast`.
- [ ] Custom modal shells in `CreateRequestModal` and `ChatModal` replaced with Phase 1 `Modal`.

### RTL & Accessibility

- [ ] Zero instances of `mr-`, `ml-`, `pr-`, `pl-` — all using `ms-`, `me-`, `ps-`, `pe-`.
- [ ] All auth pages have Framer Motion entrance transitions.
- [ ] All inner pages have `motion.div` page entrance animations.

### Non-Breaking

- [ ] All existing routes continue to work (`/login`, `/register`, `/forgot-password`, `/reset-password`, `/profile`, `/requests/:id`, `/admin`).
- [ ] All API calls remain unchanged — only UI layer is modified.
- [ ] Socket.io chat logic is 100% preserved.
- [ ] Admin polling intervals and data fetchers are unchanged.
- [ ] ProfilePage integrates the Sidebar layout for navigation consistency.
