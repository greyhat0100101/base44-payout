export async function payout(req: Request) {
  try {
    const body = await req.json();

    const {
      email,
      amount,
      currency,
      note,
      secrets,
    } = body;

    if (!amount || !currency || !secrets) {
      return Response.json({ error: "Missing fields" }, { status: 400 });
    }

    const clientId = secrets.PAYPAL_CLIENT_ID;
    const clientSecret = secrets.PAYPAL_CLIENT_SECRET;
    const mode = secrets.PAYPAL_MODE || "sandbox";

    const baseUrl =
      mode === "live"
        ? "https://api-m.paypal.com"
        : "https://api-m.sandbox.paypal.com";

    const tokenResponse = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        "Authorization": "Basic " + btoa(`${clientId}:${clientSecret}`),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      return Response.json(
        { error: "Could not get PayPal token", details: tokenData },
        { status: 500 },
      );
    }

    const accessToken = tokenData.access_token;

    const payoutResponse = await fetch(`${baseUrl}/v1/payments/payouts`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender_batch_header: { email_subject: "Pago enviado" },
        items: [
          {
            recipient_type: "EMAIL",
            receiver: email,
            amount: { value: amount, currency: currency },
            note: note,
          },
        ],
      }),
    });

    const payoutResult = await payoutResponse.json();

    return Response.json({ success: true, paypal_response: payoutResult });

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
