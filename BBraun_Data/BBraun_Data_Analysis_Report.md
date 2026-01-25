# BBraun SAP Data Analysis Report

**Generated:** 2026-01-22 21:36:59

## 1. File Inventory

Found **24** SAP data files:

| SAP Table | File Name | Folder | Extension |
|-----------|-----------|--------|------------|
| ADR | 26_01_14_ADR_direct.xls | Stammdaten Direct | .xls |
| ADRC | 26_01_14_ADRC_direct.xls | Stammdaten Direct | .xls |
| EBAN | 26_01_14_EBAN_direct_unbearbeitet.xls | Operationale Daten Direkt | .xls |
| EBAN | 26_01_14_EBAN_direct.xls | Operationale Daten Direkt | .xls |
| EINA | 26_01_14_EINA_EINE_direct.xlsx | Stammdaten Direct | .xlsx |
| EKAB | 26_01_14_EKAB_Kontrakte_direct.xls | Operationale Daten Direkt | .xls |
| EKES | 26_01_15_EKES_direct_gesamt.xls.xlsx | Operationale Daten Direkt | .xlsx |
| EKKO | 26_01_14_EKKO_EKPO_direct_2024_2025.xlsx | Operationale Daten Direkt | .xlsx |
| EKKO | 26_01_14_EKKO_Kontrakte_direct.xls | Operationale Daten Direkt | .xls |
| EKKO | 26_01_14_EKKO_Kontrakte_direct.xls | Stammdaten Direct | .xls |
| EKPO | 26_01_14_EKPO_Kontrakte_direct.xls | Operationale Daten Direkt | .xls |
| EKPO | 26_01_14_EKPO_Kontrakte_direct.xls | Stammdaten Direct | .xls |
| EORD | 26_01_14_EORD_direct.xls | Stammdaten Direct | .xls |
| KNVK | 26_01_14_KNVK_direct.xls | Stammdaten Direct | .xls |
| LFA1 | 26_01_14_LFA1_direct.xls | Stammdaten Direct | .xls |
| LFM1 | 26_01_14_LFM1_direct.xls | Stammdaten Direct | .xls |
| MAKT | 26_01_14_MAKT_direct.xls | Stammdaten Direct | .xls |
| MARA | 26_01_14_MARA_direct.xls | Stammdaten Direct | .xls |
| MARC | 26_01_14_MARC_direct.xls | Stammdaten Direct | .xls |
| MARD | 26_01_14_MARD_Kontraktmaterial_direct.xls | Stammdaten Direct | .xls |
| MB52 | 26_01_15_MB52 Bestände.xlsx | Operationale Daten Direkt | .xlsx |
| MD04 | 26_01_15_ MD04_ELEMENTS.csv | Operationale Daten Direkt | .csv |
| QINF | 26_01_14_QINF_direct.xls | Stammdaten Direct | .xls |
| ZPP20 | 26_01_15_ZPP20_VER Monatsverbräuche.xlsx | Operationale Daten Direkt | .xlsx |

## 2. Parquet Conversion Results

Successfully converted **24** files:

| SAP Table | Source File | Rows | Columns | Parquet Path |
|-----------|-------------|------|---------|-------------|
| ADR | 26_01_14_ADR_direct.xls | 4,902 | 11 | `/Users/gabriel.chitic/PR2POPrototype/BBraun_Data/parquet/Stammdaten Direct/26_01_14_ADR_direct.parquet` |
| ADRC | 26_01_14_ADRC_direct.xls | 3,142 | 18 | `/Users/gabriel.chitic/PR2POPrototype/BBraun_Data/parquet/Stammdaten Direct/26_01_14_ADRC_direct.parquet` |
| EBAN | 26_01_14_EBAN_direct_unbearbeitet.xls | 1,362 | 25 | `/Users/gabriel.chitic/PR2POPrototype/BBraun_Data/parquet/Operationale Daten Direkt/26_01_14_EBAN_direct_unbearbeitet.parquet` |
| EBAN | 26_01_14_EBAN_direct.xls | 173,238 | 30 | `/Users/gabriel.chitic/PR2POPrototype/BBraun_Data/parquet/Operationale Daten Direkt/26_01_14_EBAN_direct.parquet` |
| EINA | 26_01_14_EINA_EINE_direct.xlsx | 10,416 | 18 | `/Users/gabriel.chitic/PR2POPrototype/BBraun_Data/parquet/Stammdaten Direct/26_01_14_EINA_EINE_direct.parquet` |
| EKAB | 26_01_14_EKAB_Kontrakte_direct.xls | 6,266 | 16 | `/Users/gabriel.chitic/PR2POPrototype/BBraun_Data/parquet/Operationale Daten Direkt/26_01_14_EKAB_Kontrakte_direct.parquet` |
| EKES | 26_01_15_EKES_direct_gesamt.xls.xlsx | 18,647 | 31 | `/Users/gabriel.chitic/PR2POPrototype/BBraun_Data/parquet/Operationale Daten Direkt/26_01_15_EKES_direct_gesamt.xls.parquet` |
| EKKO | 26_01_14_EKKO_EKPO_direct_2024_2025.xlsx | 54,373 | 31 | `/Users/gabriel.chitic/PR2POPrototype/BBraun_Data/parquet/Operationale Daten Direkt/26_01_14_EKKO_EKPO_direct_2024_2025.parquet` |
| EKKO | 26_01_14_EKKO_Kontrakte_direct.xls | 1,648 | 24 | `/Users/gabriel.chitic/PR2POPrototype/BBraun_Data/parquet/Operationale Daten Direkt/26_01_14_EKKO_Kontrakte_direct.parquet` |
| EKKO | 26_01_14_EKKO_Kontrakte_direct.xls | 1,648 | 24 | `/Users/gabriel.chitic/PR2POPrototype/BBraun_Data/parquet/Stammdaten Direct/26_01_14_EKKO_Kontrakte_direct.parquet` |
| EKPO | 26_01_14_EKPO_Kontrakte_direct.xls | 2,108 | 21 | `/Users/gabriel.chitic/PR2POPrototype/BBraun_Data/parquet/Operationale Daten Direkt/26_01_14_EKPO_Kontrakte_direct.parquet` |
| EKPO | 26_01_14_EKPO_Kontrakte_direct.xls | 2,108 | 21 | `/Users/gabriel.chitic/PR2POPrototype/BBraun_Data/parquet/Stammdaten Direct/26_01_14_EKPO_Kontrakte_direct.parquet` |
| EORD | 26_01_14_EORD_direct.xls | 5,412 | 20 | `/Users/gabriel.chitic/PR2POPrototype/BBraun_Data/parquet/Stammdaten Direct/26_01_14_EORD_direct.parquet` |
| KNVK | 26_01_14_KNVK_direct.xls | 1,998 | 14 | `/Users/gabriel.chitic/PR2POPrototype/BBraun_Data/parquet/Stammdaten Direct/26_01_14_KNVK_direct.parquet` |
| LFA1 | 26_01_14_LFA1_direct.xls | 3,136 | 19 | `/Users/gabriel.chitic/PR2POPrototype/BBraun_Data/parquet/Stammdaten Direct/26_01_14_LFA1_direct.parquet` |
| LFM1 | 26_01_14_LFM1_direct.xls | 3,136 | 19 | `/Users/gabriel.chitic/PR2POPrototype/BBraun_Data/parquet/Stammdaten Direct/26_01_14_LFM1_direct.parquet` |
| MAKT | 26_01_14_MAKT_direct.xls | 39,238 | 13 | `/Users/gabriel.chitic/PR2POPrototype/BBraun_Data/parquet/Stammdaten Direct/26_01_14_MAKT_direct.parquet` |
| MARA | 26_01_14_MARA_direct.xls | 39,238 | 16 | `/Users/gabriel.chitic/PR2POPrototype/BBraun_Data/parquet/Stammdaten Direct/26_01_14_MARA_direct.parquet` |
| MARC | 26_01_14_MARC_direct.xls | 39,212 | 23 | `/Users/gabriel.chitic/PR2POPrototype/BBraun_Data/parquet/Stammdaten Direct/26_01_14_MARC_direct.parquet` |
| MARD | 26_01_14_MARD_Kontraktmaterial_direct.xls | 7,270 | 14 | `/Users/gabriel.chitic/PR2POPrototype/BBraun_Data/parquet/Stammdaten Direct/26_01_14_MARD_Kontraktmaterial_direct.parquet` |
| MB52 | 26_01_15_MB52 Bestände.xlsx | 6,555 | 31 | `/Users/gabriel.chitic/PR2POPrototype/BBraun_Data/parquet/Operationale Daten Direkt/26_01_15_MB52 Bestände.parquet` |
| MD04 | 26_01_15_ MD04_ELEMENTS.csv | 320,493 | 16 | `/Users/gabriel.chitic/PR2POPrototype/BBraun_Data/parquet/Operationale Daten Direkt/26_01_15_ MD04_ELEMENTS.parquet` |
| QINF | 26_01_14_QINF_direct.xls | 40,344 | 15 | `/Users/gabriel.chitic/PR2POPrototype/BBraun_Data/parquet/Stammdaten Direct/26_01_14_QINF_direct.parquet` |
| ZPP20 | 26_01_15_ZPP20_VER Monatsverbräuche.xlsx | 9,808 | 24 | `/Users/gabriel.chitic/PR2POPrototype/BBraun_Data/parquet/Operationale Daten Direkt/26_01_15_ZPP20_VER Monatsverbräuche.parquet` |

## 3. Data Dictionary

### ADR

**Description:** Address data

- **Files:** 1
- **Total Rows:** 4,902
- **Columns:** 11

**Columns:**
1. `Unnamed: 0` (float64, 0 unique values)
2. `Unnamed: 1` (float64, 0 unique values)
3. `Unnamed: 2` (float64, 0 unique values)
4. `Unnamed: 3` (float64, 0 unique values)
5. `Unnamed: 4` (float64, 0 unique values)
6. `Unnamed: 5` (float64, 0 unique values)
7. `Unnamed: 6` (float64, 0 unique values)
8. `Unnamed: 7` (float64, 0 unique values)
9. `Unnamed: 8` (float64, 0 unique values)
10. `Unnamed: 9` (float64, 0 unique values)
11. `Unnamed: 10`

### ADRC

**Description:** Address data (Communication)

- **Files:** 1
- **Total Rows:** 3,142
- **Columns:** 18

**Columns:**
1. `Unnamed: 0` (float64, 0 unique values)
2. `Unnamed: 1` (float64, 0 unique values)
3. `Unnamed: 2` (float64, 0 unique values)
4. `Unnamed: 3` (float64, 0 unique values)
5. `Unnamed: 4` (float64, 0 unique values)
6. `Unnamed: 5` (float64, 0 unique values)
7. `Unnamed: 6` (float64, 0 unique values)
8. `Unnamed: 7` (float64, 0 unique values)
9. `Unnamed: 8` (float64, 0 unique values)
10. `Unnamed: 9` (float64, 0 unique values)
11. `Unnamed: 10`
12. `Unnamed: 11`
13. `Unnamed: 12`
14. `Unnamed: 13`
15. `Unnamed: 14`
16. `Unnamed: 15`
17. `Unnamed: 16`
18. `Unnamed: 17`

### EBAN

**Description:** Purchase Requisition (PR) - Header and item data

- **Files:** 2
- **Total Rows:** 174,600
- **Columns:** 25

**Columns:**
1. `Unnamed: 0` (float64, 0 unique values)
2. `Unnamed: 1` (float64, 0 unique values)
3. `Unnamed: 2` (float64, 0 unique values)
4. `Unnamed: 3` (float64, 0 unique values)
5. `Unnamed: 4` (float64, 0 unique values)
6. `Unnamed: 5` (float64, 0 unique values)
7. `Unnamed: 6` (float64, 0 unique values)
8. `Unnamed: 7` (float64, 0 unique values)
9. `Unnamed: 8` (float64, 0 unique values)
10. `Unnamed: 9` (float64, 0 unique values)
11. `Unnamed: 10`
12. `Unnamed: 11`
13. `Unnamed: 12`
14. `Unnamed: 13`
15. `Unnamed: 14`
16. `Unnamed: 15`
17. `Unnamed: 16`
18. `Unnamed: 17`
19. `Unnamed: 18`
20. `Unnamed: 19`
21. `Unnamed: 20`
22. `Unnamed: 21`
23. `Unnamed: 22`
24. `Unnamed: 23`
25. `Unnamed: 24`

### EINA

**Description:** Purchasing Info Record - General data

- **Files:** 1
- **Total Rows:** 10,416
- **Columns:** 18

**Columns:**
1. `Infosatz` (int64, 10027 unique values)
2. `Material` (object, 8817 unique values)
3. `EkOr` (object, 1 unique values)
4. `Typ` (int64, 3 unique values)
5. `EKG` (object, 155 unique values)
6. `Lieferant` (int64, 738 unique values)
7. `SortBegr` (float64, 0 unique values)
8. `Kurztext` (float64, 0 unique values)
9. `Werk` (float64, 0 unique values)
10. `Datum` (datetime64[ns], 1149 unique values)
11. `LKA`
12. `E`
13. `Infosatz.1`
14. `Nettopreis`
15. `Nettopreis.1`
16. `pro`
17. `BPM`
18. `BPf`

### EKAB

**Description:** Purchase Order Release Documentation

- **Files:** 1
- **Total Rows:** 6,266
- **Columns:** 16

**Columns:**
1. `Unnamed: 0` (float64, 0 unique values)
2. `Unnamed: 1` (float64, 0 unique values)
3. `Unnamed: 2` (float64, 0 unique values)
4. `Unnamed: 3` (float64, 0 unique values)
5. `Unnamed: 4` (float64, 0 unique values)
6. `Unnamed: 5` (float64, 0 unique values)
7. `Unnamed: 6` (float64, 0 unique values)
8. `Unnamed: 7` (float64, 0 unique values)
9. `Unnamed: 8` (float64, 0 unique values)
10. `Unnamed: 9` (float64, 0 unique values)
11. `Unnamed: 10`
12. `Unnamed: 11`
13. `Unnamed: 12`
14. `Unnamed: 13`
15. `Unnamed: 14`
16. `Unnamed: 15`

### EKES

**Description:** Vendor Confirmations

- **Files:** 1
- **Total Rows:** 18,647
- **Columns:** 31

**Columns:**
1. `Mandant` (int64, 1 unique values)
2. `Einkaufsbeleg` (int64, 16042 unique values)
3. `Position` (int64, 9 unique values)
4. `Lfd. Nummer` (int64, 7 unique values)
5. `Bestätigungstyp` (object, 3 unique values)
6. `LiefDatum` (datetime64[ns], 452 unique values)
7. `Lieferdatum` (int64, 2 unique values)
8. `Uhrzeit` (object, 49 unique values)
9. `ErstellDatum` (object, 300 unique values)
10. `ErstellZeit` (object, 12998 unique values)
11. `Menge`
12. `Abgebaute Menge`
13. `Erstellungs-Kz`
14. `LöschKennz`
15. `Disporelevant`
16. `Referenz`
17. `Lieferung`
18. `Position.1`
19. `HerstTeileprofil`
20. `HTN-Material`
21. `Anz.Mahnungen`
22. `Charge`
23. `Üb.Pos.Charge`
24. `Lfd. Nummer.1`
25. `Im Werk`
26. `Lieferung.1`
27. `Position.2`
28. `Übergabedatum`
29. `Übergabezeit`
30. `Bestandssegment`
31. `Zugeord Bestand`

### EKKO

**Description:** Purchase Order (PO) - Header data

- **Files:** 3
- **Total Rows:** 57,669
- **Columns:** 31

**Columns:**
1. `EinkBeleg` (int64, 53229 unique values)
2. `BuKr` (int64, 1 unique values)
3. `T` (object, 3 unique values)
4. `Art` (object, 5 unique values)
5. `Lieferant` (int64, 576 unique values)
6. `EkOr` (object, 2 unique values)
7. `EKG` (object, 146 unique values)
8. `BelegDat` (datetime64[ns], 619 unique values)
9. `Pos` (int64, 123 unique values)
10. `Material` (object, 6492 unique values)
11. `Werk`
12. `Kurztext`
13. `Banf`
14. `Bestellmenge`
15. `Bestellmenge.1`
16. `BME`
17. `PZt`
18. `Infosatz`
19. `Währg`
20. `BPM`
21. `Nettopreis`
22. `Nettopreis.1`
23. `pro`
24. `BPf`
25. `ZBed`
26. `IncoOrt 1`
27. `IncoV`
28. `EinkBeleg.1`
29. `BuKr.1`
30. `Tol.Überlief`
31. `Tol.Unterlief`

### EKPO

**Description:** Purchase Order (PO) - Item data

- **Files:** 2
- **Total Rows:** 4,216
- **Columns:** 21

**Columns:**
1. `Unnamed: 0` (float64, 0 unique values)
2. `Unnamed: 1` (float64, 0 unique values)
3. `Unnamed: 2` (float64, 0 unique values)
4. `Unnamed: 3` (float64, 0 unique values)
5. `Unnamed: 4` (float64, 0 unique values)
6. `Unnamed: 5` (float64, 0 unique values)
7. `Unnamed: 6` (float64, 0 unique values)
8. `Unnamed: 7` (float64, 0 unique values)
9. `Unnamed: 8` (float64, 0 unique values)
10. `Unnamed: 9` (float64, 0 unique values)
11. `Unnamed: 10`
12. `Unnamed: 11`
13. `Unnamed: 12`
14. `Unnamed: 13`
15. `Unnamed: 14`
16. `Unnamed: 15`
17. `Unnamed: 16`
18. `Unnamed: 17`
19. `Unnamed: 18`
20. `Unnamed: 19`
21. `Unnamed: 20`

### EORD

**Description:** Source List (Preferred suppliers)

- **Files:** 1
- **Total Rows:** 5,412
- **Columns:** 20

**Columns:**
1. `Unnamed: 0` (float64, 0 unique values)
2. `Unnamed: 1` (float64, 0 unique values)
3. `Unnamed: 2` (float64, 0 unique values)
4. `Unnamed: 3` (float64, 0 unique values)
5. `Unnamed: 4` (float64, 0 unique values)
6. `Unnamed: 5` (float64, 0 unique values)
7. `Unnamed: 6` (float64, 0 unique values)
8. `Unnamed: 7` (float64, 0 unique values)
9. `Unnamed: 8` (float64, 0 unique values)
10. `Unnamed: 9` (float64, 0 unique values)
11. `Unnamed: 10`
12. `Unnamed: 11`
13. `Unnamed: 12`
14. `Unnamed: 13`
15. `Unnamed: 14`
16. `Unnamed: 15`
17. `Unnamed: 16`
18. `Unnamed: 17`
19. `Unnamed: 18`
20. `Unnamed: 19`

### KNVK

**Description:** Customer Master - Contact persons

- **Files:** 1
- **Total Rows:** 1,998
- **Columns:** 14

**Columns:**
1. `Unnamed: 0` (float64, 0 unique values)
2. `Unnamed: 1` (float64, 0 unique values)
3. `Unnamed: 2` (float64, 0 unique values)
4. `Unnamed: 3` (float64, 0 unique values)
5. `Unnamed: 4` (float64, 0 unique values)
6. `Unnamed: 5` (float64, 0 unique values)
7. `Unnamed: 6` (float64, 0 unique values)
8. `Unnamed: 7` (float64, 0 unique values)
9. `Unnamed: 8` (float64, 0 unique values)
10. `Unnamed: 9` (float64, 0 unique values)
11. `Unnamed: 10`
12. `Unnamed: 11`
13. `Unnamed: 12`
14. `Unnamed: 13`

### LFA1

**Description:** Vendor Master - General data

- **Files:** 1
- **Total Rows:** 3,136
- **Columns:** 19

**Columns:**
1. `Unnamed: 0` (float64, 0 unique values)
2. `Unnamed: 1` (float64, 0 unique values)
3. `Unnamed: 2` (float64, 0 unique values)
4. `Unnamed: 3` (float64, 0 unique values)
5. `Unnamed: 4` (float64, 0 unique values)
6. `Unnamed: 5` (float64, 0 unique values)
7. `Unnamed: 6` (float64, 0 unique values)
8. `Unnamed: 7` (float64, 0 unique values)
9. `Unnamed: 8` (float64, 0 unique values)
10. `Unnamed: 9` (float64, 0 unique values)
11. `Unnamed: 10`
12. `Unnamed: 11`
13. `Unnamed: 12`
14. `Unnamed: 13`
15. `Unnamed: 14`
16. `Unnamed: 15`
17. `Unnamed: 16`
18. `Unnamed: 17`
19. `Unnamed: 18`

### LFM1

**Description:** Vendor Master - Purchasing organization data

- **Files:** 1
- **Total Rows:** 3,136
- **Columns:** 19

**Columns:**
1. `Unnamed: 0` (float64, 0 unique values)
2. `Unnamed: 1` (float64, 0 unique values)
3. `Unnamed: 2` (float64, 0 unique values)
4. `Unnamed: 3` (float64, 0 unique values)
5. `Unnamed: 4` (float64, 0 unique values)
6. `Unnamed: 5` (float64, 0 unique values)
7. `Unnamed: 6` (float64, 0 unique values)
8. `Unnamed: 7` (float64, 0 unique values)
9. `Unnamed: 8` (float64, 0 unique values)
10. `Unnamed: 9` (float64, 0 unique values)
11. `Unnamed: 10`
12. `Unnamed: 11`
13. `Unnamed: 12`
14. `Unnamed: 13`
15. `Unnamed: 14`
16. `Unnamed: 15`
17. `Unnamed: 16`
18. `Unnamed: 17`
19. `Unnamed: 18`

### MAKT

**Description:** Material Descriptions

- **Files:** 1
- **Total Rows:** 39,238
- **Columns:** 13

**Columns:**
1. `Unnamed: 0` (float64, 0 unique values)
2. `Unnamed: 1` (float64, 0 unique values)
3. `Unnamed: 2` (float64, 0 unique values)
4. `Unnamed: 3` (float64, 0 unique values)
5. `Unnamed: 4` (float64, 0 unique values)
6. `Unnamed: 5` (float64, 0 unique values)
7. `Unnamed: 6` (float64, 0 unique values)
8. `Unnamed: 7` (float64, 0 unique values)
9. `Unnamed: 8` (float64, 0 unique values)
10. `Unnamed: 9` (float64, 0 unique values)
11. `Unnamed: 10`
12. `Unnamed: 11`
13. `Unnamed: 12`

### MARA

**Description:** Material Master - General data

- **Files:** 1
- **Total Rows:** 39,238
- **Columns:** 16

**Columns:**
1. `Unnamed: 0` (float64, 0 unique values)
2. `Unnamed: 1` (float64, 0 unique values)
3. `Unnamed: 2` (float64, 0 unique values)
4. `Unnamed: 3` (float64, 0 unique values)
5. `Unnamed: 4` (float64, 0 unique values)
6. `Unnamed: 5` (float64, 0 unique values)
7. `Unnamed: 6` (float64, 0 unique values)
8. `Unnamed: 7` (float64, 0 unique values)
9. `Unnamed: 8` (float64, 0 unique values)
10. `Unnamed: 9` (float64, 0 unique values)
11. `Unnamed: 10`
12. `Unnamed: 11`
13. `Unnamed: 12`
14. `Unnamed: 13`
15. `Unnamed: 14`
16. `Unnamed: 15`

### MARC

**Description:** Material Master - Plant data

- **Files:** 1
- **Total Rows:** 39,212
- **Columns:** 23

**Columns:**
1. `Unnamed: 0` (float64, 0 unique values)
2. `Unnamed: 1` (float64, 0 unique values)
3. `Unnamed: 2` (float64, 0 unique values)
4. `Unnamed: 3` (float64, 0 unique values)
5. `Unnamed: 4` (float64, 0 unique values)
6. `Unnamed: 5` (float64, 0 unique values)
7. `Unnamed: 6` (float64, 0 unique values)
8. `Unnamed: 7` (float64, 0 unique values)
9. `Unnamed: 8` (float64, 0 unique values)
10. `Unnamed: 9` (float64, 0 unique values)
11. `Unnamed: 10`
12. `Unnamed: 11`
13. `Unnamed: 12`
14. `Unnamed: 13`
15. `Unnamed: 14`
16. `Unnamed: 15`
17. `Unnamed: 16`
18. `Unnamed: 17`
19. `Unnamed: 18`
20. `Unnamed: 19`
21. `Unnamed: 20`
22. `Unnamed: 21`
23. `Unnamed: 22`

### MARD

**Description:** Material Master - Storage location data

- **Files:** 1
- **Total Rows:** 7,270
- **Columns:** 14

**Columns:**
1. `Unnamed: 0` (float64, 0 unique values)
2. `Unnamed: 1` (float64, 0 unique values)
3. `Unnamed: 2` (float64, 0 unique values)
4. `Unnamed: 3` (float64, 0 unique values)
5. `Unnamed: 4` (float64, 0 unique values)
6. `Unnamed: 5` (float64, 0 unique values)
7. `Unnamed: 6` (float64, 0 unique values)
8. `Unnamed: 7` (float64, 0 unique values)
9. `Unnamed: 8` (float64, 0 unique values)
10. `Unnamed: 9` (float64, 0 unique values)
11. `Unnamed: 10`
12. `Unnamed: 11`
13. `Unnamed: 12`
14. `Unnamed: 13`

### MB52

**Description:** Warehouse Stock (Inventory)

- **Files:** 1
- **Total Rows:** 6,555
- **Columns:** 31

**Columns:**
1. `Material` (object, 3315 unique values)
2. `Werk` (object, 2 unique values)
3. `Lagerort` (object, 57 unique values)
4. `Sonderbestand` (object, 6 unique values)
5. `Sonderbestand Bezeichnung` (object, 6 unique values)
6. `Bewertung SondBest` (object, 2 unique values)
7. `Sonderbestandsnummer` (object, 62 unique values)
8. `LV Lagerortebene` (object, 2 unique values)
9. `Charge` (object, 3317 unique values)
10. `Basismengeneinheit` (object, 8 unique values)
11. `Bestandssegment`
12. `Währung`
13. `Frei verwendbar`
14. `Wert frei verwend.`
15. `Transit und Umlag`
16. `Wert in Tra. u. Um`
17. `In Qualitätsprüfung`
18. `Wert in QualPrüfng`
19. `Nicht freier Bestand`
20. `Wert nicht frei`
21. `Gesperrt`
22. `Wert Sperrbestand`
23. `Retouren`
24. `Wert RetourenSperr`
25. `In Umlagerung (Werk)`
26. `Wert in Umlagerung`
27. `Transitbestand`
28. `Wert in Transit`
29. `Debitor`
30. `Vertriebsbeleg`
31. `Position (SD)`

### MD04

**Description:** MRP Stock/Requirements List

- **Files:** 1
- **Total Rows:** 320,493
- **Columns:** 16

**Columns:**
1. `Material` (object, 4523 unique values)
2. `Description` (object, 3910 unique values)
3. `Plant` (object, 1 unique values)
4. `GSCR` (object, 21 unique values)
5. `MRP_ctrl` (object, 83 unique values)
6. `Product_hierarchy` (object, 172 unique values)
7. `Exception_msg2` (float64, 0 unique values)
8. `Exception_msg1` (float64, 10 unique values)
9. `Recipt_Requiremet_Date` (int64, 741 unique values)
10. `MRP_element` (object, 29 unique values)
11. `MRP_element_detail`
12. `Resched_date`
13. `Requ_deliv_date`
14. `Qty_received_required`
15. `Qty_avail`
16. `MRP-area`

### QINF

**Description:** Quality Info Records

- **Files:** 1
- **Total Rows:** 40,344
- **Columns:** 15

**Columns:**
1. `Unnamed: 0` (float64, 0 unique values)
2. `Unnamed: 1` (float64, 0 unique values)
3. `Unnamed: 2` (float64, 0 unique values)
4. `Unnamed: 3` (float64, 0 unique values)
5. `Unnamed: 4` (float64, 0 unique values)
6. `Unnamed: 5` (float64, 0 unique values)
7. `Unnamed: 6` (float64, 0 unique values)
8. `Unnamed: 7` (float64, 0 unique values)
9. `Unnamed: 8` (float64, 0 unique values)
10. `Unnamed: 9` (float64, 0 unique values)
11. `Unnamed: 10`
12. `Unnamed: 11`
13. `Unnamed: 12`
14. `Unnamed: 13`
15. `Unnamed: 14`

### ZPP20

**Description:** Custom table - Monthly consumption (Z-tables are custom)

- **Files:** 1
- **Total Rows:** 9,808
- **Columns:** 24

**Columns:**
1. `MATERIAL` (object, 5175 unique values)
2. `MART` (object, 25 unique values)
3. `MATKL` (object, 249 unique values)
4. `ME` (object, 7 unique values)
5. `WERK` (object, 2 unique values)
6. `EK` (object, 97 unique values)
7. `DGR` (object, 87 unique values)
8. `DI` (object, 11 unique values)
9. `LG` (object, 3 unique values)
10. `LOSGR.` (int64, 242 unique values)
11. `JAHR`
12. `GESAMTVERBRAUCH`
13. `JANUAR`
14. `FEBRUAR`
15. `MÄRZ`
16. `APRIL`
17. `MAI`
18. `JUNI`
19. `JULI`
20. `AUGUST`
21. `SEPTEMBER`
22. `OKTOBER`
23. `NOVEMBER`
24. `DEZEMBER`


## 4. PR→PO / Procurement Relevant Tables

### Core Procurement Flow Tables

- **EBAN**: Purchase Requisition data - Starting point (174,600 rows)
- **EKKO**: PO Header - Main PO document (57,669 rows)
- **EKPO**: PO Items - Line item details (4,216 rows)
- **EKAB**: PO Release strategy - Approval workflow (6,266 rows)
- **EKES**: Vendor confirmations - Delivery tracking (18,647 rows)

### Master Data Tables

- **MARA**: Material master - Product catalog (39,238 rows)
- **MARC**: Material plant data - Stock/MRP (39,212 rows)
- **MAKT**: Material descriptions (39,238 rows)
- **LFA1**: Vendor master - Supplier info (3,136 rows)
- **LFM1**: Vendor purchasing org data (3,136 rows)
- **EINA**: Purchase info records (10,416 rows)
- **EORD**: Source list - Preferred suppliers (5,412 rows)

### Inventory & Planning Tables

- **MB52**: Warehouse stock - Current inventory (6,555 rows)
- **MD04**: MRP elements - Requirements/supply (320,493 rows)

## 5. Key Relationships

```
PR → PO Flow:
EBAN (PR)           → EKKO/EKPO (PO)
  ↓ BANFN              ↓ EBELN
  ↓ MATNR              ↓ MATNR
  ↓ WERKS              ↓ WERKS

Master Data:
MARA/MARC/MAKT (Materials) ← MATNR → EKPO/EBAN
LFA1/LFM1 (Vendors)        ← LIFNR → EKKO
EINA/EINE (Info Records)   ← INFNR → MATNR+LIFNR
EORD (Source List)         ← MATNR+WERKS → LIFNR

Inventory:
MB52/MARD (Stock)          ← MATNR+WERKS+LGORT
MD04 (MRP)                 ← MATNR+WERKS
```
