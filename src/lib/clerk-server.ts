const MOCK_USER = {
  id: "mock-user-id",
  clerkId: "user_mocked",
  email: "mock@example.com",
  name: "Mock User",
  credits: 1250,
  image: "https://via.placeholder.com/150",
};

/**
 * Get the current authenticated user's database record
 * Returns null if not authenticated
 */
export async function getAuthUser() {
  return MOCK_USER;
}

/**
 * Require authentication - redirects to sign-in if not authenticated
 * Returns the user's database record
 */
export async function requireAuth() {
  return MOCK_USER;
}

/**
 * Require no authentication - redirects to dashboard if authenticated
 */
export async function requireNoAuth() {
  return null;
}

/**
 * Get Clerk user ID
 */
export async function getClerkUserId() {
  return "user_mocked";
}
