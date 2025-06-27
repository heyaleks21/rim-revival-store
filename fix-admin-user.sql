-- Check if the admin user exists
SELECT * FROM admin_users WHERE username = 'admin';

-- If the admin user exists, update the password hash
-- This is the bcrypt hash for '1EhuloGoeyBML8xI'
UPDATE admin_users 
SET password_hash = '$2a$12$Ht5QsKYt0uQEYUmJnJnRxOUVtxZKGQZEYCQlRpE5n1Qm.ecXUJ7Oa' 
WHERE username = 'admin';

-- If no rows were updated, insert a new admin user
INSERT INTO admin_users (username, password_hash)
SELECT 'admin', '$2a$12$Ht5QsKYt0uQEYUmJnJnRxOUVtxZKGQZEYCQlRpE5n1Qm.ecXUJ7Oa'
WHERE NOT EXISTS (SELECT 1 FROM admin_users WHERE username = 'admin');
