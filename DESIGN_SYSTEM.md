# PR2PO Prototype Design System

## 🎨 Core Design Principle

**All UI components must use shadcn/ui design principles and components.** This ensures consistency, accessibility, and automatic dark mode support across the entire application.

---

## 📋 Table of Contents

1. [Component Library](#component-library)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing](#spacing)
5. [Component Patterns](#component-patterns)
6. [Accessibility](#accessibility)
7. [Examples](#examples)
8. [Do's and Don'ts](#dos-and-donts)

---

## Component Library

### Available shadcn/ui Components

**Form Components:**
- `Button` - All clickable actions
- `Input` - Text inputs
- `Textarea` - Multi-line text
- `Label` - Form field labels
- `Checkbox` - Checkboxes
- `RadioGroup` / `RadioGroupItem` - Radio buttons
- `Select` / `SelectTrigger` / `SelectContent` / `SelectItem` - Dropdowns

**Layout Components:**
- `Card` / `CardHeader` / `CardTitle` / `CardContent` / `CardFooter` - Content containers
- `Separator` - Visual dividers
- `ScrollArea` - Scrollable containers

**Feedback Components:**
- `Alert` / `AlertDescription` - Info/warning/error messages
- `Badge` - Status indicators and tags
- `Tooltip` - Hover information
- `Skeleton` - Loading states

**Overlay Components:**
- `Dialog` - Modal dialogs
- `Tabs` - Tabbed interfaces

**Custom Extensions:**
- `StatusPill` - Extended Badge with CVA variants

### Import Pattern

```tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
```

---

## Color System

### Design Tokens (CSS Variables)

**ALWAYS use CSS variables. NEVER use hardcoded colors.**

```tsx
// ❌ WRONG - Hardcoded colors
className="bg-blue-600 text-white border-gray-200"

// ✅ CORRECT - Design tokens
className="bg-primary text-primary-foreground border"
```

### Available Color Tokens

**Base Colors:**
- `--background` - Page background
- `--foreground` - Primary text
- `--muted` - Muted backgrounds (subtle sections)
- `--muted-foreground` - Secondary text

**Brand Colors:**
- `--primary` - Primary brand color (UiPath blue)
- `--primary-foreground` - Text on primary background

**Semantic Colors:**
- `--destructive` - Error/danger states
- `--success` - Success states (green)
- `--warning` - Warning states (amber)
- `--info` - Info states (blue)

**UI Elements:**
- `--border` - Border color
- `--ring` - Focus ring color
- `--accent` - Accent backgrounds

### Usage in Tailwind

```tsx
// Backgrounds
bg-background
bg-muted
bg-muted/30  // 30% opacity
bg-primary
bg-primary/10  // 10% opacity for subtle tints

// Text
text-foreground
text-muted-foreground
text-primary
text-destructive

// Borders
border  // uses --border
border-primary
```

---

## Typography

### Font Scale

```tsx
text-xs    // 12px - Captions, metadata
text-sm    // 14px - Body text, labels
text-base  // 16px - Default body
text-lg    // 18px - Subheadings
text-xl    // 20px - Section titles
text-2xl   // 24px - Page titles
text-3xl   // 30px - Hero headlines
text-4xl   // 36px
text-5xl   // 48px - Large hero text
```

### Font Weights

```tsx
font-normal     // 400
font-medium     // 500 - Labels, emphasis
font-semibold   // 600 - Headings
font-bold       // 700 - Strong emphasis
```

### Typography Patterns

**Page Title:**
```tsx
<h1 className="text-2xl font-semibold tracking-tight text-foreground">
  Page Title
</h1>
```

**Section Heading:**
```tsx
<h3 className="text-base font-semibold text-foreground mb-4">
  Section Name
</h3>
```

**Body Text:**
```tsx
<p className="text-sm text-muted-foreground">
  Supporting text
</p>
```

---

## Spacing

### Spacing Scale

Use consistent spacing utilities:

```tsx
// Vertical spacing (stacked elements)
space-y-2   // 8px  - Tight (form label + input)
space-y-3   // 12px - Medium (card sections)
space-y-4   // 16px - Comfortable (form sections)
space-y-6   // 24px - Loose (major sections)
space-y-8   // 32px - Very loose (page sections)

// Gaps (flex/grid)
gap-2       // 8px
gap-3       // 12px
gap-4       // 16px

// Padding
p-4         // 16px
p-6         // 24px
p-8         // 32px
px-4 py-2   // Horizontal 16px, Vertical 8px
```

### Spacing Patterns

**Page Container:**
```tsx
<div className="flex-1 overflow-y-auto p-8 bg-muted/30">
  <div className="max-w-3xl mx-auto space-y-6">
    {/* Content */}
  </div>
</div>
```

**Card with Sections:**
```tsx
<Card>
  <CardContent className="p-6">
    <div className="space-y-6">
      {/* Sections */}
    </div>
  </CardContent>
</Card>
```

---

## Component Patterns

### Pattern 1: Information Card

```tsx
<Card className="transition-all hover:shadow-md">
  <CardHeader>
    <CardTitle className="text-base font-medium">
      Card Title
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-3">
      {/* Content */}
    </div>
  </CardContent>
</Card>
```

### Pattern 2: Form Field

```tsx
<div className="space-y-2">
  <Label htmlFor="field-id">
    Field Name {required && <span className="text-destructive">*</span>}
  </Label>
  <Input
    id="field-id"
    placeholder="Enter value..."
  />
</div>
```

### Pattern 3: Alert Messages

```tsx
// Info
<Alert variant="info">
  <Info className="h-4 w-4" />
  <AlertDescription>
    Information message
  </AlertDescription>
</Alert>

// Warning
<Alert variant="warning">
  <AlertCircle className="h-4 w-4" />
  <AlertDescription>
    Warning message
  </AlertDescription>
</Alert>

// Success
<Alert variant="success">
  <CheckCircle className="h-4 w-4" />
  <AlertDescription>
    Success message
  </AlertDescription>
</Alert>
```

### Pattern 4: Status Indicators

```tsx
// Badge for status
<Badge variant="secondary">Draft</Badge>
<Badge variant="default">Active</Badge>

// StatusPill for complex states
<StatusPill variant="approved">Approved</StatusPill>
<StatusPill variant="pending">Pending</StatusPill>
```

### Pattern 5: Action Row

```tsx
<Separator />
<div className="flex items-center justify-between pt-4">
  <Button variant="outline" onClick={onBack}>
    Back
  </Button>
  <Button onClick={onNext}>
    Continue
  </Button>
</div>
```

### Pattern 6: List with Separators

```tsx
<div className="space-y-0">
  {items.map((item, index) => (
    <div key={item.id}>
      <div className="py-3">
        {/* Item content */}
      </div>
      {index < items.length - 1 && <Separator />}
    </div>
  ))}
</div>
```

---

## Accessibility

### Requirements

1. **Semantic HTML:**
   ```tsx
   // ❌ WRONG
   <div onClick={handleClick}>Click me</div>

   // ✅ CORRECT
   <button type="button" onClick={handleClick}>
     Click me
   </button>
   ```

2. **Label Associations:**
   ```tsx
   <Label htmlFor="email">Email</Label>
   <Input id="email" type="email" />
   ```

3. **Focus States:**
   ```tsx
   // Built into shadcn/ui components
   focus-visible:outline-none
   focus-visible:ring-2
   focus-visible:ring-ring
   ```

4. **ARIA Labels:**
   ```tsx
   <button aria-label="Close dialog">
     <X className="h-4 w-4" />
   </button>
   ```

5. **Keyboard Navigation:**
   - All interactive elements must be keyboard accessible
   - Logical tab order
   - Escape key closes dialogs

---

## Examples

### Complete Form Example

```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function ExampleForm() {
  return (
    <div className="flex-1 overflow-y-auto p-8 bg-muted/30">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight mb-2">
            Form Title
          </h2>
          <p className="text-sm text-muted-foreground">
            Brief description
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Section Name</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input id="name" placeholder="Enter name" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter description"
                rows={3}
              />
            </div>

            <Separator />

            <div className="flex justify-between">
              <Button variant="outline">Cancel</Button>
              <Button>Submit</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

### Complete List Example

```tsx
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export function ExampleList({ items }: { items: Item[] }) {
  return (
    <div className="flex-1 overflow-y-auto p-8 bg-muted/30">
      <div className="max-w-4xl mx-auto space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          Items ({items.length})
        </h2>

        <div className="space-y-3">
          {items.map((item) => (
            <Card
              key={item.id}
              className="hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{item.name}</h3>
                      <Badge variant="secondary">
                        {item.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {item.description}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-lg font-semibold">
                      ${item.value.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

## Do's and Don'ts

### ❌ Don'ts

```tsx
// Don't use hardcoded colors
className="bg-blue-600 text-white border-gray-200"

// Don't use inline styles for colors
style={{ backgroundColor: '#3b82f6' }}

// Don't create custom styled divs for buttons
<div onClick={handleClick} className="cursor-pointer">
  Click me
</div>

// Don't use native HTML elements when shadcn/ui exists
<input type="text" />
<select><option>...</option></select>
<textarea />

// Don't forget label associations
<label>Name</label>
<input />

// Don't skip semantic HTML
<div className="border rounded p-4">
  <div className="font-bold">Title</div>
  <div>Content</div>
</div>
```

### ✅ Do's

```tsx
// Use design tokens
className="bg-primary text-primary-foreground border"

// Use shadcn/ui components
<Input type="text" />
<Select>
  <SelectTrigger>
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="1">Option 1</SelectItem>
  </SelectContent>
</Select>
<Textarea />

// Use proper Button component
<Button onClick={handleClick}>
  Click me
</Button>

// Use proper label associations
<Label htmlFor="name">Name</Label>
<Input id="name" />

// Use semantic Card structure
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content
  </CardContent>
</Card>

// Use proper component composition
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
```

---

## Component Reference Files

For implementation examples, refer to these upgraded components:

- `src/components/workflow/Stepper.tsx` - Semantic HTML, ARIA, design tokens
- `src/components/workflow/Step1ChooseItems.tsx` - Form fields, badges, separators
- `src/components/workflow/Step3Summary.tsx` - Cards, alerts, badges
- `src/components/workflow/Step5Approvals.tsx` - Alerts, badges, status indicators
- `src/components/Sidebar.tsx` - Navigation, hover states
- `src/components/PRDetailsPanel.tsx` - Card structure, alerts
- `src/components/RequesterHeroLanding.tsx` - Hero pattern, gradients, modern composition

---

## Adding New shadcn/ui Components

To add a new component from shadcn/ui:

```bash
npx shadcn@latest add [component-name]
```

Examples:
```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
npx shadcn@latest add tabs
```

---

## Dark Mode Support

All components using design tokens automatically support dark mode. No additional code needed.

To test dark mode (when implemented):
```tsx
// In tailwind.config
darkMode: ["class"]

// Toggle dark mode
<html class="dark">
```

---

## Maintenance

**When adding new features:**
1. ✅ Check if a shadcn/ui component exists for your use case
2. ✅ Use design tokens (CSS variables) for all colors
3. ✅ Follow established spacing scale
4. ✅ Use proper component composition (Card → CardHeader → CardContent)
5. ✅ Ensure accessibility (semantic HTML, labels, focus states)
6. ✅ Test keyboard navigation
7. ✅ Build and verify no TypeScript errors

**When reviewing code:**
- Look for hardcoded colors (bg-blue-600, text-gray-500, etc.)
- Look for native HTML form elements (input, select, textarea)
- Look for missing label associations
- Look for non-semantic HTML (divs instead of buttons)
- Look for inconsistent spacing

---

## Questions?

For shadcn/ui documentation:
- **Official Docs:** https://ui.shadcn.com
- **Component API:** https://ui.shadcn.com/docs/components
- **Radix UI Primitives:** https://www.radix-ui.com
- **Tailwind CSS:** https://tailwindcss.com

For this project:
- See `SHADCN_UI_UPGRADE_COMPLETE.md` for upgrade history
- See component files for implementation examples
- Ask the team or refer to this document

---

**Last Updated:** January 11, 2026
**Status:** ✅ Active Standard
**Compliance:** Required for all new UI work
