import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { invoiceId } = await req.json();
    const authHeader = req.headers.get('Authorization');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader! },
        },
      }
    );

    const { data: invoice, error } = await supabase
      .from('invoices')
      .select(`*, seller_profiles(*), quote_groups(*, entreprises(*), quote_requests(*, supplier_offers(*)))`)
      .eq('id', invoiceId)
      .single();

    if (error) throw error;
    if (!invoice) throw new Error('Invoice not found');
    
    const seller = invoice.seller_profiles;
    const quoteGroup = invoice.quote_groups;
    const buyer = quoteGroup?.entreprises;
    const requests = quoteGroup?.quote_requests || [];

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Invoice ${invoice.numero_facture || ''}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; margin: 40px; line-height: 1.5; font-size: 10px; color: #333; }
            .header, .footer { text-align: center; margin-bottom: 20px; }
            .company-info { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .company-box { width: 45%; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #eee; padding: 8px; text-align: left; }
            th { background-color: #f8f8f8; }
            .text-right { text-align: right; }
            .total-section { margin-top: 20px; float: right; width: 40%; }
          </style>
        </head>
        <body>
          <div class="header"><h1>COMMERCIAL INVOICE</h1><h2>Invoice No: ${invoice.numero_facture || 'N/A'}</h2></div>
          <div class="company-info"><div class="company-box"><h3>SELLER:</h3><strong>${seller?.company_name || 'N/A'}</strong><br>${seller?.address || ''}<br>${seller?.phone_number || ''}</div><div class="company-box"><h3>BUYER:</h3><strong>${buyer?.nom_entreprise || 'N/A'}</strong><br>${buyer?.address || ''}</div></div>
          <table>
            <thead><tr><th>Product</th><th>Specification</th><th>Qty</th><th class="text-right">Unit Price</th><th class="text-right">Total</th></tr></thead>
            <tbody>
              ${requests.map((req) => {
                const offer = req.supplier_offers?.[0];
                if (!offer) return '';
                const unitPrice = offer.exchange_rate && offer.exchange_rate > 0 ? (offer.prix_unitaire_rmb || 0) / offer.exchange_rate : 0;
                const total = unitPrice * req.quantite;
                const currency = offer.client_currency || '';
                return `<tr><td>${req.nom_produit || 'N/A'}</td><td>${offer.product_specification || ''}</td><td>${req.quantite || 0}</td><td class="text-right">${unitPrice.toFixed(2)} ${currency}</td><td class="text-right">${total.toFixed(2)} ${currency}</td></tr>`;
              }).join('')}
            </tbody>
          </table>
          <div class="total-section">
            <table>
              <tr><td>Subtotal</td><td class="text-right">${Number(invoice.montant_total - (quoteGroup?.cout_transport_estime || 0)).toFixed(2)}</td></tr>
              <tr><td>Shipping (${quoteGroup?.methode_transport_choisie || ''})</td><td class="text-right">${Number(quoteGroup?.cout_transport_estime || 0).toFixed(2)}</td></tr>
              <tr><td><strong>TOTAL</strong></td><td class="text-right"><strong>${Number(invoice.montant_total).toFixed(2)}</strong></td></tr>
            </table>
          </div>
          <div style="clear:both;"></div>
          <div class="bank-info" style="margin-top: 30px;">
            <h3>PAYMENT INFORMATION:</h3>
            <p><strong>Beneficiary:</strong> ${seller?.beneficiary_name || 'N/A'}<br><strong>Account:</strong> ${seller?.beneficiary_account_number || 'N/A'}<br><strong>Bank:</strong> ${seller?.bank_name || 'N/A'}<br><strong>SWIFT:</strong> ${seller?.swift_code || 'N/A'}</p>
          </div>
        </body>
      </html>
    `;
    
    const browserlessApiKey = Deno.env.get('BROWSERLESS_API_KEY');
    if (!browserlessApiKey) throw new Error('Browserless API key not found.');
    
    const pdfResponse = await fetch(`https://production-sfo.browserless.io/pdf?token=${browserlessApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        html: html,
        options: { format: 'A4', printBackground: true, margin: { top: '40px', right: '20px', bottom: '20px', left: '20px' } }
      })
    });

    if (!pdfResponse.ok) {
      const errorBody = await pdfResponse.text();
      throw new Error(`Browserless API failed with status ${pdfResponse.status}: ${errorBody}`);
    }

    const pdfBuffer = await pdfResponse.arrayBuffer();

    return new Response(pdfBuffer, {
      headers: { ...corsHeaders, 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${invoice.numero_facture || 'invoice'}.pdf"` },
      status: 200,
    });

  } catch (error) {
    console.error('❌ Function error:', error);
    return new Response(JSON.stringify({
      error: error.message,
      stack: error.stack, // Include the full error stack in the response
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    });
  }
});