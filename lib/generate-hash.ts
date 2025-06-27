import bcryptjs from "bcryptjs"

// Function to generate a bcrypt hash
export async function generateHash(password: string): Promise<string> {
  const salt = await bcryptjs.genSalt(10)
  return bcryptjs.hash(password, salt)
}
