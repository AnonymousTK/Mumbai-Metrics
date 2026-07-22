<div align="center">

# 🏙️ Mumbai Metrics

### **Data-Driven House Price Intelligence & Predictive Analytics**

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![Jupyter](https://img.shields.io/badge/Jupyter-Notebook-F37626?style=for-the-badge&logo=jupyter&logoColor=white)](https://jupyter.org)
[![SQLite](https://img.shields.io/badge/SQLite-Database-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![Power BI](https://img.shields.io/badge/Power_BI-Analytics-F2C811?style=for-the-badge&logo=powerbi&logoColor=black)](https://powerbi.microsoft.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

<br />

---

</div>

## 📌 Executive Summary

**Mumbai Metrics** is an end-to-end data analytics and predictive intelligence framework designed to analyze and forecast residential property prices across key micro-markets in Mumbai. 

By unifying data wrangling in Python, exploratory modeling in Jupyter, structured SQL storage, and dynamic storytelling in Power BI, this project turns raw real estate listings into actionable neighborhood-level valuation insights.

---

## ⚡ Key Highlights

- 🧹 **Robust Data Cleaning Pipeline:** Automated handling of missing values, outlier detection, and unit conversions using Pandas.
- 🔍 **Granular Market Segmentation:** Location-based feature engineering capturing price per sq. ft., locality tiers, and amenity densities.
- 💾 **Relational Storage:** Clean datasets schema-mapped and indexed in an SQLite database for seamless querying.
- 📊 **Dynamic Power BI Dashboard:** Built with custom DAX measures for real-time scenario modeling, YoY growth tracking, and spatial breakdown.

---

## 🛠️ Tech Stack & Architecture

| Layer | Tool / Technology | Purpose |
| :--- | :--- | :--- |
| **Data Processing** | `Python 3.x` (Pandas, NumPy) | Wrangling, outlier removal, and data normalization |
| **Exploratory Data Analysis** | `Jupyter Notebook` | Statistical distribution, correlation analysis, and feature engineering |
| **Storage & Querying** | `SQLite` | Structured tabular storage and SQL query layer |
| **Business Intelligence** | `Microsoft Power BI` | Interactive visualization & dashboard reporting |
| **Analytics Engine** | `DAX (Data Analysis Expressions)` | Dynamic measure creation, calculated columns, and time intelligence |

---

## 🔄 End-to-End Workflow

```mermaid
flowchart LR
    A[Raw Kaggle Dataset] --> B[Python Data Wrangling]
    B --> C[Jupyter Exploratory Analysis]
    C --> D[(SQLite Database)]
    D --> E[Power BI Data Model]
    E --> F[DAX Analytics Engine]
    F --> G[Interactive Dashboard]
