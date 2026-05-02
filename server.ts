import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs/promises";
import multer from "multer";
import { nanoid } from "nanoid";

const PORT = 3000;
const DATA_DIR = path.join(process.cwd(), "data");
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");
const DB_PATH = path.join(DATA_DIR, "db.json");

// Ensure directories exist
async function initDirs() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  try {
    await fs.access(DB_PATH);
  } catch {
    await fs.writeFile(DB_PATH, JSON.stringify({ users: [], records: [], reminders: [] }));
  }
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${nanoid()}${ext}`);
  },
});

const upload = multer({ storage });

async function startServer() {
  await initDirs();

  const app = express();
  app.use(express.json());

  // Helper to read/write DB
  const readDB = async () => JSON.parse(await fs.readFile(DB_PATH, "utf-8"));
  const writeDB = async (data: any) => await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));

  // --- API ROUTES ---

  // Auth: Signup
  app.post("/api/auth/signup", async (req, res) => {
    const { email, password, role } = req.body;
    const db = await readDB();
    if (db.users.find((u: any) => u.email === email)) {
      return res.status(400).json({ error: "User already exists" });
    }
    const newUser = { id: nanoid(), email, password, role, onboardingComplete: false };
    db.users.push(newUser);
    await writeDB(db);
    res.json(newUser);
  });

  // Auth: Login
  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const db = await readDB();
    const user = db.users.find((u: any) => u.email === email && u.password === password);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    res.json(user);
  });

  // User: Get Profile
  app.get("/api/users/:id", async (req, res) => {
    const db = await readDB();
    const user = db.users.find((u: any) => u.id === req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    // Strip password
    const { password, ...userSafe } = user;
    res.json(userSafe);
  });

  // User: Update Profile (Onboarding)
  app.post("/api/users/:id/onboarding", async (req, res) => {
    const db = await readDB();
    const index = db.users.findIndex((u: any) => u.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: "User not found" });
    
    db.users[index] = { 
      ...db.users[index], 
      ...req.body, 
      onboardingComplete: true,
      sharingEnabled: db.users[index].role === 'patient' ? true : undefined
    };
    await writeDB(db);
    res.json(db.users[index]);
  });

  // User: Toggle Sharing
  app.post("/api/users/:id/sharing", async (req, res) => {
    const db = await readDB();
    const index = db.users.findIndex((u: any) => u.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: "User not found" });
    
    db.users[index].sharingEnabled = req.body.enabled;
    await writeDB(db);
    res.json({ sharingEnabled: db.users[index].sharingEnabled });
  });

  // Records: Upload
  app.post("/api/records/upload", upload.single("file"), async (req, res) => {
    if (!(req as any).file) return res.status(400).json({ error: "No file uploaded" });
    
    const { patientId, type } = req.body;
    const db = await readDB();
    const file = (req as any).file;
    
    const newRecord = {
      id: nanoid(),
      patientId,
      type,
      fileName: file.filename,
      originalName: file.originalname,
      createdAt: new Date().toISOString(),
    };
    
    db.records.push(newRecord);
    await writeDB(db);
    res.json(newRecord);
  });

  // Records: Get for patient
  app.get("/api/records/patient/:id", async (req, res) => {
    const db = await readDB();
    const patient = db.users.find((u: any) => u.id === req.params.id);
    if (!patient) return res.status(404).json({ error: "Patient not found" });

    // Check visibility
    const requesterId = req.query.requesterId as string;
    const requester = db.users.find((u: any) => u.id === requesterId);

    if (req.params.id !== requesterId) {
      if (!patient.sharingEnabled) {
        return res.status(403).json({ error: "Access Denied: Patient has disabled sharing." });
      }
      if (requester?.role !== 'doctor') {
         return res.status(403).json({ error: "Access Denied" });
      }
    }

    const records = db.records.filter((r: any) => r.patientId === req.params.id);
    res.json(records);
  });

  // Reminders: Get
  app.get("/api/reminders/:patientId", async (req, res) => {
    const db = await readDB();
    const reminders = (db.reminders || []).filter((r: any) => r.patientId === req.params.patientId);
    res.json(reminders);
  });

  // Reminders: Add
  app.post("/api/reminders", async (req, res) => {
    const db = await readDB();
    const newReminder = { id: nanoid(), ...req.body, createdAt: new Date().toISOString() };
    if (!db.reminders) db.reminders = [];
    db.reminders.push(newReminder);
    await writeDB(db);
    res.json(newReminder);
  });

  // Reminders: Delete
  app.delete("/api/reminders/:id", async (req, res) => {
    const db = await readDB();
    db.reminders = (db.reminders || []).filter((r: any) => r.id !== req.params.id);
    await writeDB(db);
    res.json({ success: true });
  });

  // Static serving for uploads
  app.use("/uploads", express.static(UPLOADS_DIR));

  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
