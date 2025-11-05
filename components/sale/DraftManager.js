"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
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
    setDrafts(
      savedDrafts.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    );
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
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col bg-background text-foreground">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <FiFileText className="w-5 h-5" />
            Draft Invoices ({drafts.length})
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {drafts.length === 0 ? (
            <div className="text-center py-12">
              <FiFileText className="w-16 h-16 text-muted mx-auto mb-4 opacity-50" />
              <p className="text-muted font-medium">No drafts saved</p>
              <p className="text-sm text-muted mt-2">
                Save invoices as drafts to continue later
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {drafts.map((draft) => {
                const items = draft.items || draft.cart || [];
                return (
                  <Card
                    key={draft.id}
                    className="hover:border-primary transition-colors bg-card-hover border-border"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <FiFileText className="w-4 h-4 text-primary flex-shrink-0" />
                            <span className="font-semibold text-foreground truncate">
                              {draft.title ||
                                `Draft ${draft.id?.slice(-6) || ""}`}
                            </span>
                            {draft.customer && (
                              <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded-full whitespace-nowrap">
                                {draft.customer.name}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted mb-2 flex-wrap">
                            <span className="flex items-center gap-1">
                              <FiClock className="w-3 h-3" />
                              {formatDate(draft.updatedAt)}
                            </span>
                            <span>
                              {items.length}{" "}
                              {items.length === 1 ? "item" : "items"}
                            </span>
                          </div>
                          <div className="text-base font-bold text-primary">
                            {formatCurrency(getDraftTotal(draft))}
                          </div>
                          {/* Preview items */}
                          {items.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-border">
                              <div className="flex flex-wrap gap-1">
                                {items.slice(0, 3).map((item, idx) => (
                                  <span
                                    key={idx}
                                    className="text-xs px-2 py-0.5 bg-card rounded text-muted"
                                  >
                                    {item.name} x{item.qty || 1}
                                  </span>
                                ))}
                                {items.length > 3 && (
                                  <span className="text-xs px-2 py-0.5 text-muted">
                                    +{items.length - 3} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-2 flex-shrink-0">
                          <Button
                            variant="outline"
                            onClick={() => handleLoad(draft.id)}
                            className="h-9 px-3 text-sm bg-card hover:bg-card-hover border-border text-foreground"
                            title="Load Draft"
                          >
                            <FiEdit className="w-3 h-3 mr-1" />
                            Load
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(draft.id)}
                            className="h-9 w-9 text-error hover:bg-error/10"
                            title="Delete Draft"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
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
