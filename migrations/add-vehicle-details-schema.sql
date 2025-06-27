-- Create vehicle_details schema
CREATE SCHEMA IF NOT EXISTS vehicle_details;

-- Create vehicle_brands table
CREATE TABLE IF NOT EXISTS vehicle_details.brands (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create vehicle_models table
CREATE TABLE IF NOT EXISTS vehicle_details.models (
  id SERIAL PRIMARY KEY,
  brand_id INTEGER NOT NULL REFERENCES vehicle_details.brands(id),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(brand_id, name)
);

-- Create years table (for quick lookup)
CREATE TABLE IF NOT EXISTS vehicle_details.years (
  year INTEGER PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert years from 1990 to current year
DO $$
DECLARE
  current_year INTEGER := EXTRACT(YEAR FROM CURRENT_DATE);
  year_to_insert INTEGER;
BEGIN
  FOR year_to_insert IN 1990..current_year LOOP
    INSERT INTO vehicle_details.years (year)
    VALUES (year_to_insert)
    ON CONFLICT (year) DO NOTHING;
  END LOOP;
END $$;
