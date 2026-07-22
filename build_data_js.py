import os
import json
import sqlite3

def generate_data_js():
    base_dir = r"c:\Users\TARUN\Data Analytics\Mumbai HRP"
    db_path = os.path.join(base_dir, "mumbai_housing.db")
    summary_path = os.path.join(base_dir, "market_insights_summary.json")
    out_js_path = os.path.join(base_dir, "data.js")

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # 1. Fetch All Regions
    cursor.execute("""
        SELECT region, property_count, avg_price_lakhs, avg_price_per_sqft, 
               avg_area_sqft, avg_expected_roi, avg_volatility_score, avg_liquidity_index
        FROM v_region_summary 
        ORDER BY region ASC
    """)
    cols = [desc[0] for desc in cursor.description]
    all_regions = [dict(zip(cols, row)) for row in cursor.fetchall()]

    # 2. Fetch Detailed Breakdown by Locality, Region, BHK, Status, Type, Price Segment
    cursor.execute("""
        SELECT locality, region, bhk_category, status, type, price_segment,
               COUNT(*) as count,
               ROUND(SUM(price_in_crores), 4) as total_valuation_crores,
               ROUND(AVG(price_in_lakhs), 2) as avg_price_lakhs,
               ROUND(AVG(price_per_sqft), 2) as avg_price_per_sqft,
               ROUND(AVG(area), 2) as avg_area_sqft,
               ROUND(AVG("expected_roi(%)"), 2) as avg_roi,
               ROUND(AVG(market_volatility_score), 2) as avg_volatility,
               ROUND(AVG(property_liquidity_index), 2) as avg_liquidity
        FROM fact_mumbai_housing
        GROUP BY locality, region, bhk_category, status, type, price_segment
        ORDER BY count DESC
    """)
    detail_cols = [desc[0] for desc in cursor.description]
    breakdown_records = [dict(zip(detail_cols, row)) for row in cursor.fetchall()]

    # 3. High Potential Investment Zone (ROI > 7% and Volatility < 5.5)
    cursor.execute("""
        SELECT locality, region, COUNT(*) as count,
               ROUND(AVG(price_in_lakhs), 2) as avg_price_lakhs,
               ROUND(AVG(price_per_sqft), 2) as avg_price_per_sqft,
               ROUND(AVG("expected_roi(%)"), 2) as avg_roi,
               ROUND(AVG(market_volatility_score), 2) as avg_volatility
        FROM fact_mumbai_housing
        GROUP BY locality, region
        HAVING count >= 5 AND avg_roi >= 7.0 AND avg_volatility <= 5.5
        ORDER BY avg_roi DESC
        LIMIT 50
    """)
    investment_cols = [desc[0] for desc in cursor.description]
    investment_zones = [dict(zip(investment_cols, row)) for row in cursor.fetchall()]

    with open(summary_path, 'r', encoding='utf-8') as f:
        summary_data = json.load(f)

    summary_data['all_regions'] = all_regions
    summary_data['breakdown_records'] = breakdown_records
    summary_data['investment_zones'] = investment_zones

    js_str = f"window.MUMBAI_DATA = {json.dumps(summary_data, indent=2)};"
    with open(out_js_path, 'w', encoding='utf-8') as f:
        f.write(js_str)

    conn.close()
    print(f"Updated data.js generated successfully at {out_js_path}. Size: {len(js_str)} bytes.")

if __name__ == "__main__":
    generate_data_js()
