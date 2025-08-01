'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ImageLightbox from '@/components/ui/ImageLightbox';
import QuoteRequestActions from './QuoteRequestActions';
import { TableRow, TableCell } from '@/components/ui/table';
import { useSelection } from '../selection/SelectionContext';

type QuoteRequest = {
  id: string;
  nom_produit: string;
  quantite: number;
  photo_url: string | null;
};

interface DraggableQuoteRequestProps {
  request: QuoteRequest;
}

export default function DraggableQuoteRequest({ request }: DraggableQuoteRequestProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: request.id });
  const { selectedRequests, toggleRequest } = useSelection();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TableRow ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TableCell>
        <input
          type="checkbox"
          checked={selectedRequests.includes(request.id)}
          onChange={() => toggleRequest(request.id)}
          onClick={(e) => e.stopPropagation()}
        />
      </TableCell>
      <TableCell>
        {request.photo_url && (
          <ImageLightbox src={request.photo_url} alt={request.nom_produit} />
        )}
      </TableCell>
      <TableCell className="font-medium">{request.nom_produit}</TableCell>
      <TableCell>{request.quantite}</TableCell>
      <TableCell className="text-right">
        <QuoteRequestActions request={request} />
      </TableCell>
    </TableRow>
  );
}

