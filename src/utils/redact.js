const SENSITIVE_KEYS = new Set([
  'firstName',
  'lastName',
  'email',
  'phone',
  'dateOfBirth',
  'body',
  'content',
  'name'
]);

function redactValue(value) {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === 'object') {
    return redactPayload(value);
  }

  return '[REDACTED]';
}

function redactPayload(payload) {
  if (payload === null || payload === undefined) {
    return payload;
  }

  if (Array.isArray(payload)) {
    return payload.map((item) => redactPayload(item));
  }

  if (typeof payload !== 'object') {
    return payload;
  }

  const result = {};

  Object.entries(payload).forEach(([key, value]) => {
    if (SENSITIVE_KEYS.has(key)) {
      result[key] = redactValue(value);
    } else if (typeof value === 'object') {
      result[key] = redactPayload(value);
    } else {
      result[key] = value;
    }
  });

  return result;
}

module.exports = {
  redactPayload,
  SENSITIVE_KEYS
};
