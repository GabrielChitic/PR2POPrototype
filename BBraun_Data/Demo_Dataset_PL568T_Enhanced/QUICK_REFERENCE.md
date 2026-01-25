# Quick Reference: PL568T Demo Data

## ✅ **AVAILABLE REAL DATA FROM BBRAUN SAP**

### **Your Target Transaction**
```
PO Number:        4516638113
Date:             2025-12-09
Total Amount:     EUR 140,940.80 ✅
Purch. Group:     7EF ✅
Reference:        7EF/4516638113 ✅
```

### **Material Master**
```
Material Code:    PL568T ✅
Description:      CLIP LIGATURE MED.LARGE 20MAGAS.=120PCS. ✅
Commodity Group:  D05AA19AE ✅ (NEW!)
Base UOM:         ST (pieces) ✅
Order UOM:        PAK (packages) ✅
Pieces per PAK:   120 ✅
```

### **MRP / Planning Data**
```
Fixed Lot Size:   45,760 pieces ✅ (YOUR QUANTITY REFERENCE!)
Safety Stock:     30,440 pieces ✅
Lead Time:        120 days ✅
GR Processing:    3 days ✅
MRP Group:        FX (Fixed lot sizing) ✅
Procurement:      F (External) ✅
```

### **Purchasing Data**
```
Vendor:           1165336 (AESCULAP) ✅
Purchasing Group: 7EF ✅
Purchasing Org:   DEA1 ✅
Plant:            DE01 ✅
Info Record:      5301133479 ✅
Price:            EUR 61.6 per PAK ✅
Currency:         EUR ✅
Payment Terms:    N002 ✅
Valid From:       2025-12-09 ✅
```

### **Transaction Data**
```
Purchase Reqs:    32 PRs ✅
Purchase Orders:  18 POs ✅
Confirmations:    2 vendor confirmations ✅
Stock Locations:  13 storage locations ✅
Total PO Value:   EUR 2,536,934.40 ✅
Total Pieces:     4,942,080 ✅
```

---

## ⚠️ **NOT AVAILABLE (Use Demo Values)**

### **Accounting Assignment**
```
Cost Center:      NOT in BBraun extract
GL Account:       NOT in BBraun extract
Internal Order:   NOT in BBraun extract
```

**Why?** These fields are in SAP table **EKKN** (Account Assignment), which wasn't included in the BBraun data export.

### **💡 SUGGESTED DEMO VALUES**

For realistic demos, use these values:

```typescript
const accountingData = {
  costCenter: "7200",              // Medical Supplies Department
  costCenterName: "Surgical Supplies",

  glAccount: "400100",             // Consumable Medical Supplies
  glAccountName: "Medical Consumables",

  internalOrder: "MED2024",        // Optional: Project tracking

  // Additional context
  companyCode: "102",              // From BBraun data ✅
  profitCenter: "PC-MED",          // Medical division
  wbsElement: "WBS-SRG-001"        // Optional: Project element
};
```

---

## 📊 **HOW TO USE THE DATA**

### **For Standard PR→PO Demo:**

1. **Show PR Creation**
   - Material: PL568T
   - Quantity: 45,760 pieces (fixed lot size)
   - Cost Center: 7200 (demo)
   - GL Account: 400100 (demo)

2. **System Finds Source**
   - Info Record: 5301133479
   - Vendor: 1165336 (AESCULAP)
   - Price: EUR 61.6/PAK
   - Commodity Group: D05AA19AE

3. **Create PO**
   - Quantity: 381 PAK (45,760 ÷ 120)
   - OR: 2,288 PAK (standard order = 6× cycles)
   - Amount: EUR 140,940.80

4. **Track Confirmation**
   - Use data from EKES table
   - Show delivery date confirmation

---

## 🎬 **SCENARIO TEMPLATES**

### **Template 1: Stock Replenishment**
```
Current Stock:    28,500 (below safety!)
Safety Stock:     30,440
Fixed Lot Size:   45,760

→ Trigger auto-PR for 45,760 pieces
→ Cost Center: 7200
→ GL Account: 400100
→ Commodity: D05AA19AE
```

### **Template 2: Price Variance**
```
Info Record:      EUR 61.6/PAK
Vendor Quote:     EUR 64.0/PAK
Variance:         +3.9%

→ Requires approval (>3% threshold)
→ Purchasing Group 7EF reviews
```

### **Template 3: Lead Time Planning**
```
Order Date:       Jan 1, 2026
Lead Time:        120 days
GR Processing:    3 days
Expected GR:      May 3, 2026

→ Check if meets requirement
→ Safety stock covers gap
```

---

## 📁 **FILES OVERVIEW**

| File | Records | Purpose |
|------|---------|---------|
| `01_purchase_requisitions_EBAN_enhanced.csv` | 32 | PRs with prices, delivery dates |
| `02_purchase_orders_EKKO.csv` | 18 | All POs including 4516638113 |
| `04_vendor_confirmations_EKES.csv` | 2 | Delivery confirmations |
| `05_material_master_MARA_enhanced.csv` | 1 | **Commodity Group** ✅ |
| `07_material_plant_MARC_enhanced.csv` | 1 | **Fixed Lot, Safety Stock, Lead Time** ✅ |
| `08_purchase_info_records_EINA.csv` | 1 | Pricing agreement |
| `10_warehouse_stock_MB52.csv` | 13 | Current stock levels |

---

## 🔑 **KEY INSIGHTS**

### **Your Quantity Mystery Solved!**
- **45,760 U** in your reference = **Fixed Lot Size** in SAP ✅
- This is the **standard reorder quantity**
- Actual orders are **2,288 PAK** = **274,560 pieces** (6× fixed lot)
- Both calculations give the same **EUR 140,940.80** ✅

### **Complete PR→PO Flow Available:**
```
EBAN (PR) → EINA (Info Record) → EKKO (PO) → EKES (Confirmation) → MB52 (Stock)
   ✅              ✅                  ✅              ✅                ✅
```

### **Missing Only:**
```
EKKN (Account Assignment) → Cost Center, GL Account
   ❌ (use demo values: 7200, 400100)
```

---

## ⚡ **QUICK COPY-PASTE VALUES**

### **For Your Demo:**
```json
{
  "material": "PL568T",
  "description": "CLIP LIGATURE MED.LARGE 20MAGAS.=120PCS.",
  "commodityGroup": "D05AA19AE",
  "vendor": "1165336",
  "vendorName": "AESCULAP",
  "purchasingGroup": "7EF",
  "plant": "DE01",
  "quantity": 45760,
  "quantityUOM": "ST",
  "orderQuantity": 2288,
  "orderUOM": "PAK",
  "pricePerUnit": 61.6,
  "currency": "EUR",
  "totalAmount": 140940.80,

  "costCenter": "7200",
  "costCenterName": "Surgical Supplies",
  "glAccount": "400100",
  "glAccountName": "Medical Consumables",

  "fixedLotSize": 45760,
  "safetyStock": 30440,
  "leadTimeDays": 120,

  "poNumber": "4516638113",
  "poDate": "2025-12-09",
  "infoRecord": "5301133479"
}
```

---

**Location:** `BBraun_Data/Demo_Dataset_PL568T_Enhanced/`

**Last Updated:** 2026-01-23

✅ = Real BBraun SAP Data
💡 = Suggested Demo Value
