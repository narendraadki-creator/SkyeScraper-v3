-- Activate the organization for dev3@skye.com
UPDATE organizations 
SET status = 'active' 
WHERE contact_email = 'dev3@skye.com';

-- Also ensure the employee status is active
UPDATE employees 
SET status = 'active' 
WHERE email = 'dev3@skye.com';
