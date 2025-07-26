'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Pencil } from 'lucide-react';

export default function EditSellerProfileDialog({ profile }: { profile: any }) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stampFile, setStampFile] = useState<File | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const formValues = Object.fromEntries(formData.entries());

    let stampUrl = profile.stamp_url;
    if (stampFile) {
      const fileName = `stamps/${Date.now()}_${stampFile.name}`;
      const { error: uploadError } = await supabase.storage.from('images').upload(fileName, stampFile);
      if (uploadError) {
        alert(`Error uploading stamp: ${uploadError.message}`);
        setIsSubmitting(false);
        return;
      }
      const { data } = supabase.storage.from('images').getPublicUrl(fileName);
      stampUrl = data.publicUrl;
    }

    const { error: updateError } = await supabase
      .from('seller_profiles')
      .update({ ...formValues, stamp_url: stampUrl })
      .eq('id', profile.id);

    if (updateError) {
      alert(`Error updating profile: ${updateError.message}`);
    } else {
      setOpen(false);
      router.refresh();
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader><DialogTitle>Edit Seller Profile</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
            {/* Pre-fill all fields with existing data using defaultValue */}
            <div className="col-span-2 font-bold text-lg border-b pb-2">Company Info</div>
            <div><Label>Company Name</Label><Input name="company_name" defaultValue={profile.company_name} required /></div>
            <div><Label>Business Registration #</Label><Input name="business_registration_number" defaultValue={profile.business_registration_number} /></div>
            <div className="col-span-2"><Label>Address</Label><Input name="address" defaultValue={profile.address} /></div>
            <div><Label>Phone Number</Label><Input name="phone_number" defaultValue={profile.phone_number} /></div>
            <div><Label>Website</Label><Input name="website_url" type="url" defaultValue={profile.website_url} /></div>
            <div><Label>Email</Label><Input name="email" type="email" defaultValue={profile.email} /></div>

            <div className="col-span-2 font-bold text-lg border-b pb-2 mt-4">Bank Info</div>
            <div><Label>Beneficiary Name</Label><Input name="beneficiary_name" defaultValue={profile.beneficiary_name} /></div>
            <div><Label>Account Number</Label><Input name="beneficiary_account_number" defaultValue={profile.beneficiary_account_number} /></div>
            <div className="col-span-2"><Label>Beneficiary Address</Label><Input name="beneficiary_address" defaultValue={profile.beneficiary_address} /></div>
            <div><Label>Bank Name</Label><Input name="bank_name" defaultValue={profile.bank_name} /></div>
            <div><Label>Bank Address</Label><Input name="bank_address" defaultValue={profile.bank_address} /></div>
            <div><Label>Swift Code</Label><Input name="swift_code" defaultValue={profile.swift_code} /></div>
            <div><Label>Bank Code</Label><Input name="bank_code" defaultValue={profile.bank_code} /></div>
            <div><Label>Branch Code</Label><Input name="branch_code" defaultValue={profile.branch_code} /></div>
            <div><Label>Country/Region</Label><Input name="country_region" defaultValue={profile.country_region} /></div>

            <div className="col-span-2 font-bold text-lg border-b pb-2 mt-4">Company Stamp</div>
            <div className="col-span-2"><Label>New Stamp Image</Label><Input type="file" onChange={(e) => setStampFile(e.target.files ? e.target.files[0] : null)} /></div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}