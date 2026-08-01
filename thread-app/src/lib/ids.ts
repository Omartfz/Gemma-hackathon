export function newDocId(): string {
  return `doc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function newEntryId(): string {
  return `entry_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}
