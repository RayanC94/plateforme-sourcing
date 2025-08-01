'use client';

import { useSelection } from './SelectionContext';
import { Button } from '@/components/ui/button';

export default function ActionSidebar() {
  const { selectedRequests, selectedGroups, clearSelection } = useSelection();

  if (selectedRequests.length === 0 && selectedGroups.length === 0) {
    return null;
  }

  return (
    <aside className="w-64 ml-4 p-4 border rounded h-fit">
      <h2 className="font-semibold mb-2">Actions</h2>
      {selectedRequests.length > 0 && (
        <div className="mb-4">
          <p className="text-sm mb-2">{selectedRequests.length} requête(s) sélectionnée(s)</p>
          <Button variant="destructive" className="w-full mb-2">Supprimer</Button>
        </div>
      )}
      {selectedGroups.length > 0 && (
        <div className="mb-4">
          <p className="text-sm mb-2">{selectedGroups.length} groupe(s) sélectionné(s)</p>
          <Button variant="destructive" className="w-full mb-2">Supprimer</Button>
        </div>
      )}
      <Button variant="secondary" className="w-full" onClick={clearSelection}>
        Annuler la sélection
      </Button>
    </aside>
  );
}

