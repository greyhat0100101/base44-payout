import { payout } from "./payout.ts";

Deno.serve(async (req) => {
  const url = new URL(req.url);

  if (url.pathname === "/payout" && req.method === "POST") {
    return payout(req);
  }

  return new Response(JSON.stringify({ error: "Not Found" }), {
    status: 404,
    headers: { "Content-Type": "application/json" },
  });
});
