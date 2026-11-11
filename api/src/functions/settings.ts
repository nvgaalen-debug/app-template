// Beheer-API voor instellingen. Alleen de rol "admin" heeft toegang.
import { app, HttpRequest, InvocationContext } from "@azure/functions";
import { getPool, sql } from "../lib/db";
import { HttpError, json, requireRole, withErrors } from "../lib/http";

// GET /api/settings
app.http("settings-list", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "settings",
  handler: withErrors(async (req: HttpRequest, _ctx: InvocationContext) => {
    requireRole(req, "admin");
    const pool = await getPool();
    const result = await pool
      .request()
      .query("SELECT [key], value, updated_at FROM dbo.settings ORDER BY [key]");
    return json(200, result.recordset);
  }),
});

// PUT /api/settings/{key}  body: { "value": "..." }
app.http("settings-update", {
  methods: ["PUT"],
  authLevel: "anonymous",
  route: "settings/{key}",
  handler: withErrors(async (req: HttpRequest, _ctx: InvocationContext) => {
    requireRole(req, "admin");

    const key = String(req.params.key ?? "");
    if (!/^[a-z0-9_]{1,100}$/i.test(key)) {
      throw new HttpError(400, "Ongeldige sleutel");
    }

    const body = (await req.json()) as { value?: unknown };
    const value = typeof body.value === "string" ? body.value : null;

    const pool = await getPool();
    await pool
      .request()
      .input("key", sql.NVarChar(100), key)
      .input("value", sql.NVarChar(sql.MAX), value)
      .query(`
        MERGE dbo.settings AS t
        USING (SELECT @key AS [key]) AS s ON t.[key] = s.[key]
        WHEN MATCHED THEN UPDATE SET value = @value, updated_at = SYSUTCDATETIME()
        WHEN NOT MATCHED THEN INSERT ([key], value) VALUES (@key, @value);
      `);

    return json(200, { ok: true });
  }),
});
