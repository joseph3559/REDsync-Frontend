"use client";

const TOKEN_KEY = "redsync_jwt";

export function storeToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
  return typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function clearTokenCookie() {
  if (typeof document !== 'undefined') {
    // Clear the main auth cookie that middleware checks
    document.cookie = `${TOKEN_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
    document.cookie = `${TOKEN_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  }
}

export function clearAllAuth() {
  // Clear localStorage
  clearToken();
  
  // Clear cookies
  clearTokenCookie();
  
  // Clear any additional auth-related localStorage items
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
  }
}

export function setTokenCookie(token: string, days = 7) {
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${TOKEN_KEY}=${encodeURIComponent(token)}; Max-Age=${maxAge}; Path=/; SameSite=Lax`;
}

// Function to decode JWT token and get user info
export function getUserFromToken(): { email: string; id: string } | null {
  const token = getToken();
  if (!token) return null;
  
  try {
    // Decode JWT token (simple base64 decode of payload)
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return {
      email: decoded.email || 'user@redlecithin.com',
      id: decoded.userId || decoded.id || '1'
    };
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
}


