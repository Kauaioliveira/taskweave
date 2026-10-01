type ListWithCards<C extends { id: string }> = { id: string; cards: C[] };

/**
 * Returns a copy of `lists` where each list named in `orders` holds exactly the cards
 * listed there, in that order (cards may come from any list). Used for optimistic DnD updates.
 */
export function applyCardOrder<C extends { id: string }, L extends ListWithCards<C>>(
  lists: L[],
  orders: Record<string, string[]>,
): L[] {
  const byId = new Map<string, C>();
  for (const list of lists) {
    for (const card of list.cards) byId.set(card.id, card);
  }
  const moved = new Set(Object.values(orders).flat());

  return lists.map((list) => {
    const order = orders[list.id];
    if (order) {
      return { ...list, cards: order.map((id) => byId.get(id)).filter((c): c is C => c != null) };
    }
    if (list.cards.some((c) => moved.has(c.id))) {
      return { ...list, cards: list.cards.filter((c) => !moved.has(c.id)) };
    }
    return list;
  });
}
