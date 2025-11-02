"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { getDrafts, deleteDraft, getDraft } from "../../lib/draftStorage";
import { formatCurrency, formatDate, calculateTotal } from "../../lib/utils";
import { FiTrash2, FiEdit, FiFileText, FiClock } from "react-icons/fi";

export default function DraftManager({ isOpen, onClose, onLoadDraft }) {
  const [drafts, setDrafts] = useState([]);
  const [selectedDraft, setSelectedDraft] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadDrafts();
    }
  }, [isOpen]);

  const loadDrafts = () => {
    const savedDrafts = getDrafts();
    setDrafts(savedDrafts.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)));
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this draft?")) {
      deleteDraft(id);
      loadDrafts();
    }
  };

  const handleLoad = (draftId) => {
    const draft = getDraft(draftId);
    if (draft) {
      onLoadDraft(draft);
      onClose();
    }
  };

  const getDraftTotal = (draft) => {
    const items = draft.items || draft.cart || [];
    const { total } = calculateTotal(items, 18);
    return total;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FiFileText className="w-5 h-5" />
            Saved Drafts
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto">
          {drafts.length === 0 ? (
            <div className="text-center py-12">
              <FiFileText className="w-16 h-16 text-muted mx-auto mb-4 opacity-50" />
              <p className="text-muted font-medium">No drafts saved</p>
              <p className="text-sm text-muted mt-2">Save invoices as drafts to continue later</p>
            </div>
          ) : (
            <div className="space-y-3">
              {drafts.map((draft) => (
                <Card key={draft.id} className="hover:border-primary transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <FiFileText className="w-4 h-4 text-muted" />
                          <span className="font-semibold">
                            {draft.title || `Draft ${draft.id.slice(-6)}`}
                          </span>
                          {draft.customer && (
                            <span className="text-xs px-2 py-1 bg-accent/10 text-accent rounded-full">
                              {draft.customer.name}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted mb-2">
                          <span className="flex items-center gap-1">
                            <FiClock className="w-3 h-3" />
                            {formatDate(draft.updatedAt)}
                          </span>
                          <span>{draft.items?.length || draft.cart?.length || 0} items</span>
                        </div>
                        <div className="text-lg font-bold text-accent">
                          {formatCurrency(getDraftTotal(draft))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleLoad(draft.id)}
                          className="h-9 w-9"
                          title="Load Draft"
                        >
                          <FiEdit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(draft.id)}
                          className="h-9 w-9 text-error hover:text-red-700"
                          title="Delete Draft"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

