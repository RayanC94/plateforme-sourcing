'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";

export default function CreateSellerProfileDialog() {
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

    let stampUrl = null;
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

    const { error: insertError } = await supabase.from('seller_profiles').insert({
      company_name: formValues.company_name,
      address: formValues.address,
      business_registration_number: formValues.business_registration_number,
      phone_number: formValues.phone_number,
      website_url: formValues.website_url,
      email: formValues.email,
      beneficiary_name: formValues.beneficiary_name,
      beneficiary_account_number: formValues.beneficiary_account_number,
      beneficiary_address: formValues.beneficiary_address,
      bank_name: formValues.bank_name,
      bank_address: formValues.bank_address,
      swift_code: formValues.swift_code,
      bank_code: formValues.bank_code,
      branch_code: formValues.branch_code,
      country_region: formValues.country_region,
      stamp_url: stampUrl,
    });

    if (insertError) {
      alert(`Error saving profile: ${insertError.message}`);
    } else {
      setOpen(false);
      router.refresh();
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>+ Add New Profile</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader><DialogTitle>Create Seller Profile</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
            {/* Company Info */}
            <div className="col-span-2 font-bold text-lg border-b pb-2">Company Info</div>
            <div><Label>Company Name</Label><Input name="company_name" required /></div>
            <div><Label>Business Registration #</Label><Input name="business_registration_number" /></div>
            <div className="col-span-2"><Label>Address</Label><Input name="address" /></div>
            <div><Label>Phone Number</Label><Input name="phone_number" /></div>
            <div><Label>Website</Label><Input name="website_url" type="url" /></div>
            <div><Label>Email</Label><Input name="email" type="email" /></div>

            {/* Bank Info */}
            <div className="col-span-2 font-bold text-lg border-b pb-2 mt-4">Bank Info</div>
            <div><Label>Beneficiary Name</Label><Input name="beneficiary_name" /></div>
            <div><Label>Account Number</Label><Input name="beneficiary_account_number" /></div>
            <div className="col-span-2"><Label>Beneficiary Address</Label><Input name="beneficiary_address" /></div>
            <div><Label>Bank Name</Label><Input name="bank_name" /></div>
            <div><Label>Bank Address</Label><Input name="bank_address" /></div>
            <div><Label>Swift Code</Label><Input name="swift_code" /></div>
            <div><Label>Bank Code</Label><Input name="bank_code" /></div>
            <div><Label>Branch Code</Label><Input name="branch_code" /></div>
            <div><Label>Country/Region</Label><Input name="country_region" /></div>

            {/* Stamp */}
            <div className="col-span-2 font-bold text-lg border-b pb-2 mt-4">Company Stamp</div>
            <div className="col-span-2"><Label>Stamp Image</Label><Input type="file" onChange={(e) => setStampFile(e.target.files ? e.target.files[0] : null)} /></div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Profile'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}