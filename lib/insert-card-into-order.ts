/**
 * Builds the target list's card id order after moving `cardId` from another list.
 * @param targetOrderedIds — current ids in `toListId` (ascending `order`), must not include `cardId`
 * @param beforeCardId — insert before this id; `null` appends at the end
 */
export function insertCardIntoTargetOrder(
  targetOrderedIds: string[],
  cardId: string,
  beforeCardId: string | null,
): string[] {
  if (targetOrderedIds.includes(cardId)) {
    throw new Error("Card already in target list");
  }
  if (beforeCardId == null || beforeCardId === "") {
    return [...targetOrderedIds, cardId];
  }
  const insertAt = targetOrderedIds.indexOf(beforeCardId);
  if (insertAt === -1) {
    throw new Error("Invalid target position");
  }
  return [...targetOrderedIds.slice(0, insertAt), cardId, ...targetOrderedIds.slice(insertAt)];
}
