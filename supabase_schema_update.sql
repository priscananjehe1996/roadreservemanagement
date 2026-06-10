-- Run this in your Supabase SQL Editor to add the missing columns

-- Part B
ALTER TABLE applications ADD COLUMN IF NOT EXISTS natureofbillboardsignagetool TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS physicallocation TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS giscoordinates TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS landmarksmainlocationfeature TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS closesturbancoucilorvillage TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS roadorhighway TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS materialused TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS singledoublemultiface TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS moving_revolving_flashingsign TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS signeorinfrastructureaffixed TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS lengthdimensions TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS widthdimension TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS thicknessdimension TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS heightabovegroundlevel TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS colorsusedforletters TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS colorusedforfigures TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS advertontheferry TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS advertontheferrylandingsite TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS advertontheoverbridge TEXT;

-- Part D (Declaration)
ALTER TABLE applications ADD COLUMN IF NOT EXISTS declaration_agreed BOOLEAN;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS firstname TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS lastname TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS othername TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS applicant_role TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS daysdate TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS place TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS signature TEXT;

-- Refresh the schema cache so Supabase API picks up the new columns immediately
NOTIFY pgrst, 'reload schema';
