type CookieOptions = {
  days?: number; // Expiration in days
  path?: string; // Default "/"
  secure?: boolean; // HTTPS only
  sameSite?: "Strict" | "Lax" | "None";
};

export const cookieStore = {
  set: (name: string, value: string, options: CookieOptions = {}) => {
    let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

    // Expiration
    if (options.days) {
      const date = new Date();
      date.setTime(date.getTime() + options.days * 24 * 60 * 60 * 1000);
      cookie += `; expires=${date.toUTCString()}`;
    }

    // Path
    cookie += `; path=${options.path || "/"}`;

    // Secure
    if (options.secure) {
      cookie += "; secure";
    }

    // SameSite
    if (options.sameSite) {
      cookie += `; samesite=${options.sameSite}`;
    }

    document.cookie = cookie;
  },

  get: (name: string): string | null => {
    const nameEQ = encodeURIComponent(name) + "=";
    const cookies = document.cookie.split(";");

    for (let c of cookies) {
      c = c.trim();
      if (c.startsWith(nameEQ)) {
        return decodeURIComponent(c.substring(nameEQ.length));
      }
    }

    return null;
  },

  remove: (name: string) => {
    document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  },
};
