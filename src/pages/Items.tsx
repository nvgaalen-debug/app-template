// Voorbeeldmodule (CRUD). Kopieer deze pagina en de bijbehorende API-functie
// als startpunt voor een nieuwe module in je app.
import { FormEvent, useEffect, useState } from "react";
import { api } from "../lib/api";

interface Item {
  id: number;
  name: string;
  description: string | null;
  created_by: string | null;
  created_at: string;
}

export default function Items() {
  const [items, setItems] = useState<Item[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setItems(await api<Item[]>("/items"));
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await api("/items", { method: "POST", body: JSON.stringify({ name }) });
      setName("");
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div>
      <h1>Items</h1>
      {error && <p className="error">{error}</p>}

      <form className="card" onSubmit={handleCreate}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nieuw item" />{" "}
        <button type="submit">Toevoegen</button>
      </form>

      <div className="card">
        <table>
          <thead>
            <tr><th>Naam</th><th>Aangemaakt door</th><th>Datum</th></tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.created_by ?? "-"}</td>
                <td>{new Date(item.created_at).toLocaleString("nl-NL")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
