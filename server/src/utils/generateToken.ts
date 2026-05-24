import jwt from 'jsonwebtoken';

/**
 * Generates a signed JSON Web Token (JWT) containing the user ID and role context.
 */
export const generateToken = (userId: string, role: string): string => {
  const secret = process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET || 'dev_jwt_secret_flowsprint_token';

  return jwt.sign(
    { id: userId, role },
    secret,
    {
      expiresIn: '7d', // Secure default 7 days expiration
    }
  );
};
