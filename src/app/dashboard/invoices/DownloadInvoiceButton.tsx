'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export default function DownloadInvoiceButton({ invoiceId, invoiceNumber }: { invoiceId: string, invoiceNumber: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClientComponentClient();

  const handleDownload = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.functions.invoke('generate-invoice', {
      body: { invoiceId },
    });

    if (error) {
      // Get the detailed error from the function's response
      const errorDetails = await error.context.json();
      console.error("Function Error Details:", errorDetails);
      // Display the full error in an alert
      alert(`Function Crashed:\n\n${errorDetails.stack}`);
      setIsLoading(false);
      return;
    }

    const blob = data instanceof Blob ? data : new Blob([data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${invoiceNumber}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    
    setIsLoading(false);
  };

  return (
    <Button onClick={handleDownload} disabled={isLoading} variant="outline" size="sm">
      <Download className="h-4 w-4 mr-2" />
      {isLoading ? 'Generating...' : 'Download PDF'}
    </Button>
  );
}