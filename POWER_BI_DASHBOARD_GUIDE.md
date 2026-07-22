# Microsoft Power BI Dashboard Setup & Architecture Guide

This guide provides step-by-step instructions to load the cleaned Mumbai housing dataset (`mumbai_house_data_cleaned.csv` or `mumbai_housing.db`), apply the custom **Dark/Glassmorphism Theme**, create the DAX measures, and build a 3-page modern Power BI report.

---

## 1. Connecting Data Sources in Power BI Desktop

### Option A: CSV Direct Import (Recommended)
1. Open **Microsoft Power BI Desktop**.
2. Click **Get Data** $\rightarrow$ **Text/CSV**.
3. Browse and select `mumbai_house_data_cleaned.csv` located in `c:\Users\TARUN\Data Analytics\Mumbai HRP\`.
4. Click **Load** (Data is pre-cleaned and formatted).

### Option B: SQLite Database Connection
1. Click **Get Data** $\rightarrow$ **More...** $\rightarrow$ **ODBC** (or SQLite Connector).
2. Connect to `mumbai_housing.db` located in `c:\Users\TARUN\Data Analytics\Mumbai HRP\`.
3. Select `fact_mumbai_housing`, `dim_locality`, `v_region_summary`, and `v_price_segment_analysis`.

---

## 2. Applying the Custom Modern Theme

1. In Power BI Desktop, navigate to the **View** ribbon tab.
2. Click the drop-down menu in the **Themes** section and select **Browse for themes...**.
3. Choose `power_bi_theme.json` located in `c:\Users\TARUN\Data Analytics\Mumbai HRP\`.
4. The dashboard canvas background will switch to `#0F172A` (Dark Slate) with rounded card borders and vibrant cyber-emerald accent colors.

---

## 3. Adding DAX Measures

1. In the **Data** pane on the right, right-click on `fact_mumbai_housing` and select **New Measure**.
2. Copy and paste the DAX definitions from `power_bi_dax_measures.dax`:
   - `Total Properties = COUNTROWS(fact_mumbai_housing)`
   - `Total Portfolio Valuation (Cr) = SUM(fact_mumbai_housing[price_in_crores])`
   - `Avg Price (Lakhs) = AVERAGE(fact_mumbai_housing[price_in_lakhs])`
   - `Avg Price per SqFt = AVERAGE(fact_mumbai_housing[price_per_sqft])`
   - `Avg Expected ROI % = AVERAGE(fact_mumbai_housing[expected_roi(%)])`
   - `Avg Market Volatility = AVERAGE(fact_mumbai_housing[market_volatility_score])`
   - `Avg Property Liquidity = AVERAGE(fact_mumbai_housing[property_liquidity_index])`
   - `High ROI Property Share % = DIVIDE(CALCULATE(COUNTROWS(fact_mumbai_housing), fact_mumbai_housing[roi_tier] = "High ROI (> 7%)"), COUNTROWS(fact_mumbai_housing), 0)`

---

## 4. Report Page Layout & Wireframe Architecture

### **Page 1: Executive Market Overview**

```
+-----------------------------------------------------------------------------------------+
| [Header Banner: MUMBAI REAL ESTATE ANALYTICS DASHBOARD | Total Units: 76,038]            |
+---------------------+---------------------+---------------------+-----------------------+
| KPI Card 1          | KPI Card 2          | KPI Card 3          | KPI Card 4            |
| Total Listings      | Total Valuation     | Avg Price / SqFt    | Avg Expected ROI %    |
| 76,038              | ₹1,28,061.5 Cr      | ₹15,118.8 / sqft    | 9.61%                 |
+---------------------+---------------------+---------------------+-----------------------+
| [Horizontal Bar Chart]                    | [Donut Chart]                               |
| Top 10 Regions by Property Count          | Property Type Share (Apartment, Studio, Villa)|
| (Thane West, Mira Road, Dombivali, etc.)  |                                             |
+-------------------------------------------+---------------------------------------------+
| [Clustered Column Chart]                  | [Interactive Slicers]                       |
| Price Segment Breakdown                   | Region Filter | BHK Filter | Status Filter  |
+-------------------------------------------+---------------------------------------------+
```

- **Top KPI Cards**: 4 Card visuals showing `Total Properties`, `Total Portfolio Valuation (Cr)`, `Avg Price per SqFt`, and `Avg Expected ROI %`.
- **Region Volume Visual**: Horizontal Bar Chart (`region` on Y-axis, `Total Properties` on X-axis, sorted descending).
- **Property Type Share**: Donut Chart (`type` on Legend, `Total Properties` on Values).
- **Price Segment Visual**: Clustered Column Chart (`price_segment` on X-axis, `Total Properties` on Y-axis).
- **Slicers**: Vertical list slicers for `region`, `bhk_category`, `status`, and `roi_tier`.

---

### **Page 2: Price & Micro-Market Deep Dive**

```
+-----------------------------------------------------------------------------------------+
| [Header Banner: MICRO-MARKET & PRICE ANALYTICS]                                         |
+----------------------------------------------------+------------------------------------+
| [Horizontal Bar Chart]                             | [Grouped Bar Chart]                |
| Top 15 Premium Localities (Avg Price / SqFt)       | BHK Category vs Price / SqFt       |
| (South Mumbai, Worli, Bandra, Juhu, etc.)          | (1 BHK, 2 BHK, 3 BHK, 4+ BHK)      |
+----------------------------------------------------+------------------------------------+
| [Matrix Visual]                                                                         |
| Locality Summary Table                                                                  |
| Columns: Locality | Region | Property Count | Avg Price (L) | Avg Price/SqFt | Avg ROI %  |
+-----------------------------------------------------------------------------------------+
```

- **Top 15 Localities Visual**: Horizontal Bar Chart (`locality` on Y-axis, `Avg Price per SqFt` on X-axis, Top N filter = 15).
- **BHK Price Matrix**: Grouped Bar Chart (`bhk_category` on X-axis, `Avg Price (Lakhs)` and `Avg Price per SqFt` on Y-axis).
- **Locality Matrix Visual**: Table/Matrix visual displaying detailed locality performance metrics with conditional formatting color scales on `Avg Price per SqFt` and `Avg Expected ROI %`.

---

### **Page 3: Investment & Risk Analytics**

```
+-----------------------------------------------------------------------------------------+
| [Header Banner: INVESTMENT RETURN & MARKET RISK MATRIX]                                |
+----------------------------------------------------+------------------------------------+
| [Scatter Plot Visual]                              | [Bubble Chart Visual]              |
| Expected ROI % (Y) vs Market Volatility (X)        | Demand Indicator vs Liquidity Index|
| (Golden Quadrant: High ROI, Low Volatility)        | Size: Property Count               |
+----------------------------------------------------+------------------------------------+
| [Card Grid]                                        | [Table Visual]                     |
| Risk Metrics: Avg Volatility (5.51/10)             | Top 10 High Yield Investment Zones |
| Liquidity Index: (9.30/10)                         | High ROI (> 7%) & Low Risk (< 5.5) |
+----------------------------------------------------+------------------------------------+
```

- **Risk vs Return Scatter Plot**: Scatter visual (`market_volatility_score` on X-axis, `expected_roi(%)` on Y-axis, `locality` on Details/Legend). Add reference lines at ROI = 7.0% and Volatility = 5.5.
- **Demand vs Liquidity Bubble Chart**: Scatter/Bubble visual (`demand_indicator` on X-axis, `property_liquidity_index` on Y-axis, `region` on Details, `Total Properties` on Size).
- **High Potential Investment Table**: Filtered table displaying localities where `Avg Expected ROI % >= 7.0` and `Avg Volatility <= 5.5`.

---

## 5. Summary Table of Key Project Files

| File Name | Purpose | Location |
| :--- | :--- | :--- |
| `mumbai_house_data.csv` | Raw input dataset | `c:\Users\TARUN\Data Analytics\Mumbai HRP\` |
| `data_pipeline.py` | Python ETL data cleaning & database script | `c:\Users\TARUN\Data Analytics\Mumbai HRP\` |
| `exploratory_analysis.py` | Python EDA & statistical metrics script | `c:\Users\TARUN\Data Analytics\Mumbai HRP\` |
| `mumbai_house_data_cleaned.csv` | Cleaned & normalized CSV for Power BI | `c:\Users\TARUN\Data Analytics\Mumbai HRP\` |
| `mumbai_housing.db` | SQLite database (tables, schema, views) | `c:\Users\TARUN\Data Analytics\Mumbai HRP\` |
| `power_bi_theme.json` | Custom dark slate & emerald theme for Power BI | `c:\Users\TARUN\Data Analytics\Mumbai HRP\` |
| `power_bi_dax_measures.dax` | Ready-to-use DAX measure formulas | `c:\Users\TARUN\Data Analytics\Mumbai HRP\` |
| `market_insights_summary.json` | Summary JSON of key market metrics | `c:\Users\TARUN\Data Analytics\Mumbai HRP\` |
