-- V9: Location metadata
--
-- Adds:
--   * accuracy_meters
--   * captured_at
--   * source_type
-- ---------------------------------------------------------------------------

CREATE TYPE location_source AS ENUM ('GPS_CAPTURED', 'MANUAL_CORRECTED', 'IMPORTED_ADMIN');

ALTER TABLE location ADD COLUMN accuracy_meters NUMERIC(10,2);
ALTER TABLE location ADD COLUMN captured_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE location ADD COLUMN source_type location_source;
