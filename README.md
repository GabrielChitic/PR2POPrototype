# PR→PO Intake Agent Prototype

A chat-based interface for creating and managing Purchase Requisitions (PRs), built as a prototype for the Office of the CFO's Guided Buying initiative.

## Overview

This prototype demonstrates a conversational AI agent that helps employees create purchase requests through natural language. The system interprets user intent, infers context (category, urgency, location), and routes requests to the appropriate backend ERP system.

## Features

- **Chat-Based Interaction**: Natural language interface for all operations
- **Three Core Capabilities**:
  1. **Create PR**: "I need 15 laptops for Bucharest in Q2"
  2. **Check Status**: "Where is PR-0001?"
  3. **List PRs**: "Show all my PRs"
- **Intent Classification**: Automatically categorizes requests (catalog purchase, contract call-off, services, needs sourcing)
- **Context Inference**: Extracts entity, location, category, urgency from free-text
- **Backend Routing**: Routes to SAP_MM, Coupa, Local_ERP_X, or Sourcing_HandOff based on rules
- **Multi-Persona Support**: Switch between personas (Ana Popescu, John Smith) with different default contexts
- **PR Details Panel**: View comprehensive details including classification reasoning, line items, and routing decisions

## Tech Stack

- **Framework**: React + TypeScript + Vite
- **UI Library**: Shadcn/ui (Tailwind CSS + Radix UI)
- **Icons**: Lucide React
- **State Management**: React hooks (no external state library)
- **Storage**: In-memory (browser-based, no backend)

## Project Structure

```
src/
├── components/
│   ├── ui/                 # Base UI components (Button, Card, Input, Select)
│   ├── ChatMessage.tsx     # Chat message bubble component
│   ├── ChatInput.tsx       # Message input field
│   ├── PersonaSelector.tsx # Persona dropdown
│   └── PRDetailsPanel.tsx  # PR details sidebar
├── services/
│   ├── intentClassifier.ts # Intent recognition logic
│   ├── contextInference.ts # Context extraction from messages
│   ├── backendRouter.ts    # Backend system routing rules
│   └── prService.ts        # PR CRUD operations
├── data/
│   └── mockData.ts         # Personas, catalog, contracts
├── types/
│   └── index.ts            # TypeScript type definitions
├── lib/
│   └── utils.ts            # Utility functions
└── App.tsx                 # Main application component
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/GabrielChitic/PR2POPrototype.git
cd Prototype
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

## How to Use

### Creating a Purchase Request

Simply type what you need in natural language:
- "I need 15 laptops for new hires in Bucharest in Q2"
- "We need to renew our marketing agency retainer for next FY"
- "Please raise an RFP for a new payroll system for our German entity"
- "Buy 20 office chairs for the London office next month"

The system will:
- Parse your request
- Classify the intent type
- Infer category, urgency, and other context
- Route to the appropriate backend system
- Create a draft PR and show you what it understood

### Checking PR Status

Ask about a specific PR:
- "Where is PR-0001?"
- "What is the status of PR-3?"
- "Show me PR-0002"

### Listing PRs

View all your PRs:
- "Show all my PRs"
- "List the last 5 PRs"
- "Show all PRs you've created so far"

### Switching Personas

Use the dropdown at the top right to switch between:
- **Ana Popescu** - IT Project Manager (RO01, Bucharest, CEE)
- **John Smith** - Marketing Manager (US01, New York, NA)

The selected persona's defaults (entity, location, region) are used when creating PRs.

## Architecture Highlights

### Intent Classification
Uses keyword matching and regex patterns with confidence scoring. Classifies messages into:
- `catalog_purchase`: Standard catalog items (laptops, monitors, etc.)
- `contract_call_off`: Renewal of existing contracts or retainers
- `services_sow`: SOW-based consulting or professional services
- `needs_sourcing`: RFP/RFQ/tender for new suppliers
- `status_query`: Checking PR status
- `list_query`: Listing PRs

### Context Inference
Extracts from natural language:
- **Category**: IT Hardware, IT Software/SaaS, Marketing Services, etc.
- **Urgency**: low, medium, high (based on keywords like "ASAP", "Q2", "next month")
- **Needed-by date**: Extracted timing information
- **Quantity**: Parsed from numbers in the message

### Backend Routing
Rule-based routing logic:
- IT Hardware + RO01 → SAP_MM
- Marketing Services + US01 → Coupa
- Needs sourcing → Sourcing_HandOff
- Default → Local_ERP_X

### Mock Data
Includes:
- 2 personas with different entities and regions
- Catalog pricing for 5 categories
- 3 mock contracts for call-off scenarios

## Development Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## Deployment to Vercel

This project is ready to deploy to Vercel:

1. Push to GitHub (already configured as origin)
2. Import project in Vercel dashboard
3. Vercel will auto-detect Vite and deploy

## Future Enhancements

- [ ] Add localStorage persistence
- [ ] Implement actual LLM integration for more sophisticated NLP
- [ ] Add file attachment support
- [ ] Multi-line item support in single PR
- [ ] PR editing and approval workflow
- [ ] Backend API integration
- [ ] User authentication
- [ ] Enhanced search and filtering

## License

MIT

---

**Built with**: React, TypeScript, Vite, Tailwind CSS, Shadcn/ui
