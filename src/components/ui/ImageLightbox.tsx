'use client';

import Image from 'next/image';
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface ImageLightboxProps {
  src: string;
  alt: string;
}

export default function ImageLightbox({ src, alt }: ImageLightboxProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="cursor-pointer transition-transform duration-200 hover:scale-110">
          <Image
            src={src}
            alt={alt}
            width={40}
            height={40}
            className="rounded-md object-cover"
          />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl p-0 bg-transparent border-none">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className="w-full h-auto object-contain rounded-lg"
        />
      </DialogContent>
    </Dialog>
  );
}
