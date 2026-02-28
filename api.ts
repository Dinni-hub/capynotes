const API = "http://localhost:3001/api";

export async function getNotes() {
  const res = await fetch(`${API}/notes`);
  return res.json();
}

export async function saveNote(note: any) {
  await fetch(`${API}/notes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(note)
  });
}

export async function deleteNote(id: string) {
  await fetch(`${API}/notes/${id}`, {
    method: "DELETE"
  });
}