const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;

function getKey() {
  const secret = process.env.ENCRYPTION_KEY;

  if (!secret) {
    throw new Error('ENCRYPTION_KEY environment variable must be set.');
  }

  return crypto.createHash('sha256').update(secret).digest();
}

function encrypt(value) {
  if (value === null || value === undefined) {
    return value;
  }

  const normalized = typeof value === 'string' ? value : JSON.stringify(value);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);

  let encrypted = cipher.update(normalized, 'utf8', 'base64');
  encrypted += cipher.final('base64');

  const authTag = cipher.getAuthTag().toString('base64');
  return `${iv.toString('base64')}:${authTag}:${encrypted}`;
}

function decrypt(value) {
  if (value === null || value === undefined) {
    return value;
  }

  const parts = typeof value === 'string' ? value.split(':') : [];

  if (parts.length !== 3) {
    throw new Error('Invalid encrypted payload.');
  }

  const [ivPart, authTagPart, dataPart] = parts;
  const iv = Buffer.from(ivPart, 'base64');
  const authTag = Buffer.from(authTagPart, 'base64');

  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(dataPart, 'base64', 'utf8');
  decrypted += decipher.final('utf8');

  try {
    return JSON.parse(decrypted);
  } catch (err) {
    return decrypted;
  }
}

function encryptFields(data, fields) {
  return fields.reduce((acc, field) => {
    if (Object.prototype.hasOwnProperty.call(data, field) && data[field] !== undefined) {
      acc[field] = encrypt(data[field]);
    }
    return acc;
  }, {});
}

function decryptFields(data, fields) {
  if (!data) {
    return data;
  }

  const cloned = { ...data };

  fields.forEach((field) => {
    if (cloned[field] !== undefined && cloned[field] !== null) {
      cloned[field] = decrypt(cloned[field]);
    }
  });

  return cloned;
}

module.exports = {
  encrypt,
  decrypt,
  encryptFields,
  decryptFields
};
