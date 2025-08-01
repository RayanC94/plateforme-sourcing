'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const supabase = createClientComponentClient();

// Télécharger les demandes sélectionnées sous forme de devis
export async function downloadQuote(
  requestIds: string[],
  format: 'pdf' | 'excel'
) {
  const { data, error } = await supabase.functions.invoke('generate-quote', {
    body: { ids: requestIds, format },
  });
  if (error) throw error;
  if (!data) return;
  const mime =
    format === 'pdf'
      ? 'application/pdf'
      : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  const blob = new Blob([data as ArrayBuffer], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `devis.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
  a.click();
  URL.revokeObjectURL(url);
}

// Demande de facture commune
export async function requestCommonInvoice(requestIds: string[]) {
  const { data, error } = await supabase.functions.invoke(
    'request-common-invoice',
    {
      body: { ids: requestIds },
    }
  );
  if (error) throw error;
  return data;
}

// Suppression de requêtes
export async function deleteRequests(requestIds: string[]) {
  return await supabase.from('quote_requests').delete().in('id', requestIds);
}

// Modification de requêtes
export async function modifyRequests(
  requestIds: string[],
  data: { nom_produit?: string; quantite?: number; details?: string }
) {
  return await supabase.from('quote_requests').update(data).in('id', requestIds);
}

// Déplacement de requêtes vers un autre groupe
export async function moveRequests(
  requestIds: string[],
  targetGroupId: string
) {
  return await supabase
    .from('quote_requests')
    .update({ id_groupe_devis: targetGroupId })
    .in('id', requestIds);
}

// Archivage de requêtes
export async function archiveRequests(requestIds: string[]) {
  return await supabase
    .from('quote_requests')
    .update({ archived: true })
    .in('id', requestIds);
}

// Création d'une requête
export async function createRequest(data: {
  nom_produit: string;
  quantite: number;
  photo_url: string;
  id_groupe_devis?: string | null;
  details?: string;
}) {
  return await supabase.from('quote_requests').insert(data);
}

