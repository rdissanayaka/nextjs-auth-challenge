import crypto from "crypto";

interface SessionData {
  username: string;
  secureWord: string;
  issuedAt: number;
  lastRequest?: number;
  totpSecret?: string; // Store the base32 secret separately
}

// Global store to persist across module reloads in development
declare global {
  var __sessionStore: Map<string, SessionData> | undefined;
}

class SessionStore {
  private store: Map<string, SessionData>;
  private readonly SECURE_WORD_EXPIRY = 60 * 1000; // 60 seconds
  private readonly RATE_LIMIT_WINDOW = 10 * 1000; // 10 seconds

  constructor() {
    if (process.env.NODE_ENV === "development") {
      if (!global.__sessionStore) {
        global.__sessionStore = new Map<string, SessionData>();
      }
      this.store = global.__sessionStore;
    } else {
      this.store = new Map<string, SessionData>();
    }
  }

  // Base32 encoding for TOTP secrets
  private base32Encode(buffer: Buffer): string {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    let bits = 0;
    let value = 0;
    let output = "";

    for (let i = 0; i < buffer.length; i++) {
      value = (value << 8) | buffer[i];
      bits += 8;

      while (bits >= 5) {
        output += alphabet[(value >>> (bits - 5)) & 31];
        bits -= 5;
      }
    }

    if (bits > 0) {
      output += alphabet[(value << (5 - bits)) & 31];
    }

    return output;
  }

  // Base32 decoding for TOTP secrets
  private base32Decode(encoded: string): Buffer {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    const cleanInput = encoded.toUpperCase().replace(/=+$/, "");
    let bits = 0;
    let value = 0;
    const output: number[] = [];

    for (let i = 0; i < cleanInput.length; i++) {
      const char = cleanInput[i];
      const index = alphabet.indexOf(char);

      if (index === -1) {
        throw new Error(`Invalid base32 character: ${char}`);
      }

      value = (value << 5) | index;
      bits += 5;

      if (bits >= 8) {
        output.push((value >>> (bits - 8)) & 255);
        bits -= 8;
      }
    }

    return Buffer.from(output);
  }

  generateSecureWord(username: string): string {
    const timestamp = Date.now().toString();
    const secret = process.env.SECRET_KEY || "default-secret-key";

    const hash = crypto
      .createHmac("sha256", secret)
      .update(username + timestamp)
      .digest("hex");

    return hash.substring(0, 8).toUpperCase();
  }

  // Generate a proper base32 TOTP secret
  generateTotpSecret(username: string): string {
    const secret = process.env.SECRET_KEY || "default-secret-key";
    const hash = crypto
      .createHmac("sha256", secret)
      .update(username + Date.now().toString())
      .digest();

    // Take first 20 bytes for a 160-bit secret (standard for TOTP)
    const secretBuffer = hash.slice(0, 20);
    return this.base32Encode(secretBuffer);
  }

  canRequestSecureWord(username: string): boolean {
    const existing = this.store.get(username);
    if (!existing) return true;

    const now = Date.now();
    const timeSinceLastRequest = now - (existing.lastRequest || 0);

    console.log(
      `Rate limit check for ${username}: ${timeSinceLastRequest}ms since last request`
    );
    return timeSinceLastRequest >= this.RATE_LIMIT_WINDOW;
  }

  createSession(username: string): {
    secureWord: string;
    expiresAt: number;
    totpSecret: string;
  } {
    const now = Date.now();
    const secureWord = this.generateSecureWord(username);
    const totpSecret = this.generateTotpSecret(username);
    const expiresAt = now + this.SECURE_WORD_EXPIRY;

    console.log(`Creating session for ${username}:`, {
      secureWord,
      totpSecret,
      expiresAt,
    });

    this.store.set(username, {
      username,
      secureWord,
      issuedAt: now,
      lastRequest: now,
      totpSecret,
    });

    console.log(`Session created. Store size: ${this.store.size}`);
    return { secureWord, expiresAt, totpSecret };
  }

  validateSession(username: string, secureWord: string): boolean {
    console.log(
      `Validating session for ${username} with secureWord: ${secureWord}`
    );
    console.log(`Store size: ${this.store.size}`);

    const session = this.store.get(username);
    console.log(`Retrieved session:`, session);

    if (!session) {
      console.log(`No session found for ${username}`);
      return false;
    }

    const now = Date.now();
    const isExpired = now - session.issuedAt > this.SECURE_WORD_EXPIRY;

    if (isExpired) {
      console.log(`Session expired for ${username}`);
      this.store.delete(username);
      return false;
    }

    const isValid = session.secureWord === secureWord;
    console.log(`Session validation result: ${isValid}`);
    return isValid;
  }

  // Fixed TOTP implementation
  generateMfaCode(base32Secret: string, timeStep: number = 30): string {
    try {
      // Decode the base32 secret
      const key = this.base32Decode(base32Secret);

      // Calculate time counter
      const currentTime = Math.floor(Date.now() / 1000);
      const counter = Math.floor(currentTime / timeStep);

      // Create 8-byte buffer for counter (big-endian)
      const buffer = Buffer.alloc(8);
      // Write as big-endian 64-bit integer
      buffer.writeUInt32BE(Math.floor(counter / 0x100000000), 0);
      buffer.writeUInt32BE(counter & 0xffffffff, 4);

      // Generate HMAC-SHA1
      const hmac = crypto.createHmac("sha1", key).update(buffer).digest();

      // Dynamic truncation
      const offset = hmac[hmac.length - 1] & 0x0f;
      const code =
        (((hmac[offset] & 0x7f) << 24) |
          ((hmac[offset + 1] & 0xff) << 16) |
          ((hmac[offset + 2] & 0xff) << 8) |
          (hmac[offset + 3] & 0xff)) %
        1000000;

      // Convert to 6-digit string with leading zeros
      return code.toString().padStart(6, "0");
    } catch (error) {
      console.error("Error generating TOTP code:", error);
      return "000000";
    }
  }

  validateTotpCode(username: string, inputCode: string | number): boolean {
    const session = this.store.get(username);
    if (!session || !session.totpSecret) {
      console.log(`No session or TOTP secret found for ${username}`);
      return false;
    }

    const input = String(inputCode).padStart(6, "0");

    // Check current time window and adjacent windows for clock drift tolerance
    const timeWindows = [-1, 0, 1]; // Allow 1 time step before/after for clock drift

    for (const window of timeWindows) {
      const timeStep = 30;
      const currentTime = Math.floor(Date.now() / 1000);
      const adjustedCounter = Math.floor(currentTime / timeStep) + window;

      // Generate code for this time window
      const testSecret = session.totpSecret;
      const buffer = Buffer.alloc(8);
      buffer.writeUInt32BE(Math.floor(adjustedCounter / 0x100000000), 0);
      buffer.writeUInt32BE(adjustedCounter & 0xffffffff, 4);

      const key = this.base32Decode(testSecret);
      const hmac = crypto.createHmac("sha1", key).update(buffer).digest();

      const offset = hmac[hmac.length - 1] & 0x0f;
      const code =
        (((hmac[offset] & 0x7f) << 24) |
          ((hmac[offset + 1] & 0xff) << 16) |
          ((hmac[offset + 2] & 0xff) << 8) |
          (hmac[offset + 3] & 0xff)) %
        1000000;

      const expectedCode = code.toString().padStart(6, "0");

      console.log(
        `TOTP Check (window ${window}): input=${input}, expected=${expectedCode}, match=${
          input === expectedCode
        }`
      );

      if (input === expectedCode) {
        return true;
      }
    }

    return false;
  }

  cleanExpiredSessions(): void {
    const now = Date.now();
    for (const [username, session] of this.store) {
      if (now - session.issuedAt > this.SECURE_WORD_EXPIRY) {
        this.store.delete(username);
      }
    }
  }
  getCode(username: string): string | undefined {
    return this.getCurrentTotpCode(username);
  }
  getCurrentTotpCode(username: string): string | undefined {
    const session = this.store.get(username);
    if (!session?.totpSecret) return undefined;

    return this.generateMfaCode(session.totpSecret);
  }
}

export const sessionStore = new SessionStore();

// Clean expired sessions every 60 seconds
setInterval(() => {
  sessionStore.cleanExpiredSessions();
}, 60000);
