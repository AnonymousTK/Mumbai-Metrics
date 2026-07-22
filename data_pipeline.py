import os
import sqlite3
import pandas as pd
import numpy as np

def run_pipeline():
    base_dir = r"c:\Users\TARUN\Data Analytics\Mumbai HRP"
    input_csv = os.path.join(base_dir, "mumbai_house_data.csv")
    output_csv = os.path.join(base_dir, "mumbai_house_data_cleaned.csv")
    db_path = os.path.join(base_dir, "mumbai_housing.db")

    print("1. Loading raw dataset...")
    df_raw = pd.read_csv(input_csv)
    print(f"Raw data loaded: {df_raw.shape[0]} rows, {df_raw.shape[1]} columns.")

    # Create copy for cleaning
    df = df_raw.copy()

    print("2. Cleaning text fields & fixing column typos...")
    # Strip whitespace from string columns
    str_cols = df.columns[df.dtypes == 'object']
    for col in str_cols:
        df[col] = df[col].astype(str).str.strip()

    # Rename typo column
    if 'market_volatitlity_score' in df.columns:
        df.rename(columns={'market_volatitlity_score': 'market_volatility_score'}, inplace=True)

    # Standardize age field
    df['age'] = df['age'].replace({'Unknown': 'Unspecified'})

    print("3. Performing price unit normalization & calculating metrics...")
    # Convert price to standardized lakhs, crores, INR
    df['price_in_lakhs'] = df.apply(
        lambda row: round(row['price'] * 100.0, 2) if str(row['price_unit']).upper() == 'CR' else round(float(row['price']), 2),
        axis=1
    )
    df['price_in_crores'] = round(df['price_in_lakhs'] / 100.0, 4)
    df['price_in_inr'] = round(df['price_in_lakhs'] * 100000.0, 2)
    df['price_per_sqft'] = round(df['price_in_inr'] / df['area'], 2)

    print("4. Creating analytical category features...")
    # BHK Category
    def categorize_bhk(bhk):
        if bhk == 1:
            return '1 BHK'
        elif bhk == 2:
            return '2 BHK'
        elif bhk == 3:
            return '3 BHK'
        else:
            return '4+ BHK'

    df['bhk_category'] = df['bhk'].apply(categorize_bhk)

    # Price Segment
    def categorize_price(lakhs):
        if lakhs < 50:
            return 'Budget (< 50L)'
        elif lakhs <= 150:
            return 'Mid-Segment (50L - 1.5Cr)'
        elif lakhs <= 300:
            return 'Premium (1.5Cr - 3Cr)'
        else:
            return 'Luxury (> 3Cr)'

    df['price_segment'] = df['price_in_lakhs'].apply(categorize_price)

    # Area Category
    def categorize_area(sqft):
        if sqft < 500:
            return 'Compact (< 500 sqft)'
        elif sqft <= 1000:
            return 'Standard (500-1000 sqft)'
        elif sqft <= 2000:
            return 'Spacious (1000-2000 sqft)'
        else:
            return 'Ultra Spacious (> 2000 sqft)'

    df['area_category'] = df['area'].apply(categorize_area)

    # Expected ROI Tier
    def categorize_roi(roi):
        if roi > 7.0:
            return 'High ROI (> 7%)'
        elif roi >= 4.0:
            return 'Moderate ROI (4-7%)'
        else:
            return 'Low ROI (< 4%)'

    df['roi_tier'] = df['expected_roi(%)'].apply(categorize_roi)

    # Liquidity Tier
    def categorize_liquidity(idx):
        if idx >= 9.0:
            return 'High Liquidity (>= 9.0)'
        elif idx >= 7.0:
            return 'Medium Liquidity (7.0-8.9)'
        else:
            return 'Low Liquidity (< 7.0)'

    df['liquidity_tier'] = df['property_liquidity_index'].apply(categorize_liquidity)

    print("5. Removing duplicates & invalid entries...")
    initial_count = len(df)
    df = df.drop_duplicates()
    df = df[(df['area'] > 0) & (df['price_in_lakhs'] > 0)]
    final_count = len(df)
    print(f"Deduplication complete. Retained {final_count} rows (removed {initial_count - final_count}).")

    print(f"6. Exporting cleaned CSV to {output_csv}...")
    df.to_csv(output_csv, index=False)

    print(f"7. Populating SQLite database at {db_path}...")
    conn = sqlite3.connect(db_path)
    
    # Save raw data & fact table using pandas
    df_raw.to_sql("raw_mumbai_housing", conn, if_exists="replace", index=False)
    df.to_sql("fact_mumbai_housing", conn, if_exists="replace", index=False)

    # Create dimension table: dim_locality
    dim_locality = df.groupby(['locality', 'region']).agg(
        total_properties=('area', 'count'),
        avg_price_lakhs=('price_in_lakhs', 'mean'),
        avg_price_per_sqft=('price_per_sqft', 'mean'),
        avg_expected_roi=('expected_roi(%)', 'mean'),
        avg_volatility_score=('market_volatility_score', 'mean'),
        avg_liquidity_index=('property_liquidity_index', 'mean')
    ).reset_index()
    dim_locality.to_sql("dim_locality", conn, if_exists="replace", index=False)

    # Create dimension table: dim_property_type
    dim_property_type = df[['type', 'bhk_category', 'status', 'age']].drop_duplicates().reset_index(drop=True)
    dim_property_type.to_sql("dim_property_type", conn, if_exists="replace", index=False)

    # Create SQL Analytical Views
    cursor = conn.cursor()
    cursor.executescript("""
    DROP VIEW IF EXISTS v_region_summary;
    CREATE VIEW v_region_summary AS
    SELECT 
        region,
        COUNT(*) AS property_count,
        ROUND(AVG(price_in_lakhs), 2) AS avg_price_lakhs,
        ROUND(AVG(price_per_sqft), 2) AS avg_price_per_sqft,
        ROUND(AVG(area), 2) AS avg_area_sqft,
        ROUND(AVG("expected_roi(%)"), 2) AS avg_expected_roi,
        ROUND(AVG(market_volatility_score), 2) AS avg_volatility_score,
        ROUND(AVG(property_liquidity_index), 2) AS avg_liquidity_index
    FROM fact_mumbai_housing
    GROUP BY region
    ORDER BY property_count DESC;

    DROP VIEW IF EXISTS v_locality_top_roi;
    CREATE VIEW v_locality_top_roi AS
    SELECT 
        locality,
        region,
        COUNT(*) AS property_count,
        ROUND(AVG(price_in_lakhs), 2) AS avg_price_lakhs,
        ROUND(AVG(price_per_sqft), 2) AS avg_price_per_sqft,
        ROUND(AVG("expected_roi(%)"), 2) AS avg_roi,
        ROUND(AVG(market_volatility_score), 2) AS avg_volatility
    FROM fact_mumbai_housing
    GROUP BY locality, region
    HAVING COUNT(*) >= 10
    ORDER BY avg_roi DESC;

    DROP VIEW IF EXISTS v_price_segment_analysis;
    CREATE VIEW v_price_segment_analysis AS
    SELECT 
        price_segment,
        COUNT(*) AS property_count,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM fact_mumbai_housing), 2) AS percentage_share,
        ROUND(AVG(price_per_sqft), 2) AS avg_price_per_sqft,
        ROUND(AVG("expected_roi(%)"), 2) AS avg_roi,
        ROUND(AVG(property_liquidity_index), 2) AS avg_liquidity
    FROM fact_mumbai_housing
    GROUP BY price_segment;

    DROP VIEW IF EXISTS v_risk_return_matrix;
    CREATE VIEW v_risk_return_matrix AS
    SELECT 
        region,
        status,
        bhk_category,
        COUNT(*) AS listing_count,
        ROUND(AVG("expected_roi(%)"), 2) AS avg_expected_roi,
        ROUND(AVG(market_volatility_score), 2) AS avg_volatility,
        ROUND(AVG(demand_indicator), 2) AS avg_demand_index,
        ROUND(AVG(property_liquidity_index), 2) AS avg_liquidity
    FROM fact_mumbai_housing
    GROUP BY region, status, bhk_category;
    """)

    conn.commit()
    conn.close()
    print("ETL Data Pipeline Completed Successfully!")

if __name__ == "__main__":
    run_pipeline()
