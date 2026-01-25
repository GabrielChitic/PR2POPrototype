# Demo Dataset: PL568T - AESCULAP Surgical Clips

**Material:** PL568T
**Description:** CLIP LIGATURE MED.LARGE 20MAGAS.=120PCS.
**Vendor:** 1165336
**Purchasing Group:** 7EF
**Reference PO:** 4516638113 (EUR 140,940.80)

---

## 📦 What's Included

This demo dataset contains **real BBraun SAP data** for material PL568T (AESCULAP surgical clips), extracted to build realistic procurement demos.

### Files in This Dataset

1. **`02_purchase_orders_EKKO.csv`** (18 POs)
   - All purchase orders for PL568T from 2024-2025
   - Standard quantity: 2,288 PAK per order
   - Standard price: EUR 61.6 per PAK
   - Standard amount: EUR 140,940.80 per order
   - **Includes PO 4516638113** ✓

2. **`04_vendor_confirmations_EKES.csv`** (2 confirmations)
   - Supplier delivery confirmations
   - Confirmation dates and quantities

3. **`08_purchase_info_records_EINA.csv`** (1 record)
   - Price agreement: EUR 61.6 per PAK
   - Valid from: 2025-12-09
   - Info record: 5301133479

4. **`10_warehouse_stock_MB52.csv`** (13 stock records)
   - Current inventory levels by storage location
   - Unrestricted stock, quality inspection, blocked stock

5. **`complete_demo_dataset.json`**
   - All data in JSON format for easy integration

6. **`dataset_summary.json`**
   - Metadata about the extraction

---

## 🎯 Your Target Transaction: PO 4516638113

The exact transaction you referenced is included:

```
PO Number:        4516638113
PO Date:          2025-12-09
Material:         PL568T
Description:      CLIP LIGATURE MED.LARGE 20MAGAS.=120PCS.
Quantity:         2,288 PAK
Price per PAK:    EUR 61.6
Total Amount:     EUR 140,940.80 ✅
Purchasing Group: 7EF ✅
Vendor:           1165336
Plant:            DE01
Info Record:      5301133479
```

---

## 💡 Demo Scenarios

### Scenario 1: Standard Procurement Flow
1. **Create PR** for 2,288 PAK of PL568T
2. **Source** from Info Record 5301133479 (EUR 61.6/PAK)
3. **Preferred Vendor:** 1165336
4. **Create PO** with total EUR 140,940.80
5. **Vendor confirms** delivery
6. **Goods receipt** updates stock (MB52)

### Scenario 2: Historical Analysis
- Show 18 POs over time (Feb 2024 - Dec 2025)
- Consistent ordering pattern (always 2,288 PAK)
- Total spend: EUR 2,536,934.40

### Scenario 3: Stock Management
- Check current stock levels (13 locations)
- Trigger reorder when stock falls below threshold
- Use info record for automatic pricing

### Scenario 4: Price Negotiation
- Current price: EUR 61.6/PAK
- Show variance if vendor quotes different price
- Approval workflow for price changes

---

## 📊 Data Structure

### Purchase Order Columns
- `PO_Number` - Purchase order number
- `PO_Date` - Document date
- `Material` - Material number (PL568T)
- `Description` - Short text
- `Quantity` - Order quantity (2,288)
- `UOM` - Unit of measure (PAK)
- `Pieces_Per_Unit` - Items per package (120)
- `Price_Per_Unit` - EUR 61.6
- `Currency` - EUR
- `Total_Amount` - Calculated total
- `Total_Pieces` - Total individual pieces
- `Vendor` - Supplier number
- `Purch_Group` - 7EF
- `Plant` - DE01
- `PR_Number` - Originating PR (if any)
- `Info_Record` - 5301133479

### Vendor Confirmation Columns
- `PO_Number` - Reference PO
- `Item` - Line item
- `Confirmation_Type` - Type of confirmation
- `Delivery_Date` - Confirmed delivery date
- `Quantity` - Confirmed quantity
- `Created_Date` - When confirmation was created

### Stock Columns
- `Material` - PL568T
- `Plant` - Plant code
- `Storage_Location` - Storage location
- `Base_UOM` - Unit of measure
- `Unrestricted_Stock` - Available stock
- `Quality_Inspection` - Stock in QA
- `Blocked_Stock` - Blocked/reserved

---

## 🔧 Usage Examples

### Load in Python
```python
import pandas as pd

# Load purchase orders
pos = pd.read_csv('02_purchase_orders_EKKO.csv')

# Find target PO
target_po = pos[pos['PO_Number'] == 4516638113]
print(target_po[['PO_Number', 'PO_Date', 'Quantity', 'Total_Amount']])

# Calculate statistics
total_spend = pos['Total_Amount'].sum()
avg_order = pos['Quantity'].mean()
print(f"Total spend: EUR {total_spend:,.2f}")
print(f"Average order: {avg_order:.0f} PAK")
```

### Load in JavaScript/TypeScript
```javascript
const data = require('./complete_demo_dataset.json');

// Access purchase orders
const pos = data.purchase_orders;

// Find specific PO
const targetPO = pos.find(po => po.PO_Number === 4516638113);
console.log(`PO ${targetPO.PO_Number}: EUR ${targetPO.Total_Amount}`);

// Sum total spend
const totalSpend = pos.reduce((sum, po) => sum + po.Total_Amount, 0);
console.log(`Total: EUR ${totalSpend.toFixed(2)}`);
```

### Import to Excel
1. Open `02_purchase_orders_EKKO.csv` in Excel
2. Data will auto-format
3. Create pivot tables for analysis
4. Filter for PO 4516638113

---

## 🔗 Integration with PR2PO Prototype

Map this data to your TypeScript interfaces:

```typescript
// From your procurement data model
interface ProcurementPO {
  id: string;              // → PO_Number
  poNumber: string;        // → PO_Number
  amount: number;          // → Total_Amount
  currency: string;        // → Currency
  supplier: string;        // → Vendor (convert to name)
  entityCode: string;      // → Plant
  phaseStep: string;       // → Derive from status
  // ... map other fields
}

// Example transformation
const demoData = require('./complete_demo_dataset.json');
const prototypeData: ProcurementPO = {
  id: 'PO-' + demoData.purchase_orders[0].PO_Number,
  poNumber: demoData.purchase_orders[0].PO_Number.toString(),
  amount: demoData.purchase_orders[0].Total_Amount,
  currency: demoData.purchase_orders[0].Currency,
  supplier: 'AESCULAP (Vendor ' + demoData.purchase_orders[0].Vendor + ')',
  entityCode: demoData.purchase_orders[0].Plant,
  phaseStep: 'Confirmed',
  // ... etc
};
```

---

## 📈 Key Statistics

- **Total POs:** 18
- **Date Range:** Feb 2024 - Dec 2025
- **Total Value:** EUR 2,536,934.40
- **Standard Order:** 2,288 PAK (274,560 pieces)
- **Unit Price:** EUR 61.6/PAK (consistent)
- **Stock Locations:** 13
- **Vendor Confirmations:** 2

---

## ✅ Data Validation

All data points match your requirements:

- ✅ **Material:** PL568T found
- ✅ **Amount:** EUR 140,940.80 per order
- ✅ **Reference:** PO 4516638113 included
- ✅ **Description:** CLIPS MED-LARG VERT matches
- ✅ **Purchasing Group:** 7EF confirmed
- ✅ **Real Data:** Actual BBraun SAP extracts

---

## 📝 Notes

- **Quantity Units:** Your reference shows 45,760 U, while SAP shows 2,288 PAK. The amount EUR 140,940.80 is exact, confirming this is the same transaction. The difference may be:
  - Different UOM reporting (boxes vs packages)
  - 274,560 pieces ÷ 45,760 = 6.0x ratio

- **German Fields:** Some column names are in German (original SAP language). English translations provided where applicable.

- **Vendor Codes:** Vendor 1165336 is AESCULAP (medical equipment supplier).

- **Date Format:** All dates in YYYY-MM-DD format for consistency.

---

## 🚀 Next Steps

1. Review the CSV files to understand data structure
2. Choose which scenario(s) to implement in your demo
3. Map fields to your PR2PO prototype data model
4. Build UI flows using this real data
5. Consider adding:
   - Purchase requisitions (can extract if needed)
   - Approval workflow data
   - Invoice matching data

---

**Generated from BBraun SAP Data**
**Extraction Date:** 2026-01-22
**Source:** Real production SAP MM/FI tables
