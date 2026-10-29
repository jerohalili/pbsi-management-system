-- Timetable: let the database enforce the same rules the API already checks.
-- The API refuses double-bookings with a friendly message either way; these constraints are the
-- safety net for two people saving at the very same moment. Safe to run more than once.
--
-- Step 1: look for existing rows that would break a rule. Every query must return NO rows
-- before you run step 2 (fix or delete the rows it shows first).

-- 1a. Bad times or days.
SELECT id, day_of_week, period_number, start_time, end_time
FROM timetable
WHERE end_time <= start_time OR day_of_week NOT BETWEEN 1 AND 5 OR period_number < 1;

-- 1b. The same teacher twice in one period.
SELECT day_of_week, period_number, teacher_id, COUNT(*) AS copies
FROM timetable GROUP BY 1, 2, 3 HAVING COUNT(*) > 1;

-- 1c. The same room twice in one period (ignores upper/lower case and extra spaces).
SELECT day_of_week, period_number, lower(btrim(room)) AS room, COUNT(*) AS copies
FROM timetable GROUP BY 1, 2, 3 HAVING COUNT(*) > 1;

-- 1d. The same course twice in one period.
SELECT day_of_week, period_number, course_id, COUNT(*) AS copies
FROM timetable GROUP BY 1, 2, 3 HAVING COUNT(*) > 1;

-- Step 2: only if step 1 returned nothing.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'timetable_times_check') THEN
    ALTER TABLE timetable ADD CONSTRAINT timetable_times_check CHECK (end_time > start_time);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'timetable_day_check') THEN
    ALTER TABLE timetable ADD CONSTRAINT timetable_day_check CHECK (day_of_week BETWEEN 1 AND 5);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'timetable_period_check') THEN
    ALTER TABLE timetable ADD CONSTRAINT timetable_period_check CHECK (period_number >= 1);
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS timetable_teacher_slot_key
  ON timetable (day_of_week, period_number, teacher_id);
CREATE UNIQUE INDEX IF NOT EXISTS timetable_room_slot_key
  ON timetable (day_of_week, period_number, lower(btrim(room)));
CREATE UNIQUE INDEX IF NOT EXISTS timetable_course_slot_key
  ON timetable (day_of_week, period_number, course_id);
