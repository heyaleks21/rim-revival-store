-- First, delete any existing admin user
DELETE FROM admin_sessions WHERE username = 'admin';
DELETE FROM admin_users WHERE username = 'admin';

-- Then create a fresh admin user with a known hash
INSERT INTO admin_users (username, password_hash)
VALUES ('admin', '$2a$10$JcmAHe5eUZ0q6SoS9aNFVOFJCGGnmY3BIXrh4VFl1VBY4Q3NR7gAy');

-- This hash is for the password '1EhuloGoeyBML8xI'
-- Generated with a simpler bcrypt configuration that should be more compatible
