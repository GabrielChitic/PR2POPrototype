# PR2PO Prototype - Purchase Request to Purchase Order Workflow

An AI-powered procurement workflow system with intelligent chat interface, built with React, TypeScript, and Tailwind CSS.

> **📖 For AI Assistants:** This README provides a quick overview. For complete development context and detailed implementation history, see **[DEVELOPMENT_LOG.md](./DEVELOPMENT_LOG.md)** - it contains everything an AI needs to continue development seamlessly.

---

## 🤖 AI Context Quick Start (Claude Code / Copilot / Cursor)

**If you're an AI assistant, read this first:**

1. **Full Context Location:** [DEVELOPMENT_LOG.md](./DEVELOPMENT_LOG.md) - Read the "FOR AI ASSISTANTS" section
2. **Current State:** v1.2 - Module 1 complete with golden catalog demo, all workflow stages, deployed on Vercel
3. **Entry Point:** `src/modules/Requester/RequesterModuleV2.tsx` - Main workflow orchestrator
4. **Key Concept:** 5-phase workflow (Phase 0 background + Phases 1-5) with smart chat that parses natural language and auto-fills forms

**Quick Context Prompt for Continuing Work:**
```
"I'm continuing the PR2PO Prototype. I've read DEVELOPMENT_LOG.md.
Current state: v1.2 with Module 1 features - golden catalog demo, natural language parsing,
chat shortcuts, and complete workflow stages 1-5.
Key files: RequesterModuleV2.tsx (orchestrator), Step2Container.tsx (dynamic forms).
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

### Module 1: Golden Catalog Demo Pack
- **Enhanced Catalog** - 5 laptops with full compliance metadata, SKUs, supplier IDs
- **Natural Language Date Parsing** - "in a week", "by April", "next Friday" auto-converts to dates
- **Location Extraction** - "Bucharest", "New York", "Munich" auto-fills location fields
- **Chat Shortcuts** - "cheapest", "fastest delivery", "best offer", "why is this blocked?"
- **Killer Demo Moments** - Proactive suggestions after search results
- **No Double-Entry** - Quantity, location, date extracted from initial message and prefilled
- **Blocked Item Demo** - Lenovo ThinkPad blocked for contractors (compliance demo)

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
│   ├── Requester/       # Main workflow module (RequesterModuleV2)
│   ├── Procurement/     # Procurement team view
│   ├── Overview/        # Dashboard
│   └── Settings/        # Settings
├── context/             # Global state management (PRContext)
├── services/            # Search and API services (unifiedSearch)
├── data/                # Mock data (catalogData, accountingData, contractsData)
└── types/               # TypeScript definitions (workflow types)
```

## 📖 Documentation

For complete development history, architecture details, and continuation instructions, see:
- **[DEVELOPMENT_LOG.md](./DEVELOPMENT_LOG.md)** - Comprehensive development documentation with full conversation history
- **Module 1 Features** - Detailed in Development Log Phase 11

## 🎯 Example Workflows

### Golden Demo: Catalog Goods with Chat Shortcuts
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
Current state: v1.2 - Module 1 complete with golden catalog demo
Last completed: [reference DEVELOPMENT_LOG.md Phase 11-12]
Next task: [what you want to implement]"
```

### Important Files:
- `DEVELOPMENT_LOG.md` - **READ THIS FIRST** - Full implementation history with Module 1 details
- `src/types/workflow.ts` - Core type definitions
- `src/modules/Requester/RequesterModuleV2.tsx` - Main orchestrator (1000+ lines)
- `src/components/workflow/Step2Container.tsx` - Dynamic Phase 2 (1000+ lines)
- `src/data/catalogData.ts` - Golden catalog with 5 laptops
- `src/services/unifiedSearch.ts` - Natural language parsing logic

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

**Current Version:** v1.2 - Module 1 complete with golden catalog demo and all workflow phases
**Build Status:** ✅ Passing (TypeScript + Vite)
**Last Updated:** 2025-01-11
**Recent Features:**
- Golden catalog demo pack with 5 laptops
- Natural language date/location parsing
- Chat shortcuts (cheapest, fastest, best offer)
- Complete workflow Phases 3-5
- My Requests tab in Phase 5
- Vercel deployment fixes (type annotations, path aliases, case sensitivity)

## 🗺️ Next Steps (Potential)

See [DEVELOPMENT_LOG.md](./DEVELOPMENT_LOG.md) for detailed future work suggestions:
- Module 2: Pane visibility and Phase 0 background processing
- Backend API integration
- Real CLM connection
- Authentication & authorization
- Advanced search (Elasticsearch, semantic search)
- Mobile responsive improvements
- Analytics & reporting dashboard

## 📄 License

[Your License Here]

## 👤 Contact

Gabriel Chitic - gabriel.chitic@uipath.com

---

**Repository:** https://github.com/GabrielChitic/PR2POPrototype.git
**Documentation:** See [DEVELOPMENT_LOG.md](./DEVELOPMENT_LOG.md) for complete history
**Deployment:** Auto-deploys to Vercel from `main` branch
