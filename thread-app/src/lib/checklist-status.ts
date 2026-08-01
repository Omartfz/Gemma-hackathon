import { ZONE1_REQUIRED_DOCS } from "./checklist-zone1";
import type { AppState, LibraryDoc, RequiredDocItem } from "./types";

export type RequiredDocStatus = RequiredDocItem & {
  have: boolean;
  matchingDoc?: LibraryDoc;
};

export function isDocSatisfying(
  doc: LibraryDoc,
  item: RequiredDocItem,
): boolean {
  if (doc.checklist_item_id === item.id) return true;
  return false;
}

/** Zone 1 required docs with Have/Missing from store documents. */
export function getRequiredDocStatuses(state: AppState): RequiredDocStatus[] {
  return ZONE1_REQUIRED_DOCS.map((item) => {
    const matchingDoc = state.documents.find((d) => isDocSatisfying(d, item));
    return {
      ...item,
      have: Boolean(matchingDoc),
      matchingDoc,
    };
  });
}
