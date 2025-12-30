# Development Log - PR2PO Prototype

## Project Overview
**Name:** PR2PO Prototype
**Purpose:** Purchase Request to Purchase Order workflow system with AI-powered chat interface
**Tech Stack:** React + TypeScript + Vite + Tailwind CSS
**Repository:** https://github.com/GabrielChitic/PR2POPrototype.git
**Deployment:** Vercel (auto-deploy from main branch)
**Node Version:** 18+ (tested with Node 18.x and 20.x)
**Package Manager:** npm (npm 9+)

---

## 🤖 FOR AI ASSISTANTS (Claude Code / GitHub Copilot / Cursor)

### Quick Context Restoration

**If you're an AI assistant helping to continue this project, here's what you need to know:**

#### **Current Project State (v1.0):**
- ✅ **Fully functional 5-step workflow** (Step 0-5)
- ✅ **Smart chat with natural language parsing** from initial request
- ✅ **Dynamic Step 2** with 3 variants (catalog/free-text/services)
- ✅ **CLM contract integration** with mock suggestions
- ✅ **File upload system** with metadata tracking
- ✅ **All TypeScript errors resolved** - build passes
- ✅ **Deployed on Vercel** - auto-deploys from main branch

#### **Key Entry Points:**
1. **Main App:** `src/App.tsx` - Module router (Requester/Procurement/Overview/Settings)
2. **Workflow Orchestrator:** `src/modules/Requester/RequesterModuleV2.tsx` (800+ lines)
3. **Dynamic Step 2:** `src/components/workflow/Step2Container.tsx` (1000+ lines)
4. **Type System:** `src/types/workflow.ts` - All TypeScript interfaces
5. **Mock Data:** `src/data/catalogData.ts` - Catalog items
6. **Search Logic:** `src/services/unifiedSearch.ts` - Intent detection

#### **How to Understand This Codebase Quickly:**

1. **Read these sections in order:**
   - "Feature Implementation History" (Phases 1-10) - What was built and why
   - "State Management" - How data flows through the app
   - "Key Type Definitions" - The data structures
   - "Mock Data" section - What the simulation data looks like

2. **Key Concepts to Grasp:**
   - **Workflow Step:** User progresses through steps 0→1→2→3→4→5
   - **Request Type:** System auto-detects catalogGoods/freeTextGoods/servicesOrComplex based on items
   - **Step 2 Variants:** Single component (`Step2Container.tsx`) that renders different forms based on requestType
   - **Draft PR:** All form data stored in a single `DraftPR` object maintained in `RequesterModuleV2.tsx`
   - **Chat Co-pilot:** Chat messages trigger parsing logic that auto-fills form fields

3. **Common Task Scenarios:**

   **Scenario A: User wants to add a new field to Step 2**
   ```typescript
   // 1. Update type in src/types/workflow.ts
   export interface PurchaseInfo {
     // ... existing fields
     newField?: string;  // Add here
   }

   // 2. Update Step2Container.tsx
   // Find the appropriate variant (2A/2B/2C) and add input field
   <Input
     value={purchaseInfo.newField}
     onChange={(e) => onUpdate({ newField: e.target.value })}
   />

   // 3. Update validation if needed
   const isValid2A =
     purchaseInfo.usage?.trim().length > 0 &&
     purchaseInfo.newField?.trim().length > 0;  // Add validation

   // 4. Display in Step3Summary.tsx if needed
   ```

   **Scenario B: User wants to enhance chat parsing**
   ```typescript
   // Edit RequesterModuleV2.tsx, find handleStep2CoPilot() or parseInitialRequest()

   // Add new parsing pattern:
   const newFieldMatch = message.match(/new pattern here/i);
   if (newFieldMatch) {
     updates.newField = newFieldMatch[1].trim();
     confirmations.push(`new field to "${newFieldMatch[1].trim()}"`);
   }
   ```

   **Scenario C: User encounters TypeScript error**
   ```bash
   # 1. Read the error - usually TS6133 (unused var) or TS2741 (missing property)
   # 2. For unused vars: prefix with underscore or remove
   # 3. For missing props: check if component signature changed
   # 4. Build locally to verify: npm run build
   ```

#### **State Flow Diagram (Text Format):**
```
User Types Message
    ↓
handleChatSubmit() in RequesterModuleV2.tsx
    ↓
[Step 0] parseInitialRequest() → extracts metadata
    ↓
performSearch() → finds catalog items or creates free-text
    ↓
[Step 1] User selects items → handleAddItem() → updates draft.lineItems
    ↓
handleStep1Next() → determineRequestType() → sets draft.requestType
    ↓
[Step 2] Step2Container renders based on requestType
    - User fills form → onUpdate() → updates draft.purchaseInfo
    - User uploads files → handleFileUpload() → updates draft.uploadedFiles
    - User selects contract → handleSelectContract() → updates draft.selectedContract
    ↓
[Step 3] Step3Summary displays all draft data
    ↓
[Step 4] Validation runs → generates draft.validationIssues
    ↓
[Step 5] Approval path shown → handleSubmit() → marks as SUBMITTED
```

#### **Critical Files You'll Modify Often:**
| File | Purpose | When to Edit |
|------|---------|-------------|
| `RequesterModuleV2.tsx` | Main orchestrator | Adding chat logic, state management, step handlers |
| `Step2Container.tsx` | Dynamic Step 2 forms | Adding fields, changing validation, new variants |
| `workflow.ts` | Type definitions | Adding new fields to interfaces |
| `Step3Summary.tsx` | Review screen | Displaying new fields in summary |
| `catalogData.ts` | Mock catalog | Adding test items |

#### **How to Test Your Changes:**
```bash
# 1. Start dev server
npm run dev

# 2. Test workflow end-to-end:
# - Type: "Need desks by May 20 to Munich office"
# - Check: Date and location pre-filled in Step 2?
# - Step 1: Select catalog items
# - Step 2: Verify form shows correct variant
# - Step 3: Check summary displays all data
# - Complete workflow

# 3. Test chat co-pilot:
# - In Step 2, type: "Deliver to Berlin office"
# - Check: deliverToLocation field updates?

# 4. Build check:
npm run build
# Must pass with no errors
```

#### **Package.json Key Dependencies (Why They're Used):**
```json
{
  "react": "^18.3.1",           // UI framework
  "react-dom": "^18.3.1",       // React rendering
  "typescript": "~5.6.2",       // Type safety
  "vite": "^7.3.0",             // Fast build tool with HMR
  "tailwindcss": "^3.4.17",     // Utility-first CSS
  "lucide-react": "^0.468.0",   // Icon library (Check, X, Upload, etc.)
  "clsx": "^2.1.1",             // Conditional classNames
  "tailwind-merge": "^2.6.0"    // Merge Tailwind classes safely
}
```

#### **When User Asks: "Continue from where we left off"**

**Your Response Template:**
```
"I've reviewed the DEVELOPMENT_LOG.md. Current state:

✅ Project: PR2PO Prototype - Purchase workflow with AI chat
✅ Version: v1.0 - Full Step 2 implementation with CLM integration
✅ Last completed: Phase 10 - Step 3 Summary enhancements
✅ Build status: Passing (TypeScript + Vite)
✅ Key files: RequesterModuleV2.tsx (orchestrator), Step2Container.tsx (dynamic forms)

What would you like to work on next? I can:
1. Add new features to existing steps
2. Enhance chat parsing logic
3. Add validation rules
4. Debug issues
5. Refactor or optimize code

Please describe what you'd like to accomplish."
```

---

## Project Architecture

### Core Structure
```
src/
├── components/
│   ├── ui/           # Reusable UI components (Button, Input, Card, StatusPill)
│   ├── workflow/     # Workflow step components (Step1-5, Stepper)
│   └── Sidebar.tsx   # Navigation sidebar
├── modules/
│   ├── Requester/    # Main requester workflow (RequesterModuleV2.tsx)
│   ├── Procurement/  # Procurement team view
│   ├── Overview/     # Dashboard overview
│   └── Settings/     # Settings module
├── context/
│   └── PRContext.tsx # Global PR state management
├── services/
│   └── unifiedSearch.ts # Smart search with intent detection
├── data/
│   └── catalogData.ts   # Mock catalog items
└── types/
    └── workflow.ts      # TypeScript type definitions
```

### Key Type Definitions

**WorkflowStep:** 0 | 1 | 2 | 3 | 4 | 5
**PRStatus:** DRAFT | IN_PROGRESS | CONFIRMED | VALIDATED | SUBMITTED | IN_APPROVAL | APPROVED | REJECTED | PO_CREATED
**ItemType:** goods | service | freeText | unknown
**RequestType:** catalogGoods | freeTextGoods | servicesOrComplex

**Core Interfaces:**
- `DraftPR` - Main purchase request draft with all data
- `DraftLineItem` - Individual items in the request
- `PurchaseInfo` - Delivery, recipient, usage, project info
- `CLMContract` - Contract lifecycle management contract data
- `UploadedFile` - File attachment metadata
- `CatalogItem` - Catalog search results
- `ValidationIssue` - Validation errors/warnings/suggestions
- `ApprovalStep` - Approval workflow steps

## Feature Implementation History

### Phase 1: Initial Setup & Step 1
**What:** Basic workflow structure with catalog item selection
- Created stepper navigation (5 steps)
- Implemented Step 1 (Choose Items) with catalog search
- Added filter by preferred supplier
- Sort by price (asc/desc) and lead time
- Quantity controls with add/remove items
- Free text item creation when no catalog match

**Files:**
- `src/components/workflow/Step1ChooseItems.tsx`
- `src/components/workflow/Stepper.tsx`
- `src/data/catalogData.ts`

### Phase 2: Step 2 Container & Variant Switching
**What:** Dynamic Step 2 that changes based on request type

**Implementation:**
- Single `Step2Container.tsx` component with 3 variants:
  - **2A: Catalog Goods** - Minimal friction checkout form
  - **2B: Free-Text Goods** - Clarify need, not supplier
  - **2C: Services/Complex** - Comprehensive service details

**Variant Detection Logic:**
- Checks `draft.requestType` first
- Falls back to analyzing `lineItems` types (goods, freeText, service)
- Service detection via keywords: consulting, training, implementation, audit, etc.

**Files:**
- `src/components/workflow/Step2Container.tsx` (1000+ lines)
- Extended `workflow.ts` with RequestType

### Phase 3: Step 2A - Catalog Goods
**What:** Lightweight checkout for catalog items

**Fields:**
- Delivery & Recipient (deliverTo, deliverToLocation, needByDate)
- Business Context (usage, isPartOfProject, projectName)
- Conditional Attachments (required if >$10k)

**Features:**
- Auto-derived ERP fields (GL code, cost center) - not shown to user
- Helper message about silent field derivation
- Attachment threshold warning

### Phase 4: Step 2B - Free-Text Goods
**What:** Focus on business need clarification

**Fields:**
- Usage & Context (mandatory "What is this used for?")
- Specification Refinement (optional brand/model/specs)
- Supplier Preference Display (banner if mentioned earlier, optional input otherwise)
- Attachments (encouraged/required)
- Delivery & Recipient

**Smart Supplier Handling:**
- If supplier mentioned in Step 1 → Show blue banner with "Change" button
- If not mentioned → Show gray box + optional input field
- Stores preferredSupplier in line item metadata

### Phase 5: Step 2C - Services/Complex
**What:** Rich information capture for services

**Sections:**
1. **Scope & Deliverables** - What supplier will do/deliver
2. **Timing** - Start date, end date/duration, frequency (One-off, Monthly, Quarterly, Annual, On-demand)
3. **Business Justification** - Why needed, impact if not approved, strategic initiative toggle
4. **Delivery Model & Locations** - Remote/On-site/Hybrid, primary location, additional locations
5. **Risk Assessment** - 4 toggles with helper text:
   - Personal data involved
   - Highly confidential data
   - Supports critical/regulated process
   - Third-party subcontractors
6. **Service Owner** - Name, department
7. **Documents & Contracts** - Upload + CLM integration (see Phase 9)

### Phase 6: Smart Chat - Initial Request Parsing
**What:** Intelligent parsing from the very first message

**Capabilities:**
- Extracts search query while removing metadata
- Parses dates: "20th of May", "May 20 2025", "2025-05-20", ordinal suffixes
- Detects locations: "Munich Office", "to Berlin office"
- Identifies recipients: person names with capital letters
- Parses usage/reason/justification
- Recognizes project mentions

**Implementation:**
- `parseInitialRequest()` function in `RequesterModuleV2.tsx:287-405`
- Pre-populates `draft.purchaseInfo` with extracted metadata
- Cleans search query (removes "need", "wants", "looking for", articles)
- Shows confirmation: "✓ Got it! Searching for 'desks'... I've captured: date: 2025-05-20, location: Munich"

**Example:**
```
Input: "Needs desks by 20th of May to Munich Office for Project Phoenix"
Extracts:
  - searchQuery: "desks"
  - needByDate: "2025-05-20"
  - deliverToLocation: "Munich"
  - projectName: "Phoenix"
  - isPartOfProject: true
```

### Phase 7: Smart Chat - Step 2 Co-Pilot
**What:** Natural language field updates in Step 2

**Capabilities:**
- Parses delivery locations
- Multiple date patterns
- Usage/reason extraction
- Project mentions
- Delivery model keywords (remote/onsite/hybrid)
- Risk toggles
- Recipient/service owner names

**Implementation:**
- `handleStep2CoPilot()` in `RequesterModuleV2.tsx:139-286`
- Conservative approach - only updates when intent clear
- Confirmation message listing what was updated
- Supports overwriting previous values

**Example:**
```
User: "Need it by 20 May and deliver to Munich office"
System: "✓ Updated date to 20 May, delivery location to 'Munich'. The form has been updated automatically."
```

### Phase 8: Step 1 ↔ Step 2 Linkage
**What:** Fixed free-text item detection and type propagation

**Problem Solved:**
- Free-text items were marked as "goods" instead of "freeText"
- Step 2 showed catalog form (2A) instead of free-text form (2B)

**Solution:**
- Enhanced `handleAddItem()` to detect free-text via `item.id.startsWith("freetext-")`
- Added `isServiceItem()` keyword detection
- Properly set item type: "freeText" for goods, "service" for services
- Store metadata: estimatedValue, currency, preferredSupplier

**Service Keywords:**
consulting, consultation, consultancy, service, services, support, maintenance, training, workshop, implementation, audit, assessment, analysis, development, project, rollout

### Phase 9: Step 2C - CLM Integration & Attachments
**What:** Smart contract suggestions and file upload

**CLM Contract Features:**
- Auto-generates 3 relevant contracts on mount
- Mock contracts: Accenture (IT Services), Deloitte (Professional Services), PwC (Consulting)
- Smart supplier matching (boosts matching contracts to top)
- Radio button selection with visual confirmation
- Displays: name, ID, supplier, category, validity dates, region, status badge, relevance hint
- "Source: CLM" purple badge
- Green confirmation banner on selection
- Stores in `draft.selectedContract`

**File Upload Features:**
- Multi-file upload with drag & drop
- Accepts: .pdf, .doc, .docx, .xls, .xlsx
- Real-time file list with filename, size (formatted), remove button
- Stores in `draft.uploadedFiles[]` with metadata

**Chat Support:**
```
User: "Is there an existing contract for this?"
System: "Yes, I've found 3 contracts from CLM. For example:
• 'Global IT Services Framework Agreement' with Accenture (valid until 2027)
• 'Professional Services Master Agreement' with Deloitte (valid until 2026)
• 'Consulting Services Framework' with PwC (valid until 2025)
You can select one in the 'Existing Contracts' section below."
```

**Implementation:**
- `generateMockCLMContracts()` - Creates mock contracts
- `handleSelectContract()` - Stores selection in draft
- `handleFileUpload()` - Simulates file upload with metadata
- `handleRemoveFile()` - Removes file from list
- Integration in `RequesterModuleV2.tsx:143-166` for chat queries

### Phase 10: Step 3 Summary Enhancements
**What:** Display contract and file info in summary

**Added Sections:**
- **Linked Contract** - Green bordered section with:
  - Contract name, ID, supplier, category, valid until
  - "CLM" badge, call-off confirmation text
- **Attached Documents** - List of uploaded files with sizes

**Files:**
- `src/components/workflow/Step3Summary.tsx:58-119`

## State Management

### Draft PR Flow
```
Step 0 (Chat) → Parse initial request → Create draft with metadata
Step 1 → Add/remove items → Update lineItems + determine requestType
Step 2 → Fill forms → Update purchaseInfo + select contract + upload files
Step 3 → Review → Display all data
Step 4 → Validate → Check policies, generate issues
Step 5 → Approvals → Show approval path, submit
```

### Key State Updates
- `setDraft()` - Updates entire draft object
- `handleUpdatePurchaseInfo()` - Updates purchaseInfo partial
- `handleUpdateDraft()` - Updates draft partial (for contracts/files)
- `addChatMessage()` - Adds chat messages to history

## Chat Command System

### Recognized Commands
- **Restart:** "new request", "start over", "search again", "restart"
- **Help:** "help", "help me"
- **Status:** "where am i", "what step", "status"
- **PR Query:** mentions "pr-" (redirects to My PRs tab)

### Context-Aware Responses
- **Step 0:** Search and intent detection
- **Step 2:** Co-pilot field updates + contract queries
- **Other steps:** Context help based on current step

## Validation & Approval Logic

### Step 2 Validation
- **2A (Catalog):** usage, deliverTo, deliverToLocation, needByDate required
- **2B (Free-text):** Same as 2A
- **2C (Services):** Same as 2A (scope/timing validated separately)

### Step 4 Validation (Simulated)
- Orders >$50k → Require quote attachment
- Non-preferred suppliers → Suggestion to use preferred

### Step 5 Approval Path (Simulated)
- $0-$5k → Manager only
- $5k-$25k → Manager + Department Head
- $25k-$100k → Manager + Department Head + Finance
- >$100k → Manager + Department Head + Finance + VP

## Mock Data

### Catalog Items (catalogData.ts)
- Office Supplies category: Desks, chairs, monitors, laptops
- IT Equipment: Servers, routers, switches
- Each item has: name, description, category, unitPrice, supplier, isPreferredSupplier, imageUrl, keywords, leadTimeDays, specs

### CLM Contracts (generateMockCLMContracts)
1. **Global IT Services Framework Agreement**
   - Supplier: Accenture
   - Contract ID: FWK-IT-2024-001
   - Category: IT Services
   - Valid: 2024-01-01 to 2027-12-31
   - Region: EU
   - Status: Active

2. **Professional Services Master Agreement**
   - Supplier: Deloitte
   - Contract ID: MSA-PS-2023-045
   - Category: Professional Services
   - Valid: 2023-03-15 to 2026-03-14
   - Region: Global
   - Status: Active

3. **Consulting Services Framework**
   - Supplier: PwC
   - Contract ID: CSF-2024-012
   - Category: Consulting
   - Valid: 2024-06-01 to 2025-12-31
   - Region: EMEA
   - Status: Expiring Soon

## Recent Bug Fixes

### TypeScript Build Errors (Vercel Deployment)
**Commit:** `4c991d5`

**Fixed Issues:**
1. Removed unused `Building2` import from Step2Container
2. Removed unused `category` variable in `generateMockCLMContracts`
3. Prefixed unused `message` parameter with underscore in `handleChatCommand`
4. Removed unused `category` variable in contract query handler

**Result:** Build now passes successfully (TS compilation + Vite build)

## Development Setup

### Prerequisites
- Node.js 18+ and npm
- Git

### Getting Started
```bash
# Clone repository
git clone https://github.com/GabrielChitic/PR2POPrototype.git
cd PR2POPrototype

# Install dependencies
npm install

# Run development server
npm run dev
# Opens at http://localhost:5173 (or 5174 if 5173 is taken)

# Build for production
npm run build

# Preview production build
npm run preview
```

### Project Commands
```bash
npm run dev       # Start dev server with HMR
npm run build     # TypeScript compile + Vite build
npm run preview   # Preview production build
npm run lint      # Run ESLint (if configured)
```

## Technical Decisions & Patterns

### Why RequesterModuleV2 vs RequesterModule?
- V2 is the active implementation with full chat intelligence
- V1 kept for reference but not used

### Why Single Step2Container vs Separate Components?
- Easier state management (shared PurchaseInfo)
- Cleaner variant switching logic
- DRY for common fields (delivery, recipient, dates)

### Why Mock Data Instead of API?
- Prototype/demo purposes
- Focus on UX and workflow design
- Easy to swap with real API later (services layer abstraction)

### File Upload Simulation
- Uses `FileList` from input but doesn't actually upload
- Creates `UploadedFile` metadata immediately
- Real implementation would call upload API and store file IDs

## Testing Scenarios

### Catalog Goods Flow
```
1. Type: "Need 5 desks by May 20 to Munich office"
2. System parses: searchQuery="desks", date="2025-05-20", location="Munich"
3. Step 1: Shows catalog desks, select 5x
4. Step 2A: Form pre-filled with date/location, add usage
5. Step 3: Review and proceed
```

### Free-Text Goods Flow
```
1. Type: "Need custom signage for Berlin office"
2. No catalog match → Free text form in Step 1
3. Fill: name, description, budget, date, preferred supplier
4. Step 2B: Shows supplier banner if mentioned, add usage/specs
5. Upload quote/proposal
6. Step 3: Review
```

### Services Flow
```
1. Type: "SAP consulting services for Project Phoenix"
2. Detects "consulting" keyword → service type
3. Step 1: Add service item
4. Step 2C: Fill scope, timing, justification, delivery model, risks
5. CLM shows 3 contracts → Select Accenture contract
6. Upload SoW
7. Step 3: Shows linked contract + uploaded documents
8. Chat: "Is there an existing contract?" → Confirms selection
```

## Known Limitations & Future Work

### Current Limitations
1. **No backend** - All data is in-memory, lost on refresh
2. **No authentication** - Persona hardcoded in localStorage
3. **No real file upload** - Simulated with metadata only
4. **No real CLM integration** - Mock contracts generated client-side
5. **No real approval routing** - Simulated approval path
6. **No validation rules engine** - Hardcoded validation logic

### Potential Next Steps
1. **Backend Integration**
   - REST API or GraphQL endpoints
   - Database for PRs, items, contracts
   - File storage (S3, Azure Blob, etc.)

2. **Authentication & Authorization**
   - OAuth/SAML integration
   - Role-based access control
   - Persona from auth token

3. **Real CLM Integration**
   - API to query contracts by category/supplier
   - Contract selection and linking
   - Contract compliance validation

4. **Advanced Search**
   - Elasticsearch or Algolia for catalog search
   - Semantic search with embeddings
   - Search history and suggestions

5. **Enhanced Validation**
   - Policy rules engine
   - Budget compliance checks
   - Supplier risk checks
   - Automatic routing based on rules

6. **Approval Workflow**
   - Configurable approval chains
   - Email notifications
   - Approval delegation
   - Escalation rules

7. **Analytics & Reporting**
   - PR creation trends
   - Supplier spend analysis
   - Approval cycle times
   - Contract utilization

8. **Mobile Support**
   - Responsive design improvements
   - Mobile-specific layouts
   - Touch-optimized interactions

## Troubleshooting

### Dev Server Port Already in Use
- Vite automatically tries next port (5174, 5175, etc.)
- Or: `killall node` / `taskkill /f /im node.exe`

### TypeScript Errors on Build
- Check for unused variables (TS6133)
- Prefix unused params with underscore: `_param`
- Remove unused imports

### HMR Not Working
- Check Vite config
- Restart dev server
- Clear browser cache

### Git Push Fails
- Check network connection
- Ensure you're on correct branch: `git branch`
- Pull latest changes: `git pull origin main`

## Deployment (Vercel)

### Current Setup
- **Auto-deploy:** Connected to GitHub main branch
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Framework Preset:** Vite

### Manual Deploy
1. Push to main branch
2. Vercel detects commit and starts build
3. Build runs `npm install` + `npm run build`
4. Deploy to production URL

### Environment Variables (if needed later)
```
VITE_API_URL=https://api.example.com
VITE_CLM_API_URL=https://clm.example.com
VITE_AUTH_DOMAIN=auth.example.com
```

## UI Behavior & User Experience (For AI Understanding)

### What User Sees at Each Step

#### **Step 0: Initial Chat (Welcome Screen)**
**Visual:**
- Large chat interface on right side (60% width)
- Sidebar on left with module tabs (Requester, Procurement, Overview, Settings)
- Welcome message: "Welcome to the Procurement Assistant. What would you like to buy?"
- Chat input at bottom: "Type your message..."

**User Action:** Types message like "Need desks by May 20 to Munich office"

**System Response:**
- Shows user message bubble (blue background, right-aligned)
- Shows assistant parsing confirmation: "✓ Got it! Searching for 'desks'... I've captured: date: 2025-05-20, location: Munich"
- Shows "Let me check our catalogs..." message
- Displays catalog results or "No catalog match found"

#### **Step 1: Choose Items**
**Visual:**
- Stepper at top showing: ① Choose items → 2 Purchase info → 3 Summary → 4 Validation → 5 Approvals
- Page title: "Choose items from catalog"
- Grid of catalog item cards (2 columns on desktop)
- Each card shows: thumbnail icon, name, description, specs, supplier badge (Preferred/Standard), price, lead time
- Filter controls: "Preferred suppliers only" checkbox, Sort dropdown (Price: Low to High, etc.)
- Quantity controls on each card: [-] [1] [+] buttons, "Add to Request" button
- Bottom section: "My Request (X)" with selected items shown as blue boxes, total price, "Next: Purchase Information" button

**User Action:** Clicks quantity buttons, clicks "Add to Request" on desired items

**System Response:**
- Selected items move to bottom "My Request" section
- Can adjust quantity or remove from bottom section
- "Next" button becomes enabled when at least one item selected

#### **Step 2: Purchase Information (Dynamic Form)**
**Visual Varies by Request Type:**

**2A (Catalog Goods):**
- Title: "Quick Checkout"
- Section 1: Delivery & Recipient (3 fields: Deliver to, Location, Need by date) - **Pre-filled from Step 0 chat!**
- Section 2: Business Context (Textarea: "What is this for?", Optional checkbox + input: "Part of a project")
- Section 3: Conditional warning (amber box if >$10k): "Orders over $10,000 require supporting documentation"
- Upload area (dashed border): "Click to upload or drag and drop"
- Blue info box (if <$10k): "No additional documents required. Technical fields will be derived automatically."
- Navigation: "Back to Items" | "Next: Review Summary" (disabled until required fields filled)

**2B (Free-Text Goods):**
- Title: "Free Text Item Details"
- Section 1: Usage & Context (required textarea)
- Section 2: Specification Refinement (optional inputs for brand/model/specs)
- Section 3: Supplier Preference
  - IF supplier mentioned in Step 1: Blue banner "You mentioned 'Accenture' as preferred supplier" + "Change" button
  - IF NOT mentioned: Gray box "I'll let procurement pick" + optional input
- Section 4: Attachments (encouraged)
- Section 5: Delivery & Recipient - **Pre-filled!**

**2C (Services):**
- Title: "Service Request Details"
- 7 sections: Scope, Timing, Justification, Delivery Model, Risk Assessment, Service Owner, Documents & Contracts
- **Documents & Contracts section:**
  - Upload area (same as 2A/2B)
  - Uploaded files list (shows filename, size, "X" to remove)
  - "Existing Contracts (from CLM)" heading with purple "Source: CLM" badge
  - 3 contract cards with radio buttons:
    - Each card shows: contract name, status badge (Active/Expiring Soon), supplier, contract ID, category, region, validity dates, relevance hint
    - Selected contract: blue border, blue background, checkmark icon
  - Green confirmation box when selected: "✓ Contract selected. This request will be treated as a call-off under [name]."

**User Action:** Fills form fields, uploads files, selects contract (for services)

**Chat Interaction:** User can type "Deliver to Berlin" and field updates automatically with confirmation message

#### **Step 3: Review Summary**
**Visual:**
- Title: "Summary & Confirmation"
- Section 1: Purchase Information (grid view: Usage, Deliver to, Need by, Project)
- Section 2 (if contract selected): Green-bordered "Linked Contract" box with contract details + "CLM" badge
- Section 3 (if files uploaded): "Attached Documents (X)" list with file names and sizes
- Section 4: Items list (each item shows: name, description, supplier, quantity × price = total)
- Section 5: Total value at bottom
- Navigation: "Back to Purchase Info" | "Run Validation" button

**User Action:** Reviews all data, clicks "Run Validation"

#### **Step 4: Validation**
**Visual:**
- Title: "Validation & Policy Check"
- Section 1: Validation results
  - Green success box: "Good news! Your request passes all policy checks."
  - OR Red/amber warning boxes: "Issue: Orders over $50,000 require quote attachment" with "Fix" button
- Section 2: Policy compliance checks shown as green checkmarks or red warnings
- Navigation: "Back to Summary" | "View Approval Path" (disabled if errors exist)

**User Action:** Fixes any issues, clicks "View Approval Path"

#### **Step 5: Approvals**
**Visual:**
- Title: "Approval Path"
- Approval chain shown as connected boxes:
  - Each box shows: Role, Approver name, Status badge (Pending/Approved)
  - Boxes connected with lines showing flow
- Estimated timeline: "Expected approval time: 2-3 business days"
- Submit button: Green, large, "Submit Purchase Request"

**User Action:** Reviews approval path, clicks "Submit"

**Final State:**
- Success message: "PR-[ID] submitted successfully!"
- Option to create another request or view in "My PRs"

### Chat Behavior Throughout Workflow

**Always Available (Right Side):**
- Chat input remains active at all steps
- User can ask: "help", "status", "where am i", "Is there an existing contract?"
- System responds with context-aware help

**Step-Specific Responses:**
- Step 0: Search and intent detection
- Step 1: Item selection guidance
- Step 2: Form field updates via natural language
- Step 3-5: Status and help responses

**Visual Feedback:**
- User messages: Blue bubble, right-aligned
- Assistant messages: Gray bubble, left-aligned
- Confirmation messages: Include checkmark ✓ icon
- Error messages: Include warning ⚠ icon

## Contact & Continuation

### Repository
- GitHub: https://github.com/GabrielChitic/PR2POPrototype.git
- Branch: `main`

### To Continue Development from Any Machine
1. Clone the repository
2. Read this DEVELOPMENT_LOG.md
3. Check recent commits: `git log --oneline -10`
4. Run `npm install` and `npm run dev`
5. Start a new Claude Code session
6. Reference this log to provide context: "I'm continuing the PR2PO Prototype project. Here's the context from DEVELOPMENT_LOG.md: [paste relevant sections]"

### Key Context to Provide
- Current step being worked on (if mid-feature)
- Any bugs or issues encountered
- Next feature to implement
- Specific questions or requirements

---

**Last Updated:** 2025-12-30
**Current Version:** v1.0 (Full Step 2 implementation with CLM integration)
**Build Status:** ✅ Passing (TypeScript + Vite)
**Deployment Status:** ✅ Live on Vercel
