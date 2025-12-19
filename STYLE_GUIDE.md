# PR→PO Agent Prototype - UI Style Guide

**Project**: Office of the CFO Guided Buying Platform
**Design System**: Apollo Vertex inspired
**Last Updated**: 2025-12-19

---

## 🎨 Color System

### Primary Colors (Standard Tailwind Blue)
- **blue-50** `#eff6ff` - Light backgrounds, hover states
- **blue-600** `#2563eb` - Primary buttons, active elements, stepper circles
- **blue-700** `#1d4ed8` - Text on light backgrounds, active text
- **blue-200** `#bfdbfe` - Ring/glow effects on active elements

### Neutral Colors
- **white** `#ffffff` - Cards, backgrounds, button backgrounds
- **gray-50** `#f9fafb` - Section backgrounds
- **gray-100** `#f3f4f6` - Inactive backgrounds
- **gray-200** `#e5e7eb` - Borders (light)
- **gray-300** `#d1d5db` - Borders (default)
- **gray-500** `#6b7280` - Inactive text
- **gray-600** `#4b5563` - Secondary text
- **gray-700** `#374151` - Primary text
- **gray-900** `#111827` - Headings

### Status Colors
- **green-500** `#22c55e` - Success, approved
- **green-50** `#f0fdf4` - Success backgrounds
- **red-600** `#dc2626` - Danger, errors
- **amber-500** `#f59e0b` - Warnings
- **amber-50** `#fffbeb` - Warning backgrounds

---

## 🔘 Button Styles

### Primary Button (Default)
```tsx
<Button variant="default" size="default">
  Action
</Button>
```
- **Background**: `bg-blue-600`
- **Text**: `text-white`
- **Font**: `font-semibold`
- **Hover**: `hover:bg-blue-700 hover:shadow-md`
- **Active**: `active:scale-[0.98]`
- **Border Radius**: `rounded-lg` (8px)
- **Shadow**: `shadow-sm`

### Secondary Button
```tsx
<Button variant="secondary">
  Action
</Button>
```
- **Background**: `bg-white`
- **Border**: `border-2 border-gray-300`
- **Text**: `text-gray-700`
- **Hover**: `hover:border-blue-600 hover:text-blue-700 hover:bg-blue-50`

### Outline Button
```tsx
<Button variant="outline">
  Action
</Button>
```
- **Background**: `bg-white`
- **Border**: `border-2 border-gray-300`
- **Hover**: `hover:bg-gray-50 hover:border-gray-400`

### Ghost Button
```tsx
<Button variant="ghost">
  Action
</Button>
```
- **No background** in default state
- **Hover**: `hover:bg-gray-100`
- **Active**: `active:bg-gray-200`

### Button Sizes
- **sm**: `h-8 px-3 text-xs`
- **default**: `h-10 px-4 text-sm`
- **lg**: `h-12 px-6 text-base font-semibold`

---

## 🎯 Interactive States

### Focus States
- **Ring**: `focus-visible:ring-2 focus-visible:ring-blue-500`
- **Ring Offset**: `focus-visible:ring-offset-2`
- **Outline**: `focus-visible:outline-none`

### Hover States
- **Buttons**: Scale effect `hover:scale-[0.98]` or shadow increase
- **Cards**: `hover:shadow-md`
- **Navigation**: `hover:bg-gray-100`

### Active States
- **Scale**: `active:scale-[0.98]`
- **Background**: Darker shade of hover state

### Disabled States
- **Opacity**: `disabled:opacity-50`
- **Cursor**: `disabled:cursor-not-allowed`
- **Pointer Events**: `disabled:pointer-events-none`

---

## 📦 Card Components

### Standard Card
```tsx
<Card className="p-6 bg-white">
  Content
</Card>
```
- **Background**: `bg-white`
- **Border**: `border border-gray-200`
- **Border Radius**: `rounded-xl` (12px)
- **Shadow**: `shadow-sm`
- **Hover**: `hover:shadow-md transition-shadow duration-200`

### Card Padding
- **Default**: `p-6` (24px)
- **Compact**: `p-4` (16px)
- **Large**: `p-8` (32px)

---

## 📝 Typography

### Font Family
```css
font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

### Headings
- **Page Title (h1)**: `text-xl font-bold text-gray-900`
- **Section Title (h2)**: `text-lg font-semibold text-gray-900`
- **Card Title (h3)**: `text-base font-semibold text-gray-900`
- **Subsection (h4)**: `text-sm font-medium text-gray-700`

### Body Text
- **Primary**: `text-sm text-gray-700`
- **Secondary**: `text-sm text-gray-600`
- **Muted**: `text-xs text-gray-500`

### Labels
- **Form Label**: `text-sm font-medium text-gray-700`
- **Helper Text**: `text-xs text-gray-500`

---

## 📏 Spacing & Layout

### Container Spacing
- **Page Padding**: `p-6` to `p-8` (24-32px)
- **Section Gap**: `space-y-6` to `space-y-8` (24-32px)
- **Card Gap**: `space-y-4` (16px)
- **Element Gap**: `gap-2` to `gap-3` (8-12px)

### Max Widths
- **Content**: `max-w-5xl` (1024px)
- **Forms**: `max-w-3xl` (768px)
- **Dialogs**: `max-w-lg` (512px)

### Layout Ratios
- **Two-Column (Chat + Workflow)**: 40% / 60%
- **Sidebar**: Fixed `w-64` (256px)

---

## 🎭 Component Patterns

### Status Pills
```tsx
<StatusPill variant="approved">Status</StatusPill>
```
- **Border**: `border` (1px)
- **Padding**: `px-2.5 py-0.5`
- **Border Radius**: `rounded-full`
- **Font**: `text-xs font-medium`

**Variants**:
- `draft` - Gray
- `submitted` - Blue
- `in_progress` - Yellow
- `approved` - Green
- `rejected` - Red
- `pending` - Amber

### Stepper (Workflow Progress)
- **Circle Size**: `w-10 h-10`
- **Active**: `bg-blue-600 text-white ring-4 ring-blue-200`
- **Completed**: `bg-blue-600 text-white`
- **Inactive**: `bg-gray-100 text-gray-500 border-2 border-gray-300`
- **Numbers**: Always visible (no checkmarks)
- **Labels**: Below circles, `text-xs font-medium`

### Form Inputs
```tsx
<Input type="text" placeholder="Enter value" />
```
- **Height**: `h-10`
- **Border**: `border-2 border-gray-300`
- **Border Radius**: `rounded-lg`
- **Background**: `bg-white`
- **Padding**: `px-3 py-2`
- **Font**: `text-sm`
- **Placeholder**: `text-gray-400`
- **Focus**: `focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-600`

### Sidebar Navigation
- **Item Padding**: `px-4 py-3`
- **Active State**:
  - Background: `bg-blue-50`
  - Text: `text-blue-700`
  - Left border: `before:w-1 before:bg-blue-600`
  - Icon scale: `scale-110`
- **Hover**: `hover:bg-gray-100 hover:text-gray-900`

### View Toggle Tabs
- **Active Tab**:
  - Background: `bg-white`
  - Text: `text-blue-700 font-semibold`
  - Border: `border-2 border-blue-600`
  - Shadow: `shadow-sm`
- **Inactive Tab**:
  - Text: `text-gray-600`
  - Hover: `hover:bg-gray-100`

### Chat Messages
- **User Message**: `bg-blue-600 text-white ml-12 rounded-xl`
- **Assistant**: `bg-gray-100 text-gray-900 mr-12 rounded-xl`
- **System**: `bg-blue-50 text-blue-900 border border-blue-100 mr-12 rounded-xl`
- **Padding**: `p-4`
- **Line Height**: `leading-relaxed`

### Approval Timeline
- **Circle Size**: `w-12 h-12`
- **Approved**: `bg-green-500 shadow-lg shadow-green-500/30`
- **Pending**: `bg-blue-600 shadow-lg shadow-blue-600/30 ring-4 ring-blue-200`
- **Waiting**: `bg-gray-300`
- **Connector**: `w-1 h-16 bg-gradient-to-b from-gray-300 to-gray-200`

---

## ⚡ Transitions & Animations

### Standard Transitions
- **Duration**: `duration-200` (200ms)
- **Easing**: Default (ease-in-out)

### Special Effects
- **Scale on Click**: `active:scale-[0.98]`
- **Hover Scale**: `hover:scale-110` (stepper only)
- **Shadow Transition**: `transition-shadow duration-200`
- **Color Transition**: `transition-colors`
- **All Properties**: `transition-all duration-200`

---

## 🎯 Accessibility

### Focus Management
- Always use `focus-visible:` for keyboard navigation
- Ring color: `ring-blue-500`
- Clear focus indicators on all interactive elements

### Color Contrast
- All text meets WCAG AA standards
- Primary buttons: Blue (`#2563eb`) on white text
- Text on backgrounds: Gray-700+ on white

### Keyboard Navigation
- All buttons and interactive elements focusable
- Tab order follows visual flow
- Disabled states prevent interaction

---

## 📱 Responsive Behavior

### Breakpoints (Future)
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### Current Implementation
- Desktop-first (optimized for 1440px+)
- Two-column layout (40/60 split)
- Fixed sidebar (256px)

---

## ✅ Do's and Don'ts

### ✅ Do
- Use standard Tailwind colors (`blue-600`, `gray-700`, etc.)
- Apply consistent spacing (`gap-2`, `gap-3`, `space-y-4`, etc.)
- Use `rounded-lg` for buttons, `rounded-xl` for cards
- Add hover and focus states to all interactive elements
- Show stepper numbers in all states (don't replace with checkmarks)
- Use `font-semibold` for buttons and active text
- Apply shadows sparingly (`shadow-sm` default, `shadow-md` on hover)

### ❌ Don't
- Use custom color names like `uipath-blue-500` (they don't work reliably)
- Use `primary` or `ring` CSS variables directly in Tailwind classes
- Mix `text-white` with light backgrounds
- Forget focus states on interactive elements
- Use animations longer than 300ms
- Create buttons without explicit background colors

---

## 🔧 Implementation Examples

### Complete Button Example
```tsx
<Button
  variant="default"
  size="lg"
  onClick={handleSubmit}
  disabled={!isValid}
>
  Submit Request
</Button>
```

### Complete Card with Content
```tsx
<Card className="p-6 bg-white">
  <h3 className="text-base font-semibold text-gray-900 mb-2">
    Card Title
  </h3>
  <p className="text-sm text-gray-600">
    Card description text goes here.
  </p>
</Card>
```

### Complete Form Input
```tsx
<div className="space-y-2">
  <label className="text-sm font-medium text-gray-700">
    Field Label
  </label>
  <Input
    type="text"
    placeholder="Enter value"
    className="w-full"
  />
  <p className="text-xs text-gray-500">
    Helper text
  </p>
</div>
```

---

## 📚 Component Reference

### Core UI Components
- `Button` - src/components/ui/Button.tsx
- `Card` - src/components/ui/Card.tsx
- `Input` - src/components/ui/Input.tsx
- `StatusPill` - src/components/ui/StatusPill.tsx

### Workflow Components
- `Stepper` - src/components/workflow/Stepper.tsx
- `Step1ChooseItems` - src/components/workflow/Step1ChooseItems.tsx
- `Step2PurchaseInfo` - src/components/workflow/Step2PurchaseInfo.tsx
- `Step3Summary` - src/components/workflow/Step3Summary.tsx
- `Step4Validation` - src/components/workflow/Step4Validation.tsx
- `Step5Approvals` - src/components/workflow/Step5Approvals.tsx

### Layout Components
- `Sidebar` - src/components/Sidebar.tsx
- `PersonaSelector` - src/components/PersonaSelector.tsx

---

**Note**: This style guide is the single source of truth for all UI decisions in this project. Any new components or features must follow these patterns exactly.
