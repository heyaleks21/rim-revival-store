-- Create admin_users table if it doesn't exist
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin_sessions table if it doesn't exist
CREATE TABLE IF NOT EXISTS admin_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT NOT NULL REFERENCES admin_users(username) ON DELETE CASCADE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on sessions for faster lookups
CREATE INDEX IF NOT EXISTS admin_sessions_username_idx ON admin_sessions(username);

-- Insert the admin user with the specified credentials
-- The password_hash is the bcrypt hash of "1EhuloGoeyBML8xI"
INSERT INTO admin_users (username, password_hash)
VALUES ('admin', '$2a$12$Ht5QsKYt0uQEYUmJnJnRxOUVtxZKGQZEYCQlRpE5n1Qm.ecXUJ7Oa')
ON CONFLICT (username) DO NOTHING;
