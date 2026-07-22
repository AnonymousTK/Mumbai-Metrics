import os
import json
import sqlite3
import pandas as pd

def run_analysis():
    base_dir = r"c:\Users\TARUN\Data Analytics\Mumbai HRP"
    db_path = os.path.join(base_dir, "mumbai_housing.db")
    stats_json_path = os.path.join(base_dir, "market_insights_summary.json")

    conn = sqlite3.connect(db_path)

    # 1. Overall Key Metrics
    df_fact = pd.read_sql_query("SELECT * FROM fact_mumbai_housing", conn)
    
    total_properties = len(df_fact)
    total_valuation_crores = round(df_fact['price_in_crores'].sum(), 2)
    avg_price_lakhs = round(df_fact['price_in_lakhs'].mean(), 2)
    median_price_lakhs = round(df_fact['price_in_lakhs'].median(), 2)
    avg_price_per_sqft = round(df_fact['price_per_sqft'].mean(), 2)
    avg_roi = round(df_fact['expected_roi(%)'].mean(), 2)
    avg_volatility = round(df_fact['market_volatility_score'].mean(), 2)
    avg_liquidity = round(df_fact['property_liquidity_index'].mean(), 2)

    # 2. Region Metrics (Top 10 by count)
    df_region = pd.read_sql_query("SELECT * FROM v_region_summary LIMIT 10", conn)
    region_list = df_region.to_dict(orient="records")

    # 3. BHK Breakdown
    bhk_summary = df_fact.groupby('bhk_category').agg(
        count=('area', 'count'),
        avg_price_lakhs=('price_in_lakhs', 'mean'),
        avg_price_per_sqft=('price_per_sqft', 'mean'),
        avg_roi=('expected_roi(%)', 'mean')
    ).reset_index().to_dict(orient="records")

    # 4. Property Type Breakdown
    type_summary = df_fact.groupby('type').agg(
        count=('area', 'count'),
        avg_price_lakhs=('price_in_lakhs', 'mean'),
        avg_price_per_sqft=('price_per_sqft', 'mean')
    ).reset_index().to_dict(orient="records")

    # 5. Status Comparison (Ready to move vs Under Construction)
    status_summary = df_fact.groupby('status').agg(
        count=('area', 'count'),
        avg_price_lakhs=('price_in_lakhs', 'mean'),
        avg_price_per_sqft=('price_per_sqft', 'mean'),
        avg_roi=('expected_roi(%)', 'mean'),
        avg_liquidity=('property_liquidity_index', 'mean')
    ).reset_index().to_dict(orient="records")

    # 6. Price Segment Share
    price_seg_summary = pd.read_sql_query("SELECT * FROM v_price_segment_analysis", conn).to_dict(orient="records")

    # 7. Top 10 Localities by ROI (Min 10 listings)
    top_roi_localities = pd.read_sql_query("SELECT * FROM v_locality_top_roi LIMIT 10", conn).to_dict(orient="records")

    # 8. High Value Localities (Top 10 by Avg Price / SqFt with min 10 listings)
    high_val_localities = pd.read_sql_query("""
        SELECT locality, region, COUNT(*) as count, 
               ROUND(AVG(price_in_lakhs), 2) as avg_price_lakhs, 
               ROUND(AVG(price_per_sqft), 2) as avg_price_per_sqft
        FROM fact_mumbai_housing
        GROUP BY locality, region
        HAVING COUNT(*) >= 10
        ORDER BY avg_price_per_sqft DESC
        LIMIT 10
    """, conn).to_dict(orient="records")

    summary_data = {
        "kpis": {
            "total_properties": total_properties,
            "total_valuation_crores": total_valuation_crores,
            "avg_price_lakhs": avg_price_lakhs,
            "median_price_lakhs": median_price_lakhs,
            "avg_price_per_sqft": avg_price_per_sqft,
            "avg_expected_roi_pct": avg_roi,
            "avg_market_volatility": avg_volatility,
            "avg_property_liquidity": avg_liquidity
        },
        "region_summary": region_list,
        "bhk_summary": bhk_summary,
        "type_summary": type_summary,
        "status_summary": status_summary,
        "price_segment_summary": price_seg_summary,
        "top_roi_localities": top_roi_localities,
        "high_val_localities": high_val_localities
    }

    with open(stats_json_path, "w", encoding="utf-8") as f:
        json.dump(summary_data, f, indent=2)

    conn.close()
    print("Exploratory Data Analysis complete! Exported market_insights_summary.json.")

if __name__ == "__main__":
    run_analysis()
