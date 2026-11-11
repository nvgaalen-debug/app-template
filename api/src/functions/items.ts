// Voorbeeld-CRUD. Kopieer dit bestand als startpunt voor een nieuwe module.
import { app, HttpRequest, InvocationContext } from "@azure/functions";
import { getPool, sql } from "../lib/db";
import { HttpError, json, requireRole, requireUser, withErrors } from "../lib/http";

// GET /api/items: elke ingelogde gebruiker mag lezen
app.http("items-list", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "items",
  handler: withErrors(async (req: HttpRequest, _ctx: InvocationContext) => {
    requireUser(req);
    const pool = await getPool();
    const result = await pool
      .request()
      .query("SELECT id, name, description, created_by, created_at FROM dbo.items ORDER BY created_at DESC");
    return json(200, result.recordset);
  }),
});

// POST /api/items: elke ingelogde gebruiker mag aanmaken
app.http("items-create", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "items",
  handler: withErrors(async (req: HttpRequest, _ctx: InvocationContext) => {
    const principal = requireUser(req);
    const body = (await req.json()) as { name?: unknown; description?: unknown };

    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name || name.length > 200) {
      throw new HttpError(400, "Naam is verplicht (max. 200 tekens)");
    }
    const description = typeof body.description === "string" ? body.description.slice(0, 1000) : null;

    const pool = await getPool();
    await pool
      .request()
      .input("name", sql.NVarChar(200), name)
      .input("description", sql.NVarChar(1000), description)
      .input("createdBy", sql.NVarChar(256), principal.userDetails)
      .query("INSERT INTO dbo.items (name, description, created_by) VALUES (@name, @description, @createdBy)");

    return json(201, { ok: true });
  }),
});

// DELETE /api/items/{id}: alleen beheerders
app.http("items-delete", {
  methods: ["DELETE"],
  authLevel: "anonymous",
  route: "items/{id:int}",
  handler: withErrors(async (req: HttpRequest, _ctx: InvocationContext) => {
    requireRole(req, "admin");
    const id = Number(req.params.id);
    const pool = await getPool();
    await pool.request().input("id", sql.Int, id).query("DELETE FROM dbo.items WHERE id = @id");
    return { status: 204 };
  }),
});
