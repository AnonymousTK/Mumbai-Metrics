# 🏢 Mumbai Real Estate Data Analytics & Power BI Dashboard

An end-to-end data analytics project analyzing **76,038 property listings** across 228 micro-markets in Mumbai.

![Python](https://img.shields.io/badge/Python-3.10%2B-blue)
![SQLite](https://img.shields.io/badge/SQLite-3.0-green)
![Power BI](https://img.shields.io/badge/Microsoft%20Power%20BI-Desktop-yellow)
![HTML5](https://img.shields.io/badge/Frontend-HTML5%2FCSS3%2FJS-orange)

---

## 🌟 Key Highlights & Market Insights

- **Total Properties Analyzed**: `76,038` listings
- **Total Portfolio Valuation**: `₹1,28,061.52 Crores` (~$15.4 Billion USD)
- **Average Price / SqFt Benchmark**: `₹15,118.81 / sqft`
- **Average Expected Annual ROI**: `9.61%`
- **Average Market Volatility Index**: `5.51 / 10`
- **Average Property Liquidity Score**: `9.30 / 10`
- **Top Supply Hubs**: Thane West (14,868 listings), Mira Road East (9,902 listings), Dombivali (3,041 listings).

---

## 📁 Repository Structure

```
├── data_pipeline.py            # Python ETL script (data cleaning, normalization, SQLite DB creation)
├── exploratory_analysis.py     # Python EDA script generating market metric summaries
├── build_data_js.py            # Script generating pre-aggregated JSON datasets for UI
├── mumbai_house_data.csv       # Raw Kaggle CSV input dataset
├── mumbai_house_data_cleaned.csv# Cleaned analytical dataset
├── mumbai_housing.db           # SQLite database (fact table, dimension tables, SQL views)
├── power_bi_theme.json         # Custom dark slate & emerald theme for Power BI
├── power_bi_dax_measures.dax   # Production DAX measure definitions
├── POWER_BI_DASHBOARD_GUIDE.md # 3-Page Power BI layout architecture guide
├── index.html                  # Interactive HTML5 web dashboard
├── style.css                   # Glassmorphism dark mode CSS stylesheet
├── dashboard.js                # Dynamic filtering logic & Chart.js visualizations
├── data.js                     # Pre-aggregated JSON data for offline UI execution
└── README.md                   # Project documentation
```

---

## ⚙️ Quick Start Guide

### 1. Run Data ETL Pipeline
```bash
python data_pipeline.py
python exploratory_analysis.py
python build_data_js.py
```

### 2. View Web Dashboard
Double-click `index.html` or open via browser (`file:///.../index.html`).

### 3. Microsoft Power BI Integration
1. Open **Power BI Desktop** $\rightarrow$ **Get Data** $\rightarrow$ **Text/CSV** $\rightarrow$ Load `mumbai_house_data_cleaned.csv`.
2. Go to **View** tab $\rightarrow$ **Themes** $\rightarrow$ Import `power_bi_theme.json`.
3. Copy DAX measures from `power_bi_dax_measures.dax`.
