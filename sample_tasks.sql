-- First, get the user's profile ID
DO $$
DECLARE
    profile_id UUID;
BEGIN
    -- Get the profile ID for the email
    SELECT id INTO profile_id
    FROM profiles
    WHERE email = 'sajith@mailinator.com';

    -- Insert sample tasks
    INSERT INTO tasks (user_id, title, description, status, priority, size, category, expected_completion_date)
    VALUES
    (
        profile_id,
        'Complete Project Documentation',
        'Write comprehensive documentation for the current project including API endpoints and database schema',
        'not_started',
        'high',
        'L',
        'office',
        (CURRENT_DATE + INTERVAL '5 days')::timestamptz
    ),
    (
        profile_id,
        'Weekly Team Meeting',
        'Prepare agenda and review progress with the development team',
        'not_started',
        'medium',
        'M',
        'office',
        (CURRENT_DATE + INTERVAL '2 days')::timestamptz
    ),
    (
        profile_id,
        'Gym Session',
        'Complete cardio and strength training workout',
        'not_started',
        'medium',
        'S',
        'personal',
        (CURRENT_DATE + INTERVAL '1 day')::timestamptz
    ),
    (
        profile_id,
        'Learn React Native',
        'Complete the introductory course on React Native development',
        'in_progress',
        'high',
        'XL',
        'career',
        (CURRENT_DATE + INTERVAL '14 days')::timestamptz
    ),
    (
        profile_id,
        'Family Dinner Planning',
        'Plan and organize weekend family dinner, including menu and shopping list',
        'not_started',
        'low',
        'M',
        'family',
        (CURRENT_DATE + INTERVAL '3 days')::timestamptz
    ),
    (
        profile_id,
        'Code Review',
        'Review pull requests and provide feedback to team members',
        'in_progress',
        'high',
        'M',
        'office',
        (CURRENT_DATE)::timestamptz
    ),
    (
        profile_id,
        'Update Portfolio Website',
        'Add recent projects and update skills section',
        'not_started',
        'medium',
        'L',
        'career',
        (CURRENT_DATE + INTERVAL '7 days')::timestamptz
    ),
    (
        profile_id,
        'Quick Email Check',
        'Review and respond to important emails',
        'completed',
        'medium',
        'XS',
        'office',
        (CURRENT_DATE - INTERVAL '1 day')::timestamptz
    ),
    (
        profile_id,
        'Monthly Budget Review',
        'Review and adjust monthly budget, track expenses',
        'not_started',
        'high',
        'M',
        'personal',
        (CURRENT_DATE + INTERVAL '5 days')::timestamptz
    ),
    (
        profile_id,
        'Weekend Trip Planning',
        'Plan upcoming weekend trip including accommodation and activities',
        'in_progress',
        'low',
        'L',
        'family',
        (CURRENT_DATE + INTERVAL '10 days')::timestamptz
    );

    -- Add some task history
    INSERT INTO task_history (task_id, action, changed_by, previous_status, new_status)
    SELECT 
        id,
        'created',
        user_id,
        NULL,
        status
    FROM tasks
    WHERE user_id = profile_id;

    -- Add completed_at for completed tasks
    UPDATE tasks
    SET completed_at = CURRENT_TIMESTAMP
    WHERE status = 'completed' AND user_id = profile_id;

    -- Add started_at for in_progress tasks
    UPDATE tasks
    SET started_at = CURRENT_TIMESTAMP - INTERVAL '2 days'
    WHERE status = 'in_progress' AND user_id = profile_id;

END $$; 