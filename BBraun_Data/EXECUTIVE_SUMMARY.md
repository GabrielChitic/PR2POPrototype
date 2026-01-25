# BBraun SAP Data - Executive Summary

**Date:** 2026-01-22
**Total Records:** 795,698 rows across 20 SAP tables
**Files Processed:** 24 files successfully converted to Parquet format

---

## 📊 Overview

Successfully cataloged, converted, and analyzed BBraun's SAP procurement data extracts. All files have been converted to efficient Parquet format for fast querying and analysis.

### Conversion Summary
- **Files Scanned:** 24 SAP extracts (.xls, .xlsx, .csv)
- **Files Converted:** 24 (100% success rate)
- **SAP Tables Identified:** 20 distinct tables
- **Total Data Volume:** ~796K rows
- **Storage Format:** Parquet with Snappy compression
- **Location:** `BBraun_Data/parquet/` (mirrored folder structure)

---

## 🔑 Key Tables for PR→PO Procurement Flow

### **Core Transactional Data**

#### 1. **EBAN - Purchase Requisitions** ⭐ CRITICAL
- **Rows:** 174,600 (largest transactional dataset)
- **Purpose:** Starting point of procurement - PR requests from business users
- **Key Fields:**
  - `Mandant` - Client
  - `Banf` - PR number (BANFN)
  - `Banf-Position` - PR item
  - `Material` - Material number (MATNR)
  - `Werk` - Plant (WERKS)
  - `Menge` - Quantity
  - `LiefDatum` - Delivery date
  - `Wunschliefer` - Desired vendor (LIFNR)
  - `Bestellung` - Linked PO number (EBELN)
- **Files:**
  - `26_01_14_EBAN_direct.xls` (173,238 rows) - Main PR data
  - `26_01_14_EBAN_direct_unbearbeitet.xls` (1,362 rows) - Unprocessed PRs
- **Business Value:** Shows complete PR history, volumes, and conversion patterns

#### 2. **EKKO - Purchase Order Headers** ⭐ CRITICAL
- **Rows:** 57,669 (combined from 3 files)
- **Purpose:** PO header data - main procurement documents
- **Key Fields:**
  - `EinkBeleg` - PO number (EBELN)
  - `BuKr` - Company code (BUKRS)
  - `Art` - Document type (BSART)
  - `Lieferant` - Vendor (LIFNR)
  - `EkOr` - Purchasing organization (EKORG)
  - `EKG` - Purchasing group (EKGRP)
  - `BelegDat` - Document date
- **Files:**
  - `26_01_14_EKKO_EKPO_direct_2024_2025.xlsx` (54,373 rows) - 2024-2025 POs
  - `26_01_14_EKKO_Kontrakte_direct.xls` (1,648 rows × 2) - Contract POs
- **Business Value:** Complete PO history, volumes by vendor/buyer

#### 3. **EKPO - Purchase Order Items** ⭐ CRITICAL
- **Rows:** 4,216 (contract items)
- **Purpose:** Line-item details for purchase orders
- **Key Fields:**
  - `Ebeln` - PO number
  - `Position` - Item number (EBELP)
  - `Material` - Material (MATNR)
  - `Werk` - Plant
  - `Bestellmenge` - Order quantity (MENGE)
  - `Nettopreis` - Net price (NETPR)
- **Files:**
  - `26_01_14_EKPO_Kontrakte_direct.xls` (2,108 rows × 2)
- **Note:** Main EKPO data appears embedded in EKKO file (combined view)

#### 4. **EKAB - PO Release/Approval Strategy**
- **Rows:** 6,266
- **Purpose:** Approval workflow and release documentation
- **Key Fields:**
  - `EBNR` - Release number
  - `Freigabegr` - Release group
  - `Freigabekz` - Release indicator
  - `Freigabesta` - Release status
- **Business Value:** Shows approval bottlenecks and workflow patterns

#### 5. **EKES - Vendor Confirmations**
- **Rows:** 18,647
- **Purpose:** Delivery confirmations from suppliers
- **Key Fields:**
  - `Einkaufsbeleg` - PO number (EBELN)
  - `Position` - Item
  - `Bestätigungstyp` - Confirmation type
  - `LiefDatum` - Delivery date
  - `Menge` - Quantity
  - `ErstellDatum` - Creation date
- **Business Value:** Tracks supplier reliability, delivery performance

---

### **Master Data Tables**

#### 6. **MARA - Material Master (General)** ⭐ CRITICAL
- **Rows:** 39,238
- **Purpose:** Material catalog - product definitions
- **Key Fields:**
  - `Material` - Material number (MATNR)
  - `Materialart` - Material type (MTART)
  - `Materialgruppe` - Material group (MATKL)
  - `Basismengeneinh` - Base UoM (MEINS)
  - `Materialstatus` - Material status
- **Business Value:** Product catalog for demo scenarios

#### 7. **MAKT - Material Descriptions**
- **Rows:** 39,238 (matches MARA)
- **Purpose:** Material names and descriptions
- **Key Fields:**
  - `Material` - Material number
  - `Sprachschlüssel` - Language (SPRAS)
  - `Materialkurztext` - Short text (MAKTX)
- **Business Value:** Human-readable material names

#### 8. **MARC - Material Plant Data**
- **Rows:** 39,212
- **Purpose:** Plant-specific material data (MRP, procurement)
- **Key Fields:**
  - `Material`, `Werk` - Material + Plant
  - `Disponent` - MRP controller (DISPO)
  - `Beschaffungsart` - Procurement type (BESKZ)
  - `Sonderbestandskz` - Special stock (SOBSL)
  - `Losgröße` - Lot size
- **Business Value:** MRP settings, lead times, reorder points

#### 9. **LFA1 - Vendor Master (General)** ⭐ CRITICAL
- **Rows:** 3,136
- **Purpose:** Supplier directory
- **Key Fields:**
  - `Lieferant` - Vendor number (LIFNR)
  - `Name 1` - Vendor name (NAME1)
  - `Land` - Country (LAND1)
  - `Kontogruppe` - Account group (KTOKK)
  - `Straße` - Street address
- **Business Value:** Vendor catalog for sourcing

#### 10. **LFM1 - Vendor Purchasing Org Data**
- **Rows:** 3,136 (matches LFA1)
- **Purpose:** Vendor conditions per purchasing organization
- **Key Fields:**
  - `Lieferant`, `EKorg` - Vendor + Purch org
  - `Sperre` - Block indicator (SPERM)
  - `Währung` - Currency (WAERS)
  - `Zahlungsbedingung` - Payment terms
- **Business Value:** Vendor availability by organization

#### 11. **EINA/EINE - Purchase Info Records**
- **Rows:** 10,416
- **Purpose:** Preferred supplier / price agreements
- **Key Fields:**
  - `Infosatz` - Info record number (INFNR)
  - `Material` - Material (MATNR)
  - `Lieferant` - Vendor (LIFNR)
  - `EkOr` - Purchasing organization
  - `Nettopreis` - Net price
  - `Datum` - Valid from date
- **Business Value:** Price history, preferred suppliers

#### 12. **EORD - Source List**
- **Rows:** 5,412
- **Purpose:** Valid suppliers per material/plant
- **Key Fields:**
  - `Material`, `Werk` - Material + Plant
  - `Lieferant` - Vendor
  - `Gültig ab/bis` - Validity dates
  - `Fester Lief` - Fixed vendor flag
  - `Vertrag` - Contract reference
- **Business Value:** Sourcing rules and preferences

---

### **Inventory & Planning Tables**

#### 13. **MB52 - Warehouse Stock**
- **Rows:** 6,555
- **Purpose:** Current inventory levels
- **Key Fields:**
  - `Material`, `Werk`, `Lagerort` - Material + Plant + Location
  - `Frei verwendbar` - Unrestricted stock (LABST)
  - `In Qualitätsprüfung` - Quality inspection (INSME)
  - `Gesperrt` - Blocked stock
  - `Charge` - Batch number
- **Business Value:** Stock availability for demo scenarios

#### 14. **MD04 - MRP Elements** ⭐ LARGE DATASET
- **Rows:** 320,493 (largest table overall)
- **Purpose:** Material requirements planning - supply/demand
- **Key Fields:**
  - `Material`, `Plant` - Material + Plant
  - `MRP_element` - Element type (PR, PO, Stock, etc.)
  - `Recipt_Requiremet_Date` - Date
  - `Qty_received_required` - Quantity
  - `Qty_avail` - Available quantity
  - `GSCR` - Supply area
- **Business Value:** Demand forecasting, replenishment triggers

#### 15. **MARD - Storage Location Stock**
- **Rows:** 7,270
- **Purpose:** Stock at storage location level
- **Key Fields:**
  - `Material`, `Werk`, `Lgort` - Material + Plant + Storage Location
  - `Bestand` - Stock quantity

---

### **Supporting Tables**

#### 16. **ADR/ADRC - Address Data**
- **Rows:** 4,902 (ADR), 3,142 (ADRC)
- **Purpose:** Contact addresses for vendors/customers

#### 17. **KNVK - Customer Contacts**
- **Rows:** 1,998
- **Purpose:** Customer contact persons

#### 18. **QINF - Quality Info Records**
- **Rows:** 40,344
- **Purpose:** Quality management data

#### 19. **ZPP20 - Monthly Consumption (Custom)**
- **Rows:** 9,808
- **Purpose:** BBraun-specific consumption tracking
- **Key Fields:**
  - `MATERIAL`, `WERK` - Material + Plant
  - `JAHR` - Year
  - `JANUAR` through `DEZEMBER` - Monthly consumption
  - `GESAMTVERBRAUCH` - Total consumption
- **Business Value:** Historical usage patterns

---

## 🎯 PR→PO Flow Relationships

### Data Relationships Map

```
┌─────────────────────────────────────────────────────────────┐
│                     PROCUREMENT FLOW                        │
└─────────────────────────────────────────────────────────────┘

1. DEMAND GENERATION
   MD04 (MRP) → Triggers → EBAN (PR)

2. PURCHASE REQUISITION
   EBAN (174K rows)
   ├─ Linked to: MARA/MAKT (Material)
   ├─ Linked to: MARC (Plant data)
   ├─ Linked to: EINA/EINE (Price info)
   ├─ Linked to: EORD (Source list)
   └─ Suggests: LFA1/LFM1 (Vendor)

3. APPROVAL
   EKAB (6K rows) - Release strategy

4. PURCHASE ORDER
   EKKO (58K rows) + EKPO (4K rows)
   ├─ Linked from: EBAN (PR reference)
   ├─ Linked to: LFA1/LFM1 (Vendor)
   └─ Linked to: EINA/EINE (Info record)

5. CONFIRMATION
   EKES (19K rows) - Vendor confirmations

6. GOODS RECEIPT (not in dataset)
   MIGO / MSEG tables (would be needed)

7. INVOICE (not in dataset)
   RBKP / RSEG tables (would be needed)

8. INVENTORY
   MB52 (7K rows) - Current stock
   MARD (7K rows) - Storage locations
```

### Key Join Relationships

| From | To | Join Key | Relationship |
|------|-----|----------|--------------|
| EBAN | MARA | `Material` = `MATNR` | PR to Material Master |
| EBAN | MARC | `Material`+`Werk` | PR to Plant Data |
| EBAN | LFA1 | `Wunschliefer` = `LIFNR` | PR to Vendor |
| EBAN | EKKO | `Bestellung` = `EBELN` | PR to PO |
| EKKO | EKPO | `EinkBeleg` = `Ebeln` | PO Header to Items |
| EKKO | LFA1 | `Lieferant` = `LIFNR` | PO to Vendor |
| EKKO | EKES | `EinkBeleg` = `Einkaufsbeleg` | PO to Confirmations |
| EKKO | EKAB | `EinkBeleg` = `EBELN` | PO to Releases |
| EINA | LFA1 | `Lieferant` = `LIFNR` | Info Record to Vendor |
| EINA | MARA | `Material` = `MATNR` | Info Record to Material |
| EORD | MARA | `Material` = `MATNR` | Source List to Material |
| EORD | LFA1 | `Lieferant` = `LIFNR` | Source List to Vendor |
| MB52 | MARA | `Material` = `MATNR` | Stock to Material |
| MD04 | MARA | `Material` = `MATNR` | MRP to Material |

---

## 💡 Key Insights for Demo Design

### 1. **Realistic Scale**
- **174K PRs** → Shows enterprise-scale procurement
- **58K POs** → ~33% conversion ratio (PR → PO)
- **39K Materials** → Rich product catalog
- **3K Vendors** → Diverse supplier base

### 2. **German Language Data**
- Column names and values in German (original SAP language)
- Need translation layer for English demos
- Provides authenticity for European client scenarios

### 3. **Date Range**
- EBAN: PRs from 2023-2025 (heavy in 2023)
- EKKO: POs from 2024-2025 (filename indicates focus period)
- Good recent history for time-series demos

### 4. **Missing Tables** (for complete P2P flow)
- **MIGO/MSEG** - Goods Receipt data
- **RBKP/RSEG** - Invoice data
- **EKBE** - PO history (changes over time)
- **BKPF/BSEG** - Accounting documents

### 5. **Data Quality Notes**
- Some tables have only 1-2 rows (metadata headers captured)
- Main operational tables (EBAN, EKKO, EKES) have rich data
- Contract tables separate from main PO data
- Multiple files for same table (need consolidation strategy)

---

## 📁 File Storage Structure

```
BBraun_Data/
├── Operationale Daten Direkt/        # Transactional data
│   ├── 26_01_14_EBAN_direct.xls      (173K rows) ⭐
│   ├── 26_01_14_EKKO_EKPO_direct_2024_2025.xlsx (54K rows) ⭐
│   ├── 26_01_15_EKES_direct_gesamt.xls.xlsx (19K rows)
│   ├── 26_01_14_EKAB_Kontrakte_direct.xls (6K rows)
│   ├── 26_01_15_MB52 Bestände.xlsx (7K rows)
│   └── 26_01_15_MD04_ELEMENTS.csv (320K rows) ⭐ LARGEST
│
├── Stammdaten Direct/                 # Master data
│   ├── 26_01_14_MARA_direct.xls      (39K rows) ⭐
│   ├── 26_01_14_MARC_direct.xls      (39K rows)
│   ├── 26_01_14_MAKT_direct.xls      (39K rows)
│   ├── 26_01_14_LFA1_direct.xls      (3K rows) ⭐
│   ├── 26_01_14_LFM1_direct.xls      (3K rows)
│   ├── 26_01_14_EINA_EINE_direct.xlsx (10K rows)
│   ├── 26_01_14_EORD_direct.xls      (5K rows)
│   └── ...
│
└── parquet/                           # Converted Parquet files
    ├── Operationale Daten Direkt/
    └── Stammdaten Direct/
```

---

## 🚀 Recommended Next Steps

### 1. **Data Profiling**
- [ ] Analyze PR→PO conversion rates by category
- [ ] Identify top vendors by spend
- [ ] Profile material groups and commodities
- [ ] Analyze approval cycle times (EKAB)
- [ ] Check delivery performance (EKES vs EKPO dates)

### 2. **Demo Dataset Design**
- [ ] Extract 50-100 representative PRs with full lineage
- [ ] Include mix of: standard PRs, urgent PRs, contract PRs
- [ ] Ensure vendor coverage (top 10-20 suppliers)
- [ ] Include material variety (raw materials, services, equipment)
- [ ] Add realistic exceptions (blocked vendors, stock issues)

### 3. **Data Translation**
- [ ] Map German field names to English
- [ ] Translate key material descriptions
- [ ] Translate vendor names (or anonymize)
- [ ] Create bilingual data dictionary

### 4. **Scenario Building**
- [ ] **Scenario 1:** Standard catalog PR → PO flow
- [ ] **Scenario 2:** Non-catalog PR with sourcing
- [ ] **Scenario 3:** Contract release order
- [ ] **Scenario 4:** PR with approval escalation
- [ ] **Scenario 5:** Supplier delivery delay handling

### 5. **Integration Points**
- [ ] Map to existing PR2PO prototype data model
- [ ] Identify gaps vs. current demo data
- [ ] Plan data migration/transformation scripts
- [ ] Design API response structures

---

## 📊 Technical Details

### Parquet Storage Benefits
- **Compression:** ~70-80% size reduction vs CSV/Excel
- **Query Speed:** Columnar storage = faster analytics
- **Type Safety:** Preserved data types (dates, numbers)
- **Tool Support:** pandas, polars, DuckDB, Apache Arrow

### Access Patterns
```python
# Quick read with pandas
import pandas as pd
df_eban = pd.read_parquet('BBraun_Data/parquet/Operationale Daten Direkt/26_01_14_EBAN_direct.parquet')

# Filtered read (efficient)
df_recent = pd.read_parquet(
    'BBraun_Data/parquet/Operationale Daten Direkt/26_01_14_EBAN_direct.parquet',
    filters=[('LiefDatum', '>=', '2024-01-01')]
)
```

---

## ✅ Completeness Assessment

| Data Category | Status | Notes |
|---------------|--------|-------|
| Purchase Requisitions | ✅ Complete | 174K rows, rich history |
| Purchase Orders | ✅ Complete | 58K headers, 4K items (contracts) |
| Approvals | ✅ Complete | 6K release records |
| Vendor Confirmations | ✅ Complete | 19K confirmations |
| Material Master | ✅ Complete | 39K materials with descriptions |
| Vendor Master | ✅ Complete | 3K vendors |
| Inventory | ✅ Complete | 7K stock records |
| MRP Data | ✅ Complete | 320K planning elements |
| Info Records | ✅ Complete | 10K price/supplier records |
| Goods Receipts | ❌ Missing | Would need MSEG table |
| Invoices | ❌ Missing | Would need RBKP/RSEG |
| Payments | ❌ Missing | Would need BSEG |
| Contracts | ⚠️ Partial | Only contract POs, not EKPA |

**Overall Coverage:** ~75% of full P2P cycle (PR → PO → Confirmation)

---

**Report Generated:** 2026-01-22
**Analysis Script:** `analyze_bbraun_data.py`
**Full Details:** `BBraun_Data_Analysis_Report.md`
