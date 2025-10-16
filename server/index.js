const express = require("express");
const path = require("path");
const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();
const { nanoid } = require("nanoid");

const PORT = process.env.PORT || 3000;
const DATA_DIRECTORY = path.join(__dirname, "..", "data");
const DATABASE_PATH = path.join(DATA_DIRECTORY, "patients.db");

if (!fs.existsSync(DATA_DIRECTORY)) {
  fs.mkdirSync(DATA_DIRECTORY, { recursive: true });
}

const db = new sqlite3.Database(DATABASE_PATH, (err) => {
  if (err) {
    console.error("Failed to connect to the patient database", err);
    process.exit(1);
  }
});

db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS patients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      dob TEXT NOT NULL,
      insurance TEXT NOT NULL,
      patient_id TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`
  );
});

function runAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function callback(err) {
      if (err) {
        reject(err);
        return;
      }
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function getAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row);
    });
  });
}

function allAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  });
}

function isValidDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [yearStr, monthStr, dayStr] = value.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);

  if (!year || !month || !day) {
    return false;
  }

  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() + 1 !== month ||
    date.getUTCDate() !== day
  ) {
    return false;
  }

  const now = new Date();
  const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  return date <= todayUTC;
}

function normalizePatient(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    dob: row.dob,
    insurance: row.insurance,
    patientId: row.patient_id,
  };
}

function generatePatientId() {
  return `PT-${nanoid(8).toUpperCase()}`;
}

const app = express();

app.use(express.json());

app.get("/api/patients", async (req, res, next) => {
  try {
    const rows = await allAsync(
      "SELECT id, name, dob, insurance, patient_id FROM patients ORDER BY datetime(created_at) DESC"
    );
    const patients = rows.map(normalizePatient);
    res.json(patients);
  } catch (error) {
    next(error);
  }
});

app.post("/api/patients", async (req, res, next) => {
  try {
    const { name, dob, insurance, patientId } = req.body || {};
    const errors = {};

    if (typeof name !== "string" || !name.trim()) {
      errors.name = "Patient name is required";
    }

    if (!isValidDate(dob)) {
      errors.dob = "Date of birth must be a valid date in YYYY-MM-DD format";
    }

    if (typeof insurance !== "string" || !insurance.trim()) {
      errors.insurance = "Insurance provider is required";
    }

    let normalizedPatientId = typeof patientId === "string" ? patientId.trim() : "";

    if (normalizedPatientId && !/^[A-Za-z0-9-_]+$/.test(normalizedPatientId)) {
      errors.patientId = "Patient ID may only include letters, numbers, dashes, or underscores";
    }

    if (Object.keys(errors).length > 0) {
      res.status(400).json({ message: "Validation failed", errors });
      return;
    }

    if (!normalizedPatientId) {
      normalizedPatientId = generatePatientId();
    }

    normalizedPatientId = normalizedPatientId.toUpperCase();

    const existing = await getAsync("SELECT id FROM patients WHERE patient_id = ?", [
      normalizedPatientId,
    ]);

    if (existing) {
      res.status(409).json({
        message: "A patient with that ID already exists",
        errors: { patientId: "Patient ID must be unique" },
      });
      return;
    }

    const newPatient = {
      id: nanoid(12),
      name: name.trim(),
      dob,
      insurance: insurance.trim(),
      patientId: normalizedPatientId,
    };

    await runAsync(
      "INSERT INTO patients (id, name, dob, insurance, patient_id) VALUES (?, ?, ?, ?, ?)",
      [newPatient.id, newPatient.name, newPatient.dob, newPatient.insurance, newPatient.patientId]
    );

    res.status(201).json(newPatient);
  } catch (error) {
    if (error && error.code === "SQLITE_CONSTRAINT") {
      res.status(409).json({
        message: "A patient with that identifier already exists",
        errors: { patientId: "Patient ID must be unique" },
      });
      return;
    }
    next(error);
  }
});

app.delete("/api/patients/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await runAsync("DELETE FROM patients WHERE id = ?", [id]);

    if (result.changes === 0) {
      res.status(404).json({ message: "Patient not found" });
      return;
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

app.use(express.static(path.join(__dirname, "public")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.use((err, req, res, next) => {
  console.error("Unexpected error handling request", err);
  res.status(500).json({ message: "An unexpected error occurred" });
});

const server = app.listen(PORT, () => {
  console.log(`Patient management server running on http://localhost:${PORT}`);
});

function shutdown() {
  server.close(() => {
    db.close();
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
