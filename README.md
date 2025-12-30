# PR2PO Prototype - Purchase Request to Purchase Order Workflow

An AI-powered procurement workflow system with intelligent chat interface, built with React, TypeScript, and Tailwind CSS.

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/GabrielChitic/PR2POPrototype.git
cd PR2POPrototype

# Install dependencies
npm install

# Start development server
npm run dev
# Opens at http://localhost:5173 (or next available port)

# Build for production
npm run build
```

## ✨ Features

### Smart Chat Interface
- **Natural Language Parsing** - "Need desks by May 20 to Munich office" automatically extracts dates, locations, and context
- **Context-Aware Co-Pilot** - Chat assists with form filling throughout the workflow
- **Intent Detection** - Recognizes goods, services, or free-text requests
- **Command Support** - Help, status, restart commands

### Dynamic Workflow
- **5-Step Process** - Choose Items → Purchase Info → Review → Validation → Approvals
- **3 Request Types** with adaptive Step 2 forms:
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
│   ├── ui/              # Reusable UI components (Button, Input, Card, StatusPill)
│   └── workflow/        # Workflow step components (Step1-5, Stepper)
├── modules/
│   ├── Requester/       # Main workflow module (RequesterModuleV2)
│   ├── Procurement/     # Procurement team view
│   ├── Overview/        # Dashboard
│   └── Settings/        # Settings
├── context/             # Global state management (PRContext)
├── services/            # Search and API services (unifiedSearch)
├── data/                # Mock data (catalog items, contracts)
└── types/               # TypeScript definitions (workflow types)
```

## 📖 Documentation

For complete development history, architecture details, and continuation instructions, see:
- **[DEVELOPMENT_LOG.md](./DEVELOPMENT_LOG.md)** - Comprehensive development documentation with full conversation history
- **[STYLE_GUIDE.md](./STYLE_GUIDE.md)** - UI/UX style guidelines

## 🎯 Example Workflows

### Catalog Goods
```
1. Chat: "Need 5 desks by May 20 to Munich office"
2. System: Searches catalog, extracts date & location
3. Step 1: Select items and quantities
4. Step 2: Quick checkout form (pre-filled)
5. Review & Submit
```

### Services with Contract
```
1. Chat: "SAP consulting services"
2. Step 1: Add service item
3. Step 2: Fill scope, timing, risks
   - CLM shows 3 matching contracts
   - Select "IT Services Framework - Accenture"
   - Upload Statement of Work
4. Review: Shows linked contract
5. Submit
```

### Free-Text Item
```
1. Chat: "Custom signage for Berlin office"
2. No catalog match → Free text form
3. Fill: item details, budget, supplier
4. Step 2: Clarify business need, add specs
5. Upload quote
6. Review & Submit
```

## 🛠️ Tech Stack

- **Frontend:** React 18 + TypeScript
- **Build Tool:** Vite 7
- **Styling:** Tailwind CSS
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
1. **Clone** the repository
2. **Read** [DEVELOPMENT_LOG.md](./DEVELOPMENT_LOG.md) for full context
3. **Install** dependencies: `npm install`
4. **Start** dev server: `npm run dev`
5. **Reference** the log when starting a new Claude Code session

### Key Context to Share with Claude:
```
"I'm continuing the PR2PO Prototype project.
Current state: [describe what you're working on]
Last completed: [reference DEVELOPMENT_LOG.md sections]
Next task: [what you want to implement]"
```

### Important Files:
- `DEVELOPMENT_LOG.md` - Full implementation history
- `src/types/workflow.ts` - Core type definitions
- `src/modules/Requester/RequesterModuleV2.tsx` - Main orchestrator (800+ lines)
- `src/components/workflow/Step2Container.tsx` - Dynamic Step 2 (1000+ lines)

## 🚢 Deployment

**Repository:** https://github.com/GabrielChitic/PR2POPrototype.git

The app auto-deploys to Vercel on every push to `main` branch.

### Manual Deployment
```bash
git add .
git commit -m "Your commit message"
git push origin main
# Vercel automatically detects and deploys
```

## 🧪 Key Implementation Details

### Request Type Detection
The system automatically determines request type based on line items:
- **catalogGoods** - All items are from catalog
- **freeTextGoods** - Has free-text items (no catalog match)
- **servicesOrComplex** - Contains service items (detected by keywords: consulting, training, audit, etc.)

### Step 2 Variant Switching
Single `Step2Container` component with 3 variants:
- **2A (Catalog)** - Minimal friction: delivery, recipient, usage, optional attachments
- **2B (Free-text)** - Clarify need: usage, specs, supplier preference, required attachments
- **2C (Services)** - Comprehensive: scope, timing, justification, delivery model, risks, CLM contracts

### Chat Intelligence
- **Initial parsing:** Extracts dates ("20th May"), locations ("Munich office"), projects ("Project Phoenix")
- **Step 2 co-pilot:** Updates form fields via natural language ("deliver to Berlin", "need by May 20")
- **Contract queries:** "Is there an existing contract?" → Lists CLM contracts with details

### CLM Contract Simulation
Generates 3 mock contracts on Step 2C:
1. Accenture - IT Services Framework (valid until 2027)
2. Deloitte - Professional Services MSA (valid until 2026)
3. PwC - Consulting Framework (expiring 2025)

Selection stored in `draft.selectedContract` and displayed in Step 3 summary.

## 🐛 Troubleshooting

### Build Errors
- Run `npm run build` to check for TypeScript errors
- Common: TS6133 (unused variables) - prefix with `_` or remove

### Dev Server Issues
- Port 5173 in use? Vite auto-assigns next available port
- HMR not working? Restart dev server or clear browser cache

### Git Issues
- Check branch: `git branch`
- Pull latest: `git pull origin main`
- Push fails? Check network and credentials

## 📊 Project Status

**Current Version:** v1.0 - Full Step 2 implementation with CLM integration
**Build Status:** ✅ Passing (TypeScript + Vite)
**Last Updated:** 2025-12-30
**Total Lines:** ~4,800 insertions across 26 files

## 🗺️ Next Steps (Potential)

See [DEVELOPMENT_LOG.md](./DEVELOPMENT_LOG.md) for detailed future work suggestions:
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
