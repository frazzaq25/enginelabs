const mongoose = require('mongoose');

const AuditLog = require('../models/auditLog');
const { redactPayload } = require('../utils/redact');

const READ_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

function resolveOperation(method) {
  return READ_METHODS.has(method.toUpperCase()) ? 'READ' : 'WRITE';
}

function auditLogger(req, res, next) {
  const startedAt = Date.now();

  res.on('finish', async () => {
    if (mongoose.connection.readyState !== 1) {
      return;
    }

    const auditEntry = {
      userId: req.user?.id || 'anonymous',
      userEmail: req.user?.email || null,
      method: req.method,
      route: req.originalUrl,
      operation: resolveOperation(req.method),
      statusCode: res.statusCode,
      durationMs: Date.now() - startedAt,
      details: {
        requestBody: redactPayload(req.body || {}),
        query: redactPayload(req.query || {}),
        params: redactPayload(req.params || {})
      }
    };

    try {
      await AuditLog.create(auditEntry);
    } catch (err) {
      console.error('Unable to persist audit log entry', err);
    }
  });

  next();
}

module.exports = auditLogger;
