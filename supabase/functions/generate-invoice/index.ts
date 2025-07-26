import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

// These are for PDF generation
import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { invoiceId } = await req.json()
    const authHeader = req.headers.get('Authorization')!
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // 1. Fetch all data for the invoice
    const { data: invoice, error } = await supabase
      .from('invoices')
      .select(`
        *,
        seller_profiles(*),
        quote_groups(
          *,
          entreprises(*),
          quote_requests(
            *,
            supplier_offers(*)
          )
        )
      `)
      .eq('id', invoiceId)
      .single();

    if (error) throw error

    // 2. Build the HTML for the PDF
    // This is a simplified version of your Excel file. You can add more CSS here.
    const html = `
      <html>
        <head><style>
          body { font-family: sans-serif; font-size: 10px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ccc; padding: 4px; }
          h1 { font-size: 16px; }
        </style></head>
        <body>
          <h1>Invoice: ${invoice.numero_facture}</h1>
          <p>Date: ${new Date(invoice.date_emission).toLocaleDateString()}</p>
          <hr/>
          <h3>Seller: ${invoice.seller_profiles.company_name}</h3>
          <p>${invoice.seller_profiles.address}</p>
          <h3>Buyer: ${invoice.quote_groups.entreprises.nom_entreprise}</h3>
          <p>${invoice.quote_groups.entreprises.address || ''}</p>
          <hr/>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.quote_groups.quote_requests.map(req => {
                const offer = req.supplier_offers[0]
                const unitPrice = (offer.prix_unitaire_rmb / offer.exchange_rate).toFixed(2)
                const total = (unitPrice * req.quantite).toFixed(2)
                return `
                  <tr>
                    <td>${req.nom_produit}</td>
                    <td>${req.quantite}</td>
                    <td>${unitPrice} ${offer.client_currency}</td>
                    <td>${total} ${offer.client_currency}</td>
                  </tr>`
              }).join('')}
            </tbody>
          </table>
          <hr/>
          <h2>Total: ${invoice.montant_total.toFixed(2)}</h2>
          <hr/>
          <h3>Bank Information:</h3>
          <p>Beneficiary: ${invoice.seller_profiles.beneficiary_name}</p>
          <p>Account: ${invoice.seller_profiles.beneficiary_account_number}</p>
        </body>
      </html>
    `;

    // 3. Launch a browser and create the PDF
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox']
    });
    const page = await browser.newPage();
    await page.setContent(html);
    const pdf = await page.pdf({ format: 'A4' });
    await browser.close();

    // 4. Return the PDF
    return new Response(pdf, {
      headers: { ...corsHeaders, 'Content-Type': 'application/pdf' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})