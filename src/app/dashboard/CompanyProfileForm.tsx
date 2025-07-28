'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

interface CompanyProfile {
  id?: string;
  nom_entreprise?: string;
  country?: string;
  registration_number?: string;
  address?: string;
}

interface CompanyProfileFormProps {
  session: { user: { id: string } };
  company?: CompanyProfile;
  onSaved?: () => void;
}

export default function CompanyProfileForm({ session, company, onSaved }: CompanyProfileFormProps) {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [name, setName] = useState(company?.nom_entreprise || '');
  const [country, setCountry] = useState(company?.country || 'FR');
  const [registrationNumber, setRegistrationNumber] = useState(company?.registration_number || '');
  const [address, setAddress] = useState(company?.address || '');

  const registrationLabel = country === 'FR'
    ? 'SIRET'
    : country === 'DE'
      ? 'Handelsregisternummer'
      : 'Registration Number';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const payload = {
      nom_entreprise: name,
      country,
      registration_number: registrationNumber,
      address,
      id_client_session: session.user.id,
    };

    let error;
    if (company?.id) {
      ({ error } = await supabase
        .from('entreprises')
        .update(payload)
        .eq('id', company.id));
    } else {
      ({ error } = await supabase.from('entreprises').insert(payload));
    }

    if (!error) {
      if (!company?.id) {
        setName('');
        setRegistrationNumber('');
        setAddress('');
      }
      onSaved?.();
      router.refresh();
    } else {
      console.error('Erreur en sauvegardant la société:', error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Nom de l'entreprise</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <Label>Pays</Label>
        <Select value={country} onValueChange={setCountry}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="FR">France</SelectItem>
            <SelectItem value="DE">Allemagne</SelectItem>
            <SelectItem value="US">États-Unis</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>{registrationLabel}</Label>
        <Input value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)} />
      </div>
      <div>
        <Label>Adresse</Label>
        <Input value={address} onChange={(e) => setAddress(e.target.value)} />
      </div>
      <Button type="submit">{company?.id ? 'Mettre à jour' : 'Créer'}</Button>
    </form>
  );
}