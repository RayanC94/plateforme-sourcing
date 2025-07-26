-- Table: profiles
-- Stocke les informations des utilisateurs en lien avec la table d'authentification.
CREATE TABLE public.profiles (
    id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    nom text NOT NULL,
    role text NOT NULL
);
COMMENT ON TABLE public.profiles IS 'Table pour stocker les données de profil liées aux utilisateurs authentifiés.';

-- Table: entreprises
-- Représente les différentes marques ou sociétés gérées par un client.
CREATE TABLE public.entreprises (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    nom_entreprise text NOT NULL,
    id_client_session uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE
);
COMMENT ON TABLE public.entreprises IS 'Représente les marques/sociétés gérées par une session client.';

-- Table: quote_groups
-- Conteneur principal pour un ensemble de demandes de devis.
CREATE TABLE public.quote_groups (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    nom_groupe text NOT NULL,
    id_client_session uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status text DEFAULT 'En cours'::text NOT NULL,
    cree_par_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    methode_transport_choisie text,
    cout_transport_estime numeric,
    incoterm text,
    id_entreprise uuid NOT NULL REFERENCES public.entreprises(id) ON DELETE CASCADE
);
COMMENT ON TABLE public.quote_groups IS 'Groupe un ensemble de demandes de devis pour un projet.';

-- Table: quote_requests
-- Une demande de devis spécifique pour un produit.
CREATE TABLE public.quote_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    id_groupe_devis uuid NOT NULL REFERENCES public.quote_groups(id) ON DELETE CASCADE,
    nom_produit text NOT NULL,
    quantite integer NOT NULL,
    photo_url text NOT NULL,
    poids_estime_unitaire_kg numeric,
    volume_estime_unitaire_m3 numeric,
    details_logistiques text
);
COMMENT ON TABLE public.quote_requests IS 'Une demande de devis spécifique pour un produit.';

-- Table: supplier_offers
-- Une offre d'un fournisseur proposée par un agent.
CREATE TABLE public.supplier_offers (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    id_demande_devis uuid NOT NULL REFERENCES public.quote_requests(id) ON DELETE CASCADE,
    id_agent uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    nom_fournisseur text,
    prix_unitaire numeric NOT NULL,
    devise text DEFAULT 'USD'::text NOT NULL,
    details_qualite text,
    est_visible_client boolean DEFAULT false NOT NULL
);
COMMENT ON TABLE public.supplier_offers IS 'Offre d''un fournisseur pour une demande de devis.';

-- Table: invoices
-- Les factures générées à partir des devis validés.
CREATE TABLE public.invoices (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    id_groupe_devis uuid NOT NULL REFERENCES public.quote_groups(id) ON DELETE CASCADE,
    numero_facture text,
    montant_total numeric NOT NULL,
    status text DEFAULT 'En attente de paiement'::text NOT NULL,
    date_emission date,
    date_echeance date,
    echeancier_paiements jsonb
);
COMMENT ON TABLE public.invoices IS 'Factures générées à partir des devis validés.';

-- Table: shipping_formulas
-- Les formules pour calculer les coûts de transport.
CREATE TABLE public.shipping_formulas (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    methode text,
    type_calcul text,
    prix_par_unite numeric,
    frais_fixes numeric,
    incoterm_associe text
);
COMMENT ON TABLE public.shipping_formulas IS 'Formules de calcul des coûts de transport.';


-- Trigger et Fonction pour la création automatique des profils
-- Fonction qui insère une nouvelle ligne dans `profiles` lors de la création d'un utilisateur.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
begin
  insert into public.profiles (id, nom, role)
  values (new.id, new.raw_user_meta_data->>'nom', new.raw_user_meta_data->>'role');
  return new;
end;
$$;

-- Trigger qui appelle la fonction après chaque nouvelle inscription.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();