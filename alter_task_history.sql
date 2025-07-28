-- First, drop the existing changed_by column if it exists
ALTER TABLE task_history 
DROP COLUMN IF EXISTS changed_by;

-- Then add the new changed_by column with proper reference
ALTER TABLE task_history 
ADD COLUMN changed_by UUID REFERENCES profiles(id) ON DELETE SET NULL; 