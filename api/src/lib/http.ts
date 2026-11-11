// Gedeelde helpers voor alle API-functies: gebruikersinformatie uit SWA,
// rolcontrole, JSON-antwoorden en één centrale foutafhandeling.
import { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

export interface Principal {
  userId: string;
  userDetails: string;
  identityProvider: string;
  userRoles: string[];
}

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export type Handler = (req: HttpRequest, ctx: InvocationContext) => Promise<HttpResponseInit>;

// Static Web Apps zet de ingelogde gebruiker in de header x-ms-client-principal (base64 JSON).
// Deze header kan een gebruiker niet zelf zetten: SWA vervangt hem bij elke aanvraag.
export function getPrincipal(req: HttpRequest): Principal | null {
  const header = req.headers.get("x-ms-client-principal");
  if (!header) return null;
  const decoded = JSON.parse(Buffer.from(header, "base64").toString("utf8"));
  return {
    userId: decoded.userId,
    userDetails: decoded.userDetails,
    identityProvider: decoded.identityProvider,
    userRoles: decoded.userRoles ?? [],
  };
}

export function requireUser(req: HttpRequest): Principal {
  const principal = getPrincipal(req);
  if (!principal) throw new HttpError(401, "Niet ingelogd");
  return principal;
}

export function requireRole(req: HttpRequest, role: string): Principal {
  const principal = requireUser(req);
  if (!principal.userRoles.includes(role)) throw new HttpError(403, "Geen toegang");
  return principal;
}

export function json(status: number, body: unknown): HttpResponseInit {
  return {
    status,
    jsonBody: body,
  };
}

// Pakt alle fouten in één plek af. Onverwachte fouten worden gelogd en geven
// een algemene melding terug, zodat er geen interne details naar de browser gaan.
export function withErrors(handler: Handler): Handler {
  return async (req, ctx) => {
    try {
      return await handler(req, ctx);
    } catch (err) {
      if (err instanceof HttpError) {
        return json(err.status, { error: err.message });
      }
      ctx.error("Onverwachte fout", err);
      return json(500, { error: "Er ging iets mis op de server" });
    }
  };
}
