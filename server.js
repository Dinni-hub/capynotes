const express = require("express");
const cors = require("cors");
const db = require("./database");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/notes", (req, res) => {
  const notes = db.prepare("SELECT * FROM notes").all();
  res.json(notes);
});

app.post("/api/notes", (req, res) => {
  const note = req.body;

  db.prepare(`
    INSERT OR REPLACE INTO notes
    (id, title, content, color, font, align, date)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    note.id,
    note.title,
    note.content,
    note.color,
    note.font,
    note.align,
    note.date
  );

  res.json({ success: true });
});

app.delete("/api/notes/:id", (req, res) => {
  db.prepare("DELETE FROM notes WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});