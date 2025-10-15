import crypto from "crypto";

export interface EncryptionKeyMetadata {
  id: string;
  createdAt: Date;
  kmsArn?: string;
}

export interface EncryptionKeyProvider {
  getKey(): Promise<{ key: Buffer; metadata?: EncryptionKeyMetadata }>;
}

export class EnvironmentKeyProvider implements EncryptionKeyProvider {
  private readonly envVar: string;
  private readonly allowGeneratedFallback: boolean;
  private cachedKey?: Buffer;
  private cachedMetadata?: EncryptionKeyMetadata;

  constructor(envVar = "EHR_CRYPTO_MASTER_KEY", options?: { allowGeneratedFallback?: boolean }) {
    this.envVar = envVar;
    this.allowGeneratedFallback = options?.allowGeneratedFallback ?? true;
  }

  async getKey(): Promise<{ key: Buffer; metadata?: EncryptionKeyMetadata }> {
    if (this.cachedKey) {
      return { key: this.cachedKey, metadata: this.cachedMetadata };
    }

    const raw = process.env[this.envVar];
    if (!raw) {
      if (!this.allowGeneratedFallback) {
        throw new Error(`Missing encryption key in environment variable ${this.envVar}`);
      }

      const fallbackKey = crypto.randomBytes(32);
      this.cachedKey = fallbackKey;
      this.cachedMetadata = {
        id: `${this.envVar}-generated-${Date.now()}`,
        createdAt: new Date(),
      };
      return { key: fallbackKey, metadata: this.cachedMetadata };
    }

    const decoded = raw.length % 4 === 0 ? Buffer.from(raw, "base64") : Buffer.from(raw, "utf8");
    const key = decoded.length === 32 ? decoded : crypto.createHash("sha256").update(decoded).digest();
    this.cachedKey = key;
    this.cachedMetadata = {
      id: `${this.envVar}-env`,
      createdAt: new Date(),
    };
    return { key, metadata: this.cachedMetadata };
  }
}

export interface EncryptedFieldValue {
  /** version allows for future migrations */
  v: number;
  alg: "aes-256-gcm";
  iv: string;
  tag: string;
  ct: string;
  meta?: {
    keyId?: string;
    encoded?: "base64";
    dataType?: string;
  };
}

export const isEncryptedFieldValue = (value: unknown): value is EncryptedFieldValue => {
  if (!value || typeof value !== "object") {
    return false;
  }
  const candidate = value as EncryptedFieldValue;
  return (
    candidate.v === 1 &&
    candidate.alg === "aes-256-gcm" &&
    typeof candidate.iv === "string" &&
    typeof candidate.tag === "string" &&
    typeof candidate.ct === "string"
  );
};

export class FieldEncryptionEngine {
  private cachedKey?: Buffer;
  private cachedKeyId?: string;

  constructor(private readonly provider: EncryptionKeyProvider) {}

  private async getKey(): Promise<Buffer> {
    if (!this.cachedKey) {
      const { key, metadata } = await this.provider.getKey();
      if (key.length !== 32) {
        throw new Error("Encryption key must be 32 bytes for AES-256-GCM");
      }
      this.cachedKey = key;
      this.cachedKeyId = metadata?.id;
    }
    return this.cachedKey;
  }

  async encrypt(value: unknown, options?: { dataType?: string }): Promise<EncryptedFieldValue> {
    const key = await this.getKey();
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

    const payload = Buffer.from(JSON.stringify(value));
    const encrypted = Buffer.concat([cipher.update(payload), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return {
      v: 1,
      alg: "aes-256-gcm",
      iv: iv.toString("base64"),
      tag: authTag.toString("base64"),
      ct: encrypted.toString("base64"),
      meta: {
        encoded: "base64",
        keyId: this.cachedKeyId,
        dataType: options?.dataType,
      },
    };
  }

  async decrypt<T = unknown>(encrypted: EncryptedFieldValue): Promise<T> {
    if (!isEncryptedFieldValue(encrypted)) {
      throw new Error("Value is not an EncryptedFieldValue");
    }

    const key = await this.getKey();
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(encrypted.iv, "base64"));
    decipher.setAuthTag(Buffer.from(encrypted.tag, "base64"));

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encrypted.ct, "base64")),
      decipher.final(),
    ]);
    const json = decrypted.toString("utf8");
    return JSON.parse(json) as T;
  }
}

let defaultEngine: FieldEncryptionEngine | null = null;

export const getDefaultEncryptionEngine = (): FieldEncryptionEngine => {
  if (!defaultEngine) {
    defaultEngine = new FieldEncryptionEngine(new EnvironmentKeyProvider());
  }
  return defaultEngine;
};
