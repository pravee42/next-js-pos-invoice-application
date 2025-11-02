"use client";

const DRAFT_STORAGE_KEY = "billing-app-drafts";

export function saveDraft(draft) {
  try {
    const drafts = getDrafts();
    const draftData = {
      ...draft,
      id: draft.id || `draft-${Date.now()}`,
      updatedAt: new Date().toISOString(),
      createdAt: draft.createdAt || new Date().toISOString(),
    };
    
    // If draft with same ID exists, update it, otherwise add new
    const existingIndex = drafts.findIndex((d) => d.id === draftData.id);
    if (existingIndex >= 0) {
      drafts[existingIndex] = draftData;
    } else {
      drafts.push(draftData);
    }
    
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(drafts));
    return draftData;
  } catch (error) {
    console.error("Error saving draft:", error);
    return null;
  }
}

export function getDrafts() {
  try {
    const data = localStorage.getItem(DRAFT_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error reading drafts:", error);
    return [];
  }
}

export function getDraft(id) {
  try {
    const drafts = getDrafts();
    return drafts.find((d) => d.id === id) || null;
  } catch (error) {
    console.error("Error reading draft:", error);
    return null;
  }
}

export function deleteDraft(id) {
  try {
    const drafts = getDrafts();
    const filtered = drafts.filter((d) => d.id !== id);
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error("Error deleting draft:", error);
    return false;
  }
}

export function clearDrafts() {
  try {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    return true;
  } catch (error) {
    console.error("Error clearing drafts:", error);
    return false;
  }
}

