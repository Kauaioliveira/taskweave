/**
 * Computes the new card id order after a drag ends within the same list.
 * @param orderedIds — current ids in display order (ascending `order` from the server)
 * @param activeCardId — id of the dragged card (without `card:` prefix)
 * @param overDndId — dnd-kit droppable/draggable id (`card:…` or `list:…`)
 * @param columnListId — list id for this column (must match `list:…` when dropping on the column)
 * @returns new order, or `null` if the drop does not imply a change or is invalid
 */
export function reorderCardIdsAfterDrop(
  orderedIds: string[],
  activeCardId: string,
  overDndId: string | number | undefined,
  columnListId: string,
): string[] | null {
  if (overDndId == null) return null;

  const fromIdx = orderedIds.indexOf(activeCardId);
  if (fromIdx === -1) return null;

  const over = String(overDndId);
  const next = [...orderedIds];
  next.splice(fromIdx, 1);

  if (over.startsWith("card:")) {
    const overCardId = over.slice("card:".length);
    if (overCardId === activeCardId) return null;
    const insertAt = next.indexOf(overCardId);
    if (insertAt === -1) return null;
    next.splice(insertAt, 0, activeCardId);
  } else if (over.startsWith("list:")) {
    const overListId = over.slice("list:".length);
    if (overListId !== columnListId) return null;
    next.push(activeCardId);
  } else {
    return null;
  }

  if (next.length !== orderedIds.length) return null;
  if (next.every((id, i) => id === orderedIds[i])) return null;
  return next;
}
