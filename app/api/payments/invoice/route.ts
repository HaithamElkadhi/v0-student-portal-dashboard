import { NextRequest, NextResponse } from "next/server"
import { POST as loadPayments } from "../route"
import type { Payment } from "@/lib/payment-types"

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const response = await loadPayments(new NextRequest(request.url, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prospectId: params.get("prospectId"), email: params.get("email") }),
  }))
  if (!response.ok) return response
  const data = await response.json()
  const payment = (data.payments as Payment[]).find(p => p.ref === params.get("ref"))
  if (!payment?.invoiceUrl) return NextResponse.json({ error: "Facture introuvable." }, { status: 404 })
  try {
    const url = new URL(payment.invoiceUrl)
    if (url.protocol !== "https:" || !["airtableusercontent.com", "airtable.com"].some(host => url.hostname === host || url.hostname.endsWith("." + host))) {
      return NextResponse.json({ error: "Source de facture non prise en charge." }, { status: 400 })
    }
    const pdf = await fetch(url, { cache: "no-store", redirect: "error" })
    if (!pdf.ok) throw new Error("Download failed")
    const bytes = await pdf.arrayBuffer()
    if (new TextDecoder().decode(bytes.slice(0, 5)) !== "%PDF-") return NextResponse.json({ error: "La facture enregistrée n’est pas un PDF." }, { status: 415 })
    const filename = "Facture-" + payment.ref.replace(/[^a-zA-Z0-9_-]/g, "_") + ".pdf"
    return new NextResponse(bytes, { headers: {
      "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff",
    } })
  } catch {
    return NextResponse.json({ error: "Téléchargement indisponible. Réessayez." }, { status: 502 })
  }
}
