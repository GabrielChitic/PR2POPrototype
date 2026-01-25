# PR2PO Prototype - Purchase Request to Purchase Order Workflow

An AI-powered procurement workflow system with intelligent chat interface, built with React, TypeScript, and Tailwind CSS.

> **📖 For AI Assistants:** This README provides a quick overview. For complete development context and detailed implementation history, see **[DEVELOPMENT_LOG.md](./DEVELOPMENT_LOG.md)** - it contains everything an AI needs to continue development seamlessly.

---

## 🤖 AI Context Quick Start (Claude Code / Copilot / Cursor)

**If you're an AI assistant, read this first:**

1. **Quick Reference:** [AI_QUICK_REFERENCE.md](./AI_QUICK_REFERENCE.md) - **START HERE!** Fast context load (~10 min)
2. **R1 Documentation:** [DEVELOPMENT_LOG.md](./DEVELOPMENT_LOG.md) - Journey R1 (Catalog) implementation history
3. **R2 Documentation:** [R2_JOURNEY_DOCUMENTATION.md](./R2_JOURNEY_DOCUMENTATION.md) - Journey R2 (Non-Catalog) complete docs
4. **Procurement Module:** See [Procurement Module section](#-procurement-module-buyerprocurement-team-view) below - PR/PO workbench docs
5. **Current State:** v2.1 - Requester Module (R1 + R2) + Procurement Module complete
6. **Entry Points:**
   - **Requester:** `src/modules/Requester/RequesterModuleV2.tsx` - Workflow orchestrator
   - **Procurement:** `src/modules/Procurement/ProcurementModule.tsx` - PR/PO workbench
7. **Key Concepts:**
   - **Journey R1 (Catalog):** 5-phase workflow with smart catalog search
   - **Journey R2 (Non-Catalog):** 5-phase workflow for quote/PDF-based procurement with buyer action step
   - **Procurement Workbench:** PR/PO management with BBraun R2 Happy Flow (operational procurement)
   - **Journey Separation:** All workflows fully isolated and independently functional

**Quick Context Prompt for Continuing Work:**
```
"I'm continuing the PR2PO Prototype. I've read AI_QUICK_REFERENCE.md and README.md.
Current state: v2.1 - Requester Module (R1 + R2) + Procurement Module complete.
- Requester R1: Golden catalog demo, natural language parsing, chat shortcuts.
- Requester R2: Quote extraction, buyer action step, Denmark data, EUR support.
- Procurement: PR/PO workbench, BBraun R2 Happy Flow, validation cockpit, dispatch/EKES.
Key files: RequesterModuleV2.tsx (requester), ProcurementModule.tsx (workbench),
PRPOFullDetail.tsx (detail views), allProcurementData.ts (data aggregator).
Build status: Passing. Let's work on [describe your task]."
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js:** Version 18.x or 20.x (check with `node --version`)
- **npm:** Version 9+ (check with `npm --version`)
- **Git:** For cloning and version control
- **Operating System:** Windows, macOS, or Linux
- **Internet Connection:** Required for npm install and Vercel deployment

### Installation & Setup

```bash
# 1. Clone the repository
git clone https://github.com/GabrielChitic/PR2POPrototype.git
cd PR2POPrototype

# 2. Verify Node version (must be 18+ or 20+)
node --version
# If wrong version, install from nodejs.org or use nvm

# 3. Install dependencies (takes 1-2 minutes)
npm install

# 4. Start development server
npm run dev
# Output: "Local: http://localhost:5173/"
# Opens at http://localhost:5173 (or next available port like 5174)

# 5. Build for production (verify everything works)
npm run build
# Must complete with no errors
```

### First-Time Setup Checklist
- [ ] Node 18+ or 20+ installed
- [ ] Git installed and configured
- [ ] Repository cloned successfully
- [ ] `npm install` completed without errors
- [ ] `npm run dev` starts server and opens in browser
- [ ] `npm run build` completes successfully
- [ ] Read [DEVELOPMENT_LOG.md](./DEVELOPMENT_LOG.md) for full context

## ✨ Features

### Journey R1: Golden Catalog Demo Pack
- **Enhanced Catalog** - 5 laptops with full compliance metadata, SKUs, supplier IDs
- **Natural Language Date Parsing** - "in a week", "by April", "next Friday" auto-converts to dates
- **Location Extraction** - "Bucharest", "New York", "Munich" auto-fills location fields
- **Chat Shortcuts** - "cheapest", "fastest delivery", "best offer", "why is this blocked?"
- **Killer Demo Moments** - Proactive suggestions after search results
- **No Double-Entry** - Quantity, location, date extracted from initial message and prefilled
- **Blocked Item Demo** - Lenovo ThinkPad blocked for contractors (compliance demo)

### Journey R2: Non-Catalog / PDF-First Workflow (NEW!)
- **Quote Extraction** - Upload quote PDFs and extract line item details (demo stub with hardcoded data)
- **Denmark-Specific Master Data** - 6 cost centers, 5 GL accounts, 3 commodity groups for Aarhus/Copenhagen
- **Buyer Action Step** - Dedicated procurement review step after submission (validates quote, supplier, coding)
- **R2-Specific Policy Checks** - 7 checks including supplier active, currency allowed, quote validity
- **Site Selection** - Dropdown with 3 Aarhus/Copenhagen sites for delivery
- **Complete Separation** - Journey R2 fully isolated from R1 (no breaking changes to catalog flow)
- **Currency Support** - EUR display throughout (vs. USD for R1)
- **Enhanced Tracking** - SLA field, buyer action timeline, supplier info in My Requests

### Smart Chat Interface
- **Natural Language Parsing** - "15 laptops for new contractors in Bucharest by April" extracts all metadata
- **Context-Aware Co-Pilot** - Chat assists with form filling throughout the workflow
- **Intent Detection** - Recognizes goods, services, or free-text requests
- **Command Support** - Help, status, restart, why blocked commands
- **Chat Shortcuts** - Deterministic "cheapest", "fastest", "best offer" selection

### Complete 5-Phase Workflow
- **Phase 0: Background Processing** - Parse user intent, extract metadata (invisible to user)
- **Phase 1: Shop & Select** - Choose catalog items, adjust quantities, add free-text items
- **Phase 2: Delivery & Details** - 3 dynamic variants (catalog/free-text/services) with prefilled data
- **Phase 3: Accounting & Policy Checks** - Commodity groups, GL accounts, cost centers, policy validation
- **Phase 4: Review & Submit** - Comprehensive summary with linked contracts and attachments
- **Phase 5: Track & Approvals** - Timeline view, My Requests tab, approval tracking

### Dynamic Workflow
- **3 Request Types** with adaptive Phase 2 forms:
  - **Catalog Goods** - Quick checkout for catalog items
  - **Free-Text Goods** - Custom item requests
  - **Services** - Comprehensive service procurement

### CLM Integration
- **Automatic Contract Suggestions** - Fetches relevant contracts from CLM
- **One-Click Selection** - Link existing contracts to requests
- **Contract Details** - View supplier, validity, category, and relevance

### File Management
- **Multi-File Upload** - Drag & drop for SoW, proposals, quotes
- **File Metadata Tracking** - Size, type, upload date
- **Conditional Requirements** - Automatic alerts for required attachments

## 🏗️ Architecture

```
src/
├── components/
│   ├── ui/              # Reusable UI components (button, input, card, etc.)
│   └── workflow/        # Workflow phase components (Step1-5, Stepper, MyRequestsView)
├── modules/
│   ├── Requester/       # Requester workflow (Journey R1 + R2)
│   ├── Procurement/     # Procurement workbench (PR/PO management, BBraun demo)
│   ├── Overview/        # Dashboard
│   └── Settings/        # Settings
├── context/             # Global state management (PRContext)
├── services/            # Search and API services (unifiedSearch)
├── data/                # Mock data (catalogData, accountingData, contractsData)
└── types/               # TypeScript definitions (workflow types)
```

## 📖 Documentation

For complete development history, architecture details, and continuation instructions, see:
- **[DEVELOPMENT_LOG.md](./DEVELOPMENT_LOG.md)** - Comprehensive development documentation for Journey R1 (Catalog)
- **[R2_JOURNEY_DOCUMENTATION.md](./R2_JOURNEY_DOCUMENTATION.md)** - Complete documentation for Journey R2 (Non-Catalog / PDF-First)
- **[Procurement Module](#-procurement-module-buyerprocurement-team-view)** - **NEW!** PR/PO workbench, BBraun R2 Happy Flow, validation cockpit (see below)
- **[src/data/README.md](./src/data/README.md)** - Data architecture and circular dependency prevention
- **[DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)** - UI component guidelines and shadcn/ui usage
- **[STYLE_GUIDE.md](./STYLE_GUIDE.md)** - Code style conventions and best practices

## 🎯 Example Workflows

### Journey R1: Golden Demo - Catalog Goods with Chat Shortcuts
```
1. Chat: "I need 15 laptops for new contractors in Bucharest in a week"
2. System:
   - Extracts: quantity=15, location="Bucharest", timeframe="in a week"
   - Searches catalog
   - Shows 4 allowed laptops + 1 blocked (Lenovo ThinkPad - blocked for contractors)
   - Suggests: "Want cheapest, fastest delivery, or best offer?"
3. User: "cheapest"
4. System: Auto-selects Dell Latitude 3420 ($1100), quantity 15, adds to cart
5. Phase 2: Form prefilled with Bucharest, need-by date (1 week from now)
6. User: "why is the Lenovo blocked?"
7. System: "Lenovo ThinkPad X1 Carbon is blocked: Not approved for contractor use per IT policy"
8. Continue to Phase 3-5 and submit
```

### Services with Contract
```
1. Chat: "SAP consulting services"
2. Phase 1: Add service item
3. Phase 2: Fill scope, timing, risks
   - CLM shows 3 matching contracts
   - Select "IT Services Framework - Accenture"
   - Upload Statement of Work
4. Phase 3: Shows linked contract
5. Phase 4: Review & Submit
6. Phase 5: Track approvals
```

### Free-Text Item
```
1. Chat: "Custom signage for Berlin office"
2. No catalog match → Free text form
3. Fill: item details, budget, supplier
4. Phase 2: Clarify business need, add specs, prefilled location="Berlin"
5. Upload quote
6. Review & Submit
```

### Journey R2: Non-Catalog from Quote (SuperSafe Demo)
```
1. Chat: "I need 50 warning vests for Aarhus site"
2. Stage 1: Quote extraction shows:
   - Item: Warning vest YELLOW w/reflex C470 S/M
   - Supplier: Manufacturing A/S
   - Qty: 50, Unit Price: EUR 35.00, Total: EUR 1,750.00
   - Quote: Q-2026-0113
   - Compact strip (no duplication)
3. Stage 2: Delivery & Details (3 cards)
   - Card A: Select AAR-DC-01 site, need-by date, instructions
   - Card B: Recipient prefilled (Ana Popescu)
   - Card C: Business reason (required)
4. Stage 3: Accounting & Policy Checks
   - Prefilled: SAFETY-PPE, GL 615200, CC-DK-AAR-MAINT
   - 7 policy checks (all pass)
   - Entity: UIPATH-RO
5. Stage 4: Review & Submit
   - Readiness verdict at top
   - Delivery & Recipient section FIRST (with business reason)
   - Line Items, Accounting, Evidence sections
   - All auto-expanded
6. Stage 5: Track & Approvals
   - PR-9xxx created
   - Timeline: Submitted → Buyer action (In progress) → Manager approval → ...
   - SLA: "On track"
7. My Requests: "Warning vests — Aarhus" • EUR 1,750 • Buyer action
```

### Procurement Module: BBraun R2 Happy Flow (Operational Procurement)
```
1. PR Workbench: View PR-4546245893
   - Status: Ready for PO
   - Material: PL568T (Surgical Clips)
   - Supplier: AESCULAP
   - Amount: EUR 140,940.80
   - All approvals complete (3-level workflow)

2. Open PR Detail → Validation Cockpit shows:
   ✅ 11 checks passed (cost, quantity, dates, specs, master data)
   ✅ Commercial conditions defaulted from info record 5301133479
   ✅ Readiness evaluation: Ready for conversion

3. Click "Convert to PO" button
   → PO-4516638113 created
   → PR transitions to "Handoff to PO"
   → PR header shows: "Linked PO: PO-4516638113" chip
   → Toast: "PO Created Successfully"

4. PO Workbench: View PO-4516638113
   - Status: Ready to send
   - Header shows: "Source PR: PR-4546245893" chip
   - Validation cockpit: All checks pass
   - Release/Approval Trace: 3-level approval (pre-recorded demo)

5. Click "Send PO (demo)" button
   → Dispatch to AESCULAP via EDI/IDOC
   → EKES confirmation received (simulated 2h later)
   → Confirmed qty: 2,288 PAK (no deviation)
   → Confirmed delivery: 120 days (within tolerance)
   → Status: "Confirmed · Awaiting delivery"

6. Audit Trail (both PR and PO):
   - Evidence links: Info Record 5301133479, Historical POs (18 on file), EKES Confirmation AB
   - Full traceability: Conversion → Dispatch → Confirmation events
   - Clickable chips for navigation between linked objects

7. Demo Reset (Settings dropdown):
   - Reset BBraun PR to "Ready for PO" state
   - Remove created PO
   - Ready to demo again
```

## 🛠️ Tech Stack

- **Frontend:** React 18 + TypeScript
- **Build Tool:** Vite 7
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui (button, card, input, select, etc.)
- **Icons:** Lucide React
- **Deployment:** Vercel (auto-deploy from main)

## 📦 Available Scripts

```bash
npm run dev      # Start development server with HMR
npm run build    # TypeScript compile + Vite build
npm run preview  # Preview production build
npm run lint     # Run ESLint (if configured)
```

## 🔄 Continuing Development

### From Any Machine:
1. **Clone** the repository: `git clone https://github.com/GabrielChitic/PR2POPrototype.git`
2. **Navigate** to directory: `cd PR2POPrototype`
3. **Read** [DEVELOPMENT_LOG.md](./DEVELOPMENT_LOG.md) for full context (CRITICAL - contains all implementation details)
4. **Install** dependencies: `npm install`
5. **Start** dev server: `npm run dev`
6. **Test** build: `npm run build` (must pass with no errors)
7. **Reference** the log when starting a new Claude Code session

### Key Context to Share with Claude:
```
"I'm continuing the PR2PO Prototype project.
Current state: v2.1 - Requester Module (R1 + R2) + Procurement Module complete
Documentation: README.md (Procurement specs), AI_QUICK_REFERENCE.md, DEVELOPMENT_LOG.md, R2_JOURNEY_DOCUMENTATION.md
Last completed: Procurement Module with BBraun R2 Happy Flow (Jan 23, 2026)
Modules: Requester (catalog/non-catalog journeys) + Procurement (PR/PO workbench)
Next task: [what you want to implement]"
```

### Important Files:

**Documentation:**
- `DEVELOPMENT_LOG.md` - Full implementation history with Module 1 details (R1)
- `R2_JOURNEY_DOCUMENTATION.md` - Complete R2 (Non-Catalog) journey documentation
- `README.md` (this file) - Includes Procurement Module specifications

**Requester Module (Journey R1 + R2):**
- `src/types/workflow.ts` - Core type definitions (includes R2 types: JourneyType, QuoteDetails)
- `src/modules/Requester/RequesterModuleV2.tsx` - Main orchestrator (1400+ lines, includes R2 lifecycle)
- `src/components/workflow/Step1ChooseItems.tsx` - Stage 1 with R2 quote extraction
- `src/components/workflow/Step2Container.tsx` - Dynamic Phase 2 (1200+ lines, includes R2 variant)
- `src/components/workflow/Step3AccountingChecks.tsx` - Stage 3 with R2 accounting (includes DK data)
- `src/components/workflow/Step4ReviewSubmit.tsx` - Stage 4 review (includes R2 accordion layout)
- `src/components/workflow/Step5TrackApprovals.tsx` - Stage 5 tracking (includes R2 buyer action)
- `src/data/catalogData.ts` - Golden catalog with 5 laptops (R1)
- `src/data/accountingData.ts` - Accounting master data (includes Denmark data for R2)
- `src/services/unifiedSearch.ts` - Natural language parsing logic

**Procurement Module (PR/PO Workbench):**
- `src/modules/Procurement/ProcurementModule.tsx` - Main workbench (1300+ lines, dual PR/PO views)
- `src/components/PRPOFullDetail.tsx` - Detail view (1700+ lines, validation cockpit, actions)
- `src/data/procurementData.ts` - Base PR/PO types and demo data (800+ lines)
- `src/data/bbraunDemoData.ts` - BBraun-specific demo data (800+ lines)
- `src/data/allProcurementData.ts` - Data aggregator (prevents circular dependencies)
- `src/data/readiness.ts` - PR readiness evaluation logic
- `src/data/conversion.ts` - PR→PO conversion mapping with checklist
- `src/data/auditModel.ts` - Enhanced audit events with evidence links
- `src/data/bbDemoReset.ts` - Demo reset functionality

## 🚢 Deployment

**Repository:** https://github.com/GabrielChitic/PR2POPrototype.git
**Deployment Platform:** Vercel
**Deployment Method:** Auto-deploy on push to `main` branch
**Live URL:** [Check Vercel dashboard for URL]

### Vercel Configuration

**Framework Preset:** Vite
**Build Command:** `npm run build`
**Output Directory:** `dist`
**Install Command:** `npm install`
**Node Version:** 18.x (set in Vercel dashboard)

### Important Deployment Notes
- **Case-Sensitive Imports:** UI components use lowercase filenames (button.tsx, not Button.tsx) for Linux compatibility
- **No Path Aliases:** All imports use relative paths (../../lib/utils) not path aliases (@/) for Vercel compatibility
- **Type Annotations:** All event handlers have explicit type annotations (React.ChangeEvent<HTMLInputElement>)

The app auto-deploys to Vercel on every push to `main` branch. Vercel automatically:
1. Detects the push to GitHub
2. Runs `npm install`
3. Runs `npm run build` (TypeScript compile + Vite build)
4. Deploys the `dist` folder to production

### Manual Deployment
```bash
# 1. Make your changes
git add .
git commit -m "feat: your feature description"

# 2. Push to main (triggers auto-deploy)
git push origin main

# 3. Check Vercel dashboard for deployment status
# Usually takes 1-2 minutes to build and deploy
```

### Deployment Troubleshooting
See [DEVELOPMENT_LOG.md](./DEVELOPMENT_LOG.md) Phase 12 for complete Vercel deployment fix history:
- TypeScript implicit 'any' type errors
- Module resolution errors with path aliases
- Case sensitivity issues with component filenames

## 🧪 Key Implementation Details

### Golden Catalog Dataset
5 laptops with full metadata:
1. **Dell Latitude 5430** - $1200, 5 days, preferred
2. **HP EliteBook 840 G9** - $1350, 10 days, non-preferred
3. **Lenovo ThinkPad X1 Carbon** - $1400, 7 days, **BLOCKED** (contractor policy)
4. **Dell Latitude 3420** - $1100, 14 days, preferred (cheapest)
5. **Acer Aspire 5** - $950, 12 days, non-preferred

Each includes: SKU, supplier ID, contract status, compliance flags, blocked reasons

### Natural Language Processing
- **Date Parsing:** "in a week" → +7 days, "by April" → last day of April, "next Friday" → upcoming Friday
- **Location Extraction:** Detects cities: Bucharest, New York, London, Paris, Munich, Prague, etc.
- **Quantity Inference:** "15 laptops" → quantity 15, "five desks" → quantity 5
- **Context Extraction:** Parses usage, projects, recipients from free-form text

### Chat Shortcuts (Deterministic)
- **"cheapest"** → Selects lowest price allowed item
- **"fastest delivery"** → Selects shortest lead time item
- **"best offer"** → Deterministic scoring: preferred supplier (20pts) + low price (30pts) + fast delivery (20pts) + valid contract (15pts)
- **"why is this blocked?"** → Explains compliance blocking reason

### Request Type Detection
The system automatically determines request type based on line items:
- **catalogGoods** - All items are from catalog
- **freeTextGoods** - Has free-text items (no catalog match)
- **servicesOrComplex** - Contains service items (detected by keywords: consulting, training, audit, etc.)

### Phase 2 Variant Switching
Single `Step2Container` component with 3 variants:
- **2A (Catalog)** - Minimal friction: delivery, recipient, usage, optional attachments
- **2B (Free-text)** - Clarify need: usage, specs, supplier preference, required attachments
- **2C (Services)** - Comprehensive: scope, timing, justification, delivery model, risks, CLM contracts

### Chat Intelligence
- **Initial parsing:** Extracts dates ("in a week"), locations ("Bucharest"), quantities ("15 laptops")
- **Phase 2 co-pilot:** Updates form fields via natural language ("deliver to Berlin", "need by May 20")
- **Contract queries:** "Is there an existing contract?" → Lists CLM contracts with details
- **Proactive suggestions:** After search: "Want cheapest, fastest delivery, or best offer?"

### CLM Contract Simulation
Generates 3 mock contracts in Phase 2C (Services):
1. Accenture - IT Services Framework (valid until 2027)
2. Deloitte - Professional Services MSA (valid until 2026)
3. PwC - Consulting Framework (expiring 2025)

Selection stored in `draft.selectedContract` and displayed in Phase 4 summary.

## 🐛 Troubleshooting

### Build Errors
- Run `npm run build` to check for TypeScript errors
- Common: TS6133 (unused variables) - prefix with `_` or remove
- Common: TS7006 (implicit 'any' type) - add explicit type annotations
- Common: TS2307 (module not found) - check relative import paths

### Dev Server Issues
- Port 5173 in use? Vite auto-assigns next available port
- HMR not working? Restart dev server or clear browser cache

### Git Issues
- Check branch: `git branch`
- Pull latest: `git pull origin main`
- Push fails? Check network and credentials

### Vercel Deployment Fails
See [DEVELOPMENT_LOG.md](./DEVELOPMENT_LOG.md) Phase 12 for complete fix history:
1. Check Vercel build logs for specific error
2. Verify `npm run build` passes locally
3. Ensure all imports use relative paths (no `@/` aliases)
4. Verify UI component filenames are lowercase (button.tsx not Button.tsx)
5. Check all event handlers have explicit type annotations

## 📊 Project Status

**Current Version:** v2.1 - Requester Module (R1 + R2) + Procurement Module complete
**Build Status:** ✅ Passing (TypeScript + Vite)
**Last Updated:** 2026-01-23
**Recent Features:**
- **Procurement Module Complete** - PR/PO workbench with BBraun R2 Happy Flow (NEW!)
  - Dual workbench (PR + PO management)
  - BBraun operational procurement demo (PL568T surgical clips, EUR 140K)
  - PR→PO conversion with readiness evaluation
  - Dispatch flow with EKES supplier confirmation
  - Validation cockpit with 11 checks
  - Audit trail with evidence links (info records, PO history, EKES confirmations)
  - Traceability: PR↔PO bidirectional linking
  - Demo reset functionality
  - Safety guardrails (duplicate prevention, state validation)
- **Journey R2 Complete** - Non-catalog workflow with quote extraction, buyer action step
- Denmark-specific master data (6 cost centers, 5 GL accounts, 3 commodity groups)
- Complete journey separation (R1 and R2 fully isolated)
- Golden catalog demo pack with 5 laptops (R1)
- Natural language date/location parsing (R1)
- Chat shortcuts (cheapest, fastest, best offer) (R1)
- Complete workflow Phases 1-5 (both journeys)
- My Requests tab in Phase 5 (both journeys)
- Vercel deployment ready

## 🏢 Procurement Module (Buyer/Procurement Team View)

### Overview

The **Procurement Module** (`src/modules/Procurement/ProcurementModule.tsx`) is the operational workbench for buyers and procurement specialists to process Purchase Requests (PRs) and manage Purchase Orders (POs). This module implements dual workbenches with intelligent triage, validation cockpits, and demo flows including the **BBraun R2 Happy Flow** for operational procurement.

### Module Architecture

```
src/modules/Procurement/
└── ProcurementModule.tsx    # Main procurement workbench (1300+ lines)

src/components/
└── PRPOFullDetail.tsx        # Detail view for PR/PO (1700+ lines)

src/data/
├── procurementData.ts        # Base PR/PO types and demo data
├── bbraunDemoData.ts         # BBraun-specific demo data
├── allProcurementData.ts     # Combined data aggregator (prevents circular deps)
├── readiness.ts              # PR readiness evaluation logic
├── conversion.ts             # PR→PO conversion mapping
├── auditModel.ts             # Enhanced audit events with evidence links
└── bbDemoReset.ts            # Demo reset functionality
```

### Key Components

#### 1. **Dual Workbench Interface**
- **PR Workbench**: Process incoming purchase requests
- **PO Workbench**: Manage purchase orders (dispatch, confirmation, change management)
- **Intelligent Filtering**: Views for "Attention Needed", "Unassigned", "SLA Risk", "My Queue"
- **Smart Triage**: AI-powered chat assistant for workbench navigation

#### 2. **PR Workbench Features**
- **Phase Tracking**: Gatekeep → Reviews → Approvals → Ready for PO → Handoff
- **Blocker Detection**: Automatic identification of incomplete fields
- **Validation Cockpit**: Real-time checks for mandatory fields, compliance
- **Convert to PO**: One-click conversion with readiness evaluation
- **Assignment Management**: Assign to buyers or resolver queues

#### 3. **PO Workbench Features**
- **Lifecycle Management**: Create/Post → Dispatch → Confirm → Change → Close
- **Dispatch Flow**: Send POs to suppliers via EDI/IDOC (simulated)
- **Supplier Confirmation (EKES)**: Receive and validate supplier acknowledgments
- **Change Management**: Handle PO amendments and revisions
- **Release/Approval Trace**: Multi-level approval workflow with SLA tracking

### BBraun R2 Happy Flow (Operational Procurement)

The **BBraun demo** showcases end-to-end operational procurement for surgical supplies:

#### Demo Scenario
- **Material**: PL568T - CLIP LIGATURE MED.LARGE (Surgical Clips)
- **Supplier**: 1165336 (AESCULAP)
- **Quantity**: 2,288 PAK (274,560 pieces - fixed lot sizing)
- **Value**: EUR 140,940.80 (High-value procurement)
- **Plant**: BBraun-DE01 Melsungen

#### Flow Steps

**Step 1: PR Ready for Conversion**
- PR-4546245893 in "Ready for PO" state
- All approvals complete (3-level: Operational → Purchasing → Compliance)
- Readiness checks passed (material, quantity, pricing, accounting)
- Linked PO chip shown in header once converted

**Step 2: Convert PR to PO**
- Click "Convert to PO" button in PR detail view
- System validates PR readiness (mandatory fields, approvals)
- Creates PO-4516638113 with deterministic mapping:
  - Pricing from info record 5301133479
  - Vendor, plant, purchasing group mapped
  - Accounting assignment preserved
  - Audit trail with evidence links
- PR transitions to "Handoff to PO" phase
- PO appears in PO workbench

**Step 3: PO Validation**
- **Validation Cockpit** shows 11 checks (all pass):
  - Cost & Conditions: Price matches info record, amount calculation correct, commercial conditions defaulted
  - Quantity: Lot sizing policy, UoM sanity checks
  - Dates: Lead time plausibility (120 days)
  - Specifications: Material PL568T valid
  - Master Data: Vendor active, purchasing group, plant, commodity group, accounting assignment
- **Release/Approval Trace**: 3-level approval (pre-recorded demo)
  - Operational Buyer → Head of Purchasing → Compliance Manager

**Step 4: Dispatch to Supplier**
- Click "Send PO (demo)" button
- PO transmitted to AESCULAP via EDI/IDOC (simulated)
- Audit trail records dispatch events
- Automatic EKES confirmation received (simulated 2 hours later)
  - Confirmation type: AB (Acknowledgment)
  - Confirmed qty: 2,288 PAK (no deviation)
  - Confirmed delivery: 120 days (within tolerance)
  - Delta checks passed
- PO status: "Dispatched · Awaiting confirmation" → "Confirmed · Awaiting delivery"

**Step 5: Traceability**
- PR header shows "Linked PO: PO-4516638113" chip (clickable)
- PO header shows "Source PR: PR-4546245893" chip (clickable)
- Full audit trail on both PR and PO with evidence links
- Evidence chips: Info Record 5301133479, Historical POs (18 on file), EKES Confirmation AB

### Data Model

#### ProcurementPR Interface
```typescript
interface ProcurementPR {
  id: string;
  prNumber: string;
  title: string;
  phaseStep: string;              // Workflow phase
  topBlocker: string | null;      // Primary blocker if any
  amount: number;
  currency: string;
  requester: string;
  assigneeOrQueue: string;
  linkedPoNumber?: string;        // PO created from this PR

  // Accounting
  deliveryLocation: string;
  needByDate: string;
  costCenter: string;
  glAccount: string;
  commodityGroup: string;

  // Line items
  lineItems: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
  }>;

  // Audit trail
  auditTrail: AuditEvent[];
}
```

#### ProcurementPO Interface
```typescript
interface ProcurementPO {
  id: string;
  poNumber: string;
  supplier: string;
  phaseStep: string;              // Workflow phase
  amount: number;
  currency: string;
  sourcePrNumber?: string;        // PR that created this PO

  // Dispatch
  dispatchMethod: string;         // EDI/IDOC, Email, Portal, etc.
  dispatchStatus: string;         // Ready to send, Sent, Failed

  // Confirmation (EKES)
  confirmationStatus: string;     // WAITING, RECEIVED, DEVIATION
  confirmedQuantity?: number;
  confirmedDeliveryDate?: string;
  confirmationNote?: string;

  // Validation
  failureReason?: string;

  // Audit trail
  auditTrail: AuditEvent[];
}
```

#### AuditEvent with Evidence Links
```typescript
interface AuditEvent {
  id: string;
  timestamp: Date;
  action: string;
  actor: string;
  details?: string;
  keyDiff?: string;               // Key changes summary
  evidenceLinks?: AuditEvidence[]; // NEW: Evidence attachments
}

interface AuditEvidence {
  type: 'info-record' | 'po-history' | 'ekes-confirmation' | 'rule-snapshot' | 'document';
  label: string;
  reference: string;
  onClick?: () => void;
}
```

### Helper Modules

#### 1. **Readiness Evaluation** (`src/data/readiness.ts`)
Deterministic PR readiness checks:
```typescript
evaluatePrReadiness(pr: ProcurementPR): ReadinessResult {
  // Checks: material, quantity, UOM, delivery date, commodity, cost center, location
  // Returns: isReadyForPo, blockers[], topBlocker, readinessChecks[]
}
```

#### 2. **PR→PO Conversion** (`src/data/conversion.ts`)
Mapping contract with checklist validation:
```typescript
convertBBraunPrToPo(pr: ProcurementPR): ConversionResult {
  // Creates PO with NO blank fields
  // Checklist: PO number, vendor, plant, pricing, info record, accounting
  // Returns: { po: ProcurementPO, auditEvents: AuditEvent[] }
}
```

#### 3. **Audit Trail Hardening** (`src/data/auditModel.ts`)
Enhanced audit events with evidence:
```typescript
createConversionAudit(prNumber, poNumber): EnhancedAuditEvent[]
createDispatchAudit(poNumber): EnhancedAuditEvent[]
createConfirmationAudit(): EnhancedAuditEvent[]
```

#### 4. **Demo Reset** (`src/data/bbDemoReset.ts`)
Reset BBraun demo to initial state:
```typescript
resetBBraunPR(currentPr): ProcurementPR      // Reset to "Ready for PO"
removeBBraunPO(poList): ProcurementPO[]     // Remove created PO
isBBraunDemoInitial(pr, poList): boolean    // Check if in initial state
```

### Safety Guardrails

**Convert to PO:**
- ✅ Disabled if PR not in "Ready for PO" state
- ✅ Readiness evaluation blocks conversion if mandatory fields missing
- ✅ Duplicate PO prevention
- ✅ Toast notification explaining blockers

**Dispatch PO:**
- ✅ Only visible when dispatchStatus = "Ready to send"
- ✅ Prevents duplicate dispatch with toast error
- ✅ Automatic state sync across workbenches

### Evidence & Traceability

**Evidence Links in Audit Trail:**
- Info Record 5301133479 (pricing source)
- Historical POs (18 on file for material PL568T)
- EKES Confirmation AB (supplier acknowledgment)
- Rule snapshots (approval matrix, policy versions)

**Clickable Navigation:**
- PR ↔ PO bidirectional linking via header chips
- Evidence chips in audit trail
- Contract references

### Technical Implementation Notes

**Circular Dependency Prevention:**
- Use `import type` for type-only imports
- Always import from `allProcurementData.ts` in components
- See `src/data/README.md` for details

**State Management:**
- In-memory state with React useState hooks
- Workbench tables auto-update via state changes
- Detail views sync with workbench state

**Demo Simulation:**
- No real backend - all simulated client-side
- EKES confirmation instant (simulated 2-hour delay in audit trail)
- Approval workflows pre-recorded

### Key Files

| File | Lines | Purpose |
|------|-------|---------|
| `ProcurementModule.tsx` | 1300+ | Main workbench with PR/PO tables |
| `PRPOFullDetail.tsx` | 1700+ | Detail view with validation, actions |
| `procurementData.ts` | 800+ | Base types and demo data |
| `bbraunDemoData.ts` | 800+ | BBraun-specific data and workflows |
| `allProcurementData.ts` | 40 | Data aggregator (prevents circular deps) |
| `readiness.ts` | 150+ | PR readiness evaluation |
| `conversion.ts` | 200+ | PR→PO conversion mapping |
| `auditModel.ts` | 150+ | Enhanced audit with evidence |
| `bbDemoReset.ts` | 80+ | Demo reset functionality |

## 🗺️ Next Steps (Potential)

See [DEVELOPMENT_LOG.md](./DEVELOPMENT_LOG.md) and [R2_JOURNEY_DOCUMENTATION.md](./R2_JOURNEY_DOCUMENTATION.md) for detailed future work suggestions:

**Journey R1 (Catalog):**
- Module 2: Pane visibility and Phase 0 background processing
- Advanced catalog search (filters, facets, semantic search)
- Mobile responsive improvements

**Journey R2 (Non-Catalog):**
- Real quote extraction (OCR/AI integration)
- Advanced buyer action workflow (queue management, SLA tracking)
- Multi-quote comparison
- Supplier onboarding automation
- Real-time contract validity checks

**Shared:**
- Backend API integration
- Real CLM connection
- Authentication & authorization
- Analytics & reporting dashboard (R1 vs R2 adoption, cycle times)

## 📄 License

[Your License Here]

## 👤 Contact

Gabriel Chitic - gabriel.chitic@uipath.com

---

**Repository:** https://github.com/GabrielChitic/PR2POPrototype.git
**Documentation:** See [DEVELOPMENT_LOG.md](./DEVELOPMENT_LOG.md) for complete history
**Deployment:** Auto-deploys to Vercel from `main` branch
