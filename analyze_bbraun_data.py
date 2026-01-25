#!/usr/bin/env python3
"""
BBraun SAP Data Analysis Script
Discovers, converts to Parquet, and documents SAP data files
"""

import os
import re
import pandas as pd
from pathlib import Path
from typing import Dict, List, Tuple
import warnings
warnings.filterwarnings('ignore')

# SAP table descriptions (standard SAP MM/FI knowledge)
SAP_TABLE_DESCRIPTIONS = {
    'EBAN': 'Purchase Requisition (PR) - Header and item data',
    'EKKO': 'Purchase Order (PO) - Header data',
    'EKPO': 'Purchase Order (PO) - Item data',
    'EKAB': 'Purchase Order Release Documentation',
    'EKES': 'Vendor Confirmations',
    'MARA': 'Material Master - General data',
    'MARC': 'Material Master - Plant data',
    'MARD': 'Material Master - Storage location data',
    'MAKT': 'Material Descriptions',
    'LFA1': 'Vendor Master - General data',
    'LFM1': 'Vendor Master - Purchasing organization data',
    'EINA': 'Purchasing Info Record - General data',
    'EINE': 'Purchasing Info Record - Purchasing organization data',
    'EORD': 'Source List (Preferred suppliers)',
    'MB52': 'Warehouse Stock (Inventory)',
    'MD04': 'MRP Stock/Requirements List',
    'ADRC': 'Address data (Communication)',
    'ADR': 'Address data',
    'KNVK': 'Customer Master - Contact persons',
    'QINF': 'Quality Info Records',
    'ZPP20': 'Custom table - Monthly consumption (Z-tables are custom)'
}

SAP_KEY_FIELDS = {
    'EBAN': ['BANFN', 'BNFPO', 'MATNR', 'WERKS', 'BSART', 'ERDAT', 'BADAT'],
    'EKKO': ['EBELN', 'BUKRS', 'BSART', 'LIFNR', 'ERDAT'],
    'EKPO': ['EBELN', 'EBELP', 'MATNR', 'WERKS', 'LGORT', 'MENGE', 'NETPR'],
    'EKAB': ['EBELN', 'FRGKE', 'FRGZU', 'FRGGR'],
    'EKES': ['EBELN', 'EBELP', 'EINDT', 'MENGE'],
    'MARA': ['MATNR', 'MTART', 'MATKL', 'MEINS', 'ERSDA'],
    'MARC': ['MATNR', 'WERKS', 'DISPO', 'BESKZ', 'SOBSL'],
    'MARD': ['MATNR', 'WERKS', 'LGORT', 'LABST', 'INSME'],
    'MAKT': ['MATNR', 'SPRAS', 'MAKTX'],
    'LFA1': ['LIFNR', 'NAME1', 'LAND1', 'KTOKK', 'ERDAT'],
    'LFM1': ['LIFNR', 'EKORG', 'SPERM', 'WAERS'],
    'EINA': ['INFNR', 'MATNR', 'LIFNR'],
    'EINE': ['INFNR', 'EKORG', 'WERKS', 'NETPR', 'WAERS'],
    'EORD': ['MATNR', 'WERKS', 'LIFNR', 'AUTET'],
    'MB52': ['MATNR', 'WERKS', 'LGORT', 'LABST', 'INSME'],
    'MD04': ['MATNR', 'WERKS', 'DELKZ', 'BDTER', 'BDMNG'],
}

def extract_sap_table_name(filename: str) -> str:
    """Extract SAP table name from filename"""
    # Remove date prefix and extension
    name = re.sub(r'^\d{2}_\d{2}_\d{2}_', '', filename)
    name = re.sub(r'\.(xls|xlsx|csv)$', '', name, flags=re.IGNORECASE)

    # Try to find SAP table name
    for table in SAP_TABLE_DESCRIPTIONS.keys():
        if table in name.upper():
            return table

    # Extract first word if it looks like a table name
    parts = name.split('_')
    if parts and len(parts[0]) >= 3 and parts[0].isalpha():
        return parts[0].upper()

    return 'UNKNOWN'

def load_file_robust(filepath: Path) -> pd.DataFrame:
    """Load Excel or CSV file robustly"""
    ext = filepath.suffix.lower()

    try:
        if ext == '.csv':
            # Try different encodings and delimiters
            for encoding in ['utf-8', 'utf-16', 'latin1', 'cp1252']:
                for delimiter in [',', ';', '\t']:
                    try:
                        df = pd.read_csv(filepath, encoding=encoding, delimiter=delimiter, low_memory=False)
                        if len(df.columns) > 1:  # Ensure proper parsing
                            return df
                    except:
                        continue
        else:
            # Try Excel first
            try:
                df = pd.read_excel(filepath, engine='xlrd' if ext == '.xls' else 'openpyxl')
                return df
            except:
                # If Excel fails, try as tab-delimited text (common with SAP .xls exports)
                best_df = None
                best_score = 0

                for encoding in ['utf-16', 'utf-16-le', 'utf-8', 'latin1', 'cp1252']:
                    for delimiter in ['\t', ';', ',']:
                        for skiprows in range(0, 10):  # Try skipping up to 10 header rows
                            try:
                                df = pd.read_csv(filepath, encoding=encoding, delimiter=delimiter,
                                               skiprows=skiprows, low_memory=False, on_bad_lines='skip')
                                # Score based on: many columns × many rows
                                score = len(df.columns) * len(df)

                                # Valid data should have at least 5 columns and 10 rows
                                if len(df.columns) >= 5 and len(df) >= 10:
                                    if score > best_score:
                                        best_score = score
                                        best_df = df
                            except:
                                continue

                if best_df is not None:
                    return best_df
    except Exception as e:
        print(f"  ⚠️  Error loading {filepath.name}: {e}")
        return pd.DataFrame()

    return pd.DataFrame()

def scan_files(base_path: Path, folders: List[str]) -> List[Dict]:
    """Scan and catalog all SAP files"""
    inventory = []

    for folder in folders:
        folder_path = base_path / folder
        if not folder_path.exists():
            continue

        for file in folder_path.glob('*'):
            if file.suffix.lower() in ['.xls', '.xlsx', '.csv']:
                sap_table = extract_sap_table_name(file.name)
                inventory.append({
                    'file_name': file.name,
                    'folder': folder,
                    'extension': file.suffix.lower(),
                    'sap_table': sap_table,
                    'full_path': str(file)
                })

    return sorted(inventory, key=lambda x: x['sap_table'])

def convert_to_parquet(inventory: List[Dict], base_path: Path) -> List[Dict]:
    """Convert all files to Parquet format"""
    conversion_results = []
    parquet_base = base_path / 'parquet'

    for item in inventory:
        source_path = Path(item['full_path'])

        # Create mirrored folder structure
        relative_folder = item['folder']
        parquet_folder = parquet_base / relative_folder
        parquet_folder.mkdir(parents=True, exist_ok=True)

        # Generate Parquet filename
        base_name = source_path.stem
        parquet_path = parquet_folder / f"{base_name}.parquet"

        print(f"Converting: {item['file_name']}...")

        # Load data
        df = load_file_robust(source_path)

        if df.empty:
            print(f"  ⚠️  Skipped (empty or error)")
            continue

        # Ensure unique and valid column names
        new_cols = []
        col_counts = {}
        for i, col in enumerate(df.columns):
            # Handle missing/empty/NaN column names
            if pd.isna(col) or col == '' or str(col).strip() == '':
                col = f'Column_{i}'

            # Convert to string
            col_str = str(col).strip()

            # Make unique if duplicate
            if col_str in col_counts:
                col_counts[col_str] += 1
                col_str = f'{col_str}_{col_counts[col_str]}'
            else:
                col_counts[col_str] = 0

            new_cols.append(col_str)

        df.columns = new_cols

        # Clean data for Parquet compatibility
        # Convert object columns with mixed types to strings
        for col in df.columns:
            if df[col].dtype == 'object':
                try:
                    # Try to convert to numeric first
                    df[col] = pd.to_numeric(df[col], errors='ignore')
                except:
                    pass
                # If still object type, ensure all values are strings
                if df[col].dtype == 'object':
                    df[col] = df[col].astype(str)

        # Save as Parquet
        try:
            df.to_parquet(parquet_path, engine='pyarrow', compression='snappy', index=False)

            conversion_results.append({
                'sap_table': item['sap_table'],
                'source_file': item['file_name'],
                'parquet_path': str(parquet_path),
                'rows': len(df),
                'columns': len(df.columns)
            })

            print(f"  ✓ Saved: {parquet_path.name} ({len(df):,} rows × {len(df.columns)} cols)")
        except Exception as e:
            print(f"  ⚠️  Error saving Parquet: {e}")

    return conversion_results

def analyze_data(conversion_results: List[Dict], base_path: Path) -> Dict:
    """Analyze data structure and create data dictionary"""
    # Group by SAP table
    tables_by_name = {}
    for result in conversion_results:
        table_name = result['sap_table']
        if table_name not in tables_by_name:
            tables_by_name[table_name] = []
        tables_by_name[table_name].append(result)

    # Analyze each table
    table_analysis = {}

    for table_name, files in tables_by_name.items():
        print(f"\nAnalyzing {table_name}...")

        # Load first file to inspect columns
        parquet_path = Path(files[0]['parquet_path'])
        df = pd.read_parquet(parquet_path)

        # Get column info
        columns = list(df.columns)
        total_rows = sum(f['rows'] for f in files)

        # Identify key columns
        found_keys = []
        expected_keys = SAP_KEY_FIELDS.get(table_name, [])
        for key in expected_keys:
            if key in columns:
                found_keys.append(key)

        # Sample data for a few columns
        sample_data = {}
        for col in columns[:10]:  # First 10 columns
            sample_data[col] = {
                'type': str(df[col].dtype),
                'null_count': int(df[col].isnull().sum()),
                'unique_count': int(df[col].nunique())
            }

        table_analysis[table_name] = {
            'description': SAP_TABLE_DESCRIPTIONS.get(table_name, 'Unknown / custom table'),
            'file_count': len(files),
            'total_rows': total_rows,
            'columns': columns,
            'column_count': len(columns),
            'key_columns': found_keys,
            'sample_columns': sample_data
        }

    return table_analysis

def generate_markdown_report(inventory: List[Dict], conversion_results: List[Dict],
                            table_analysis: Dict, output_path: Path):
    """Generate comprehensive Markdown report"""

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write("# BBraun SAP Data Analysis Report\n\n")
        f.write(f"**Generated:** {pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")

        # File Inventory
        f.write("## 1. File Inventory\n\n")
        f.write(f"Found **{len(inventory)}** SAP data files:\n\n")
        f.write("| SAP Table | File Name | Folder | Extension |\n")
        f.write("|-----------|-----------|--------|------------|\n")
        for item in inventory:
            f.write(f"| {item['sap_table']} | {item['file_name']} | {item['folder']} | {item['extension']} |\n")

        # Conversion Results
        f.write("\n## 2. Parquet Conversion Results\n\n")
        f.write(f"Successfully converted **{len(conversion_results)}** files:\n\n")
        f.write("| SAP Table | Source File | Rows | Columns | Parquet Path |\n")
        f.write("|-----------|-------------|------|---------|-------------|\n")
        for result in conversion_results:
            f.write(f"| {result['sap_table']} | {result['source_file']} | {result['rows']:,} | {result['columns']} | `{result['parquet_path']}` |\n")

        # Data Dictionary
        f.write("\n## 3. Data Dictionary\n\n")

        for table_name, analysis in sorted(table_analysis.items()):
            f.write(f"### {table_name}\n\n")
            f.write(f"**Description:** {analysis['description']}\n\n")
            f.write(f"- **Files:** {analysis['file_count']}\n")
            f.write(f"- **Total Rows:** {analysis['total_rows']:,}\n")
            f.write(f"- **Columns:** {analysis['column_count']}\n")

            if analysis['key_columns']:
                f.write(f"- **Key Fields:** {', '.join(analysis['key_columns'])}\n")

            f.write(f"\n**Columns:**\n")
            for i, col in enumerate(analysis['columns'], 1):
                f.write(f"{i}. `{col}`")
                if col in analysis['sample_columns']:
                    info = analysis['sample_columns'][col]
                    f.write(f" ({info['type']}, {info['unique_count']} unique values)")
                f.write("\n")

            f.write("\n")

        # PR→PO Relevant Tables
        f.write("\n## 4. PR→PO / Procurement Relevant Tables\n\n")
        f.write("### Core Procurement Flow Tables\n\n")

        relevant_tables = {
            'EBAN': 'Purchase Requisition data - Starting point',
            'EKKO': 'PO Header - Main PO document',
            'EKPO': 'PO Items - Line item details',
            'EKAB': 'PO Release strategy - Approval workflow',
            'EKES': 'Vendor confirmations - Delivery tracking',
        }

        for table, desc in relevant_tables.items():
            if table in table_analysis:
                f.write(f"- **{table}**: {desc} ({table_analysis[table]['total_rows']:,} rows)\n")

        f.write("\n### Master Data Tables\n\n")

        master_tables = {
            'MARA': 'Material master - Product catalog',
            'MARC': 'Material plant data - Stock/MRP',
            'MAKT': 'Material descriptions',
            'LFA1': 'Vendor master - Supplier info',
            'LFM1': 'Vendor purchasing org data',
            'EINA': 'Purchase info records',
            'EINE': 'Purchase info org data',
            'EORD': 'Source list - Preferred suppliers',
        }

        for table, desc in master_tables.items():
            if table in table_analysis:
                f.write(f"- **{table}**: {desc} ({table_analysis[table]['total_rows']:,} rows)\n")

        f.write("\n### Inventory & Planning Tables\n\n")

        inventory_tables = {
            'MB52': 'Warehouse stock - Current inventory',
            'MD04': 'MRP elements - Requirements/supply',
        }

        for table, desc in inventory_tables.items():
            if table in table_analysis:
                f.write(f"- **{table}**: {desc} ({table_analysis[table]['total_rows']:,} rows)\n")

        # Relationships
        f.write("\n## 5. Key Relationships\n\n")
        f.write("```\n")
        f.write("PR → PO Flow:\n")
        f.write("EBAN (PR)           → EKKO/EKPO (PO)\n")
        f.write("  ↓ BANFN              ↓ EBELN\n")
        f.write("  ↓ MATNR              ↓ MATNR\n")
        f.write("  ↓ WERKS              ↓ WERKS\n")
        f.write("\n")
        f.write("Master Data:\n")
        f.write("MARA/MARC/MAKT (Materials) ← MATNR → EKPO/EBAN\n")
        f.write("LFA1/LFM1 (Vendors)        ← LIFNR → EKKO\n")
        f.write("EINA/EINE (Info Records)   ← INFNR → MATNR+LIFNR\n")
        f.write("EORD (Source List)         ← MATNR+WERKS → LIFNR\n")
        f.write("\n")
        f.write("Inventory:\n")
        f.write("MB52/MARD (Stock)          ← MATNR+WERKS+LGORT\n")
        f.write("MD04 (MRP)                 ← MATNR+WERKS\n")
        f.write("```\n")

def main():
    """Main execution"""
    base_path = Path('/Users/gabriel.chitic/PR2POPrototype/BBraun_Data')
    folders = ['Operationale Daten Direkt', 'Stammdaten Direct']

    print("=" * 80)
    print("BBraun SAP Data Analysis")
    print("=" * 80)

    # Step 1: Scan files
    print("\n[1/4] Scanning files...")
    inventory = scan_files(base_path, folders)
    print(f"✓ Found {len(inventory)} files")

    # Step 2: Convert to Parquet
    print("\n[2/4] Converting to Parquet...")
    conversion_results = convert_to_parquet(inventory, base_path)
    print(f"✓ Converted {len(conversion_results)} files")

    # Step 3: Analyze data
    print("\n[3/4] Analyzing data structure...")
    table_analysis = analyze_data(conversion_results, base_path)
    print(f"✓ Analyzed {len(table_analysis)} distinct tables")

    # Step 4: Generate report
    print("\n[4/4] Generating report...")
    report_path = base_path / 'BBraun_Data_Analysis_Report.md'
    generate_markdown_report(inventory, conversion_results, table_analysis, report_path)
    print(f"✓ Report saved: {report_path}")

    print("\n" + "=" * 80)
    print("SUMMARY")
    print("=" * 80)
    print(f"Files scanned:     {len(inventory)}")
    print(f"Files converted:   {len(conversion_results)}")
    print(f"SAP tables found:  {len(table_analysis)}")
    print(f"Total rows:        {sum(t['total_rows'] for t in table_analysis.values()):,}")
    print(f"Report location:   {report_path}")
    print("=" * 80)

    # Print key tables
    print("\n🔑 KEY TABLES FOR PR→PO FLOW:")
    priority_tables = ['EBAN', 'EKKO', 'EKPO', 'EKAB', 'EKES', 'MARA', 'LFA1']
    for table in priority_tables:
        if table in table_analysis:
            analysis = table_analysis[table]
            print(f"  • {table:8} - {analysis['description']} ({analysis['total_rows']:,} rows)")

if __name__ == '__main__':
    main()
