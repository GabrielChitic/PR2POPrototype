#!/usr/bin/env python3
"""
Search for specific BBraun data point:
- Material: PL568T / CE0459
- Description: CLIPS MED-LARG VERT AESCULAP
- Quantity: 45,760
- Amount: EUR 140,940.80
- Reference: 7EF/4516638113-Nov26
"""

import pandas as pd
from pathlib import Path
import warnings
warnings.filterwarnings('ignore')

base_path = Path('/Users/gabriel.chitic/PR2POPrototype/BBraun_Data/parquet')

# Search criteria
material_codes = ['PL568T', 'CE0459', 'PL568', 'CE459']
quantity_target = 45760
amount_target = 140940.80
ref_codes = ['7EF', '4516638113', '4516638113-Nov26']
keywords = ['CLIPS', 'AESCULAP', 'MED-LARG', 'VERT', 'CEIII']

print("=" * 80)
print("SEARCHING FOR SPECIFIC DATA POINT")
print("=" * 80)
print("\nSearch Criteria:")
print(f"  Material: {material_codes}")
print(f"  Quantity: {quantity_target:,}")
print(f"  Amount: EUR {amount_target:,.2f}")
print(f"  Description keywords: {keywords}")
print(f"  Reference codes: {ref_codes}")
print("\n" + "=" * 80)

def search_in_file(file_path: Path, table_name: str):
    """Search for the data point in a specific file"""
    try:
        df = pd.read_parquet(file_path)

        # Convert all object columns to strings for searching
        for col in df.columns:
            if df[col].dtype == 'object':
                df[col] = df[col].astype(str)

        matches = []

        # Search strategy 1: Material code
        material_cols = [c for c in df.columns if any(x in str(c).upper() for x in ['MATERIAL', 'MATNR', 'MAT'])]
        for col in material_cols:
            for mat_code in material_codes:
                mask = df[col].str.contains(mat_code, case=False, na=False)
                if mask.any():
                    print(f"\n🔍 [{table_name}] Found material code '{mat_code}' in column '{col}':")
                    print(f"    Matches: {mask.sum()} rows")
                    matches.extend(df[mask].index.tolist())

        # Search strategy 2: Description keywords
        text_cols = [c for c in df.columns if any(x in str(c).upper() for x in ['TEXT', 'BESCHR', 'KURZTEXT', 'DESCRIPTION', 'NAME'])]
        for col in text_cols:
            for keyword in keywords:
                mask = df[col].str.contains(keyword, case=False, na=False)
                if mask.any():
                    print(f"\n🔍 [{table_name}] Found keyword '{keyword}' in column '{col}':")
                    print(f"    Matches: {mask.sum()} rows")
                    matches.extend(df[mask].index.tolist())

        # Search strategy 3: Quantity
        qty_cols = [c for c in df.columns if any(x in str(c).upper() for x in ['MENGE', 'QTY', 'QUANTITY', 'BESTELLMENGE'])]
        for col in qty_cols:
            try:
                # Try numeric comparison
                df_numeric = pd.to_numeric(df[col], errors='coerce')
                # Check for exact match or close match (within 1%)
                mask = (df_numeric >= quantity_target * 0.99) & (df_numeric <= quantity_target * 1.01)
                if mask.any():
                    print(f"\n🔍 [{table_name}] Found quantity ~{quantity_target:,} in column '{col}':")
                    print(f"    Matches: {mask.sum()} rows")
                    matches.extend(df[mask].index.tolist())
            except:
                pass

        # Search strategy 4: Amount
        amount_cols = [c for c in df.columns if any(x in str(c).upper() for x in ['AMOUNT', 'BETRAG', 'PREIS', 'PRICE', 'WERT', 'NETTOPREIS'])]
        for col in amount_cols:
            try:
                df_numeric = pd.to_numeric(df[col], errors='coerce')
                # Check for exact match or close match (within 1%)
                mask = (df_numeric >= amount_target * 0.99) & (df_numeric <= amount_target * 1.01)
                if mask.any():
                    print(f"\n🔍 [{table_name}] Found amount ~EUR {amount_target:,.2f} in column '{col}':")
                    print(f"    Matches: {mask.sum()} rows")
                    matches.extend(df[mask].index.tolist())
            except:
                pass

        # Search strategy 5: Reference codes
        for col in df.columns:
            for ref in ref_codes:
                mask = df[col].str.contains(ref, case=False, na=False)
                if mask.any():
                    print(f"\n🔍 [{table_name}] Found reference '{ref}' in column '{col}':")
                    print(f"    Matches: {mask.sum()} rows")
                    matches.extend(df[mask].index.tolist())

        # If we found matches, show the full records
        if matches:
            unique_matches = list(set(matches))
            print(f"\n" + "=" * 80)
            print(f"📊 FOUND {len(unique_matches)} POTENTIAL MATCH(ES) IN {table_name}")
            print("=" * 80)

            for idx in unique_matches[:5]:  # Show first 5 matches
                print(f"\nRecord #{idx}:")
                record = df.iloc[idx]
                for col, val in record.items():
                    if pd.notna(val) and str(val) not in ['nan', 'None', '']:
                        print(f"  {col}: {val}")

            return df.iloc[unique_matches]

    except Exception as e:
        print(f"  ⚠️  Error reading {file_path.name}: {e}")

    return None

# Priority search order
search_order = [
    ('EBAN', 'Operationale Daten Direkt/26_01_14_EBAN_direct.parquet'),
    ('EKKO', 'Operationale Daten Direkt/26_01_14_EKKO_EKPO_direct_2024_2025.parquet'),
    ('EKPO', 'Operationale Daten Direkt/26_01_14_EKPO_Kontrakte_direct.parquet'),
    ('EKES', 'Operationale Daten Direkt/26_01_15_EKES_direct_gesamt.xls.parquet'),
    ('MARA', 'Stammdaten Direct/26_01_14_MARA_direct.parquet'),
    ('MAKT', 'Stammdaten Direct/26_01_14_MAKT_direct.parquet'),
    ('EINA', 'Stammdaten Direct/26_01_14_EINA_EINE_direct.parquet'),
]

all_results = {}

for table_name, file_path in search_order:
    full_path = base_path / file_path
    if full_path.exists():
        print(f"\n{'='*80}")
        print(f"Searching in {table_name} ({file_path})...")
        print(f"{'='*80}")

        result = search_in_file(full_path, table_name)
        if result is not None and len(result) > 0:
            all_results[table_name] = result

# Summary
print("\n" + "=" * 80)
print("SEARCH SUMMARY")
print("=" * 80)

if all_results:
    print(f"\n✅ Found potential matches in {len(all_results)} table(s):")
    for table_name, results in all_results.items():
        print(f"  • {table_name}: {len(results)} record(s)")

    print("\n" + "=" * 80)
    print("DETAILED MATCH ANALYSIS")
    print("=" * 80)

    for table_name, results in all_results.items():
        print(f"\n{'='*80}")
        print(f"{table_name} - Top Match Details")
        print(f"{'='*80}")

        if len(results) > 0:
            best_match = results.iloc[0]
            print("\nFull record data:")
            for col, val in best_match.items():
                if pd.notna(val) and str(val) not in ['nan', 'None', '']:
                    print(f"  {col:30} = {val}")
else:
    print("\n❌ No exact matches found for the specified criteria.")
    print("\nSuggestions:")
    print("  1. Material code might be slightly different (e.g., with/without leading zeros)")
    print("  2. Quantity might be split across multiple line items")
    print("  3. Data might be in contract tables not yet fully analyzed")
    print("  4. Let's do a broader search for AESCULAP products...")

    # Broader search
    print("\n" + "=" * 80)
    print("BROADER SEARCH: All AESCULAP Products")
    print("=" * 80)

    for table_name, file_path in search_order[:6]:
        full_path = base_path / file_path
        if full_path.exists():
            try:
                df = pd.read_parquet(full_path)
                for col in df.columns:
                    if df[col].dtype == 'object':
                        df[col] = df[col].astype(str)

                # Search for AESCULAP
                for col in df.columns:
                    mask = df[col].str.contains('AESCULAP', case=False, na=False)
                    if mask.any():
                        print(f"\n  {table_name}.{col}: {mask.sum()} AESCULAP records")
                        # Show a sample
                        print(f"    Sample: {df[mask][col].iloc[0]}")
            except:
                pass
