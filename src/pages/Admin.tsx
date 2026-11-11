// Beheerscherm: instellingen die in de database staan. Alleen toegankelijk voor de rol "admin".
import { FormEvent, useEffect, useState } from "react";
import { api } from "../lib/api";

interface Setting {
  key: string;
  value: string | null;
  updated_at: string;
}

export default function Admin() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  async function load() {
    try {
      setSettings(await api<Setting[]>("/settings"));
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSave(key: string, value: string) {
    try {
      await api(`/settings/${encodeURIComponent(key)}`, {
        method: "PUT",
        body: JSON.stringify({ value }),
      });
      setSaved(`"${key}" opgeslagen`);
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div>
      <h1>Beheer</h1>
      {error && <p className="error">{error}</p>}
      {saved && <p>{saved}</p>}

      <div className="card">
        <h2>Instellingen</h2>
        {settings.map((s) => (
          <SettingRow key={s.key} setting={s} onSave={handleSave} />
        ))}
        {settings.length === 0 && <p>Geen instellingen gevonden.</p>}
      </div>
    </div>
  );
}

function SettingRow({
  setting,
  onSave,
}: {
  setting: Setting;
  onSave: (key: string, value: string) => void;
}) {
  const [value, setValue] = useState(setting.value ?? "");

  function submit(e: FormEvent) {
    e.preventDefault();
    onSave(setting.key, value);
  }

  return (
    <form onSubmit={submit} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
      <label style={{ minWidth: 160 }}>{setting.key}</label>
      <input value={value} onChange={(e) => setValue(e.target.value)} style={{ flex: 1 }} />
      <button type="submit">Opslaan</button>
    </form>
  );
}
