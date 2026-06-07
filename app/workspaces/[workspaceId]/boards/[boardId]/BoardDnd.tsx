"use client";

import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";
import { createCard, moveCardToList } from "@/app/actions/board";

export type BoardDndList = {
  id: string;
  name: string;
  cards: { id: string; title: string; description: string | null }[];
};

function resolveTargetListId(overId: string | number | undefined, lists: BoardDndList[]): string | null {
  if (overId == null) return null;
  const s = String(overId);
  if (s.startsWith("list:")) return s.slice("list:".length);
  if (s.startsWith("card:")) {
    const cardId = s.slice("card:".length);
    for (const list of lists) {
      if (list.cards.some((c) => c.id === cardId)) return list.id;
    }
  }
  return null;
}

function DroppableColumn({
  list,
  children,
}: {
  list: BoardDndList;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `list:${list.id}`,
  });

  return (
    <div
      ref={setNodeRef}
      className={`w-72 shrink-0 rounded-xl border bg-slate-950/60 ${
        isOver ? "border-sky-600 ring-1 ring-sky-600/40" : "border-slate-800"
      }`}
    >
      {children}
    </div>
  );
}

function DraggableCard({
  card,
  listId,
  canDrag,
  children,
}: {
  card: BoardDndList["cards"][number];
  listId: string;
  canDrag: boolean;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `card:${card.id}`,
    data: { listId },
    disabled: !canDrag,
  });

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
        zIndex: isDragging ? 20 : undefined,
        opacity: isDragging ? 0.85 : undefined,
      }
    : undefined;

  return (
    <div ref={setNodeRef} style={style} className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
      {canDrag ? (
        <div
          className="mb-2 cursor-grab touch-none rounded border border-slate-700/80 bg-slate-950/50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500 active:cursor-grabbing"
          {...listeners}
          {...attributes}
        >
          Drag: mouse or Space / arrows / Space
        </div>
      ) : null}
      {children}
    </div>
  );
}

export function BoardDnd({ lists }: { lists: BoardDndList[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const liveId = useId();
  const [dndError, setDndError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragStart() {
    setDndError(null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    const activeId = String(active.id);
    if (!activeId.startsWith("card:")) return;
    const cardId = activeId.slice("card:".length);
    const fromListId = active.data.current?.listId as string | undefined;
    const toListId = resolveTargetListId(over?.id, lists);
    if (!fromListId || !toListId || fromListId === toListId) return;

    startTransition(() => {
      void (async () => {
        try {
          await moveCardToList(cardId, toListId);
          router.refresh();
        } catch (e) {
          console.error("[board] moveCardToList failed:", e);
          const msg = e instanceof Error ? e.message : "Could not move card. Try again.";
          setDndError(msg);
        }
      })();
    });
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {dndError ? (
        <div
          className="mb-4 rounded-md border border-rose-900/60 bg-rose-950/40 px-3 py-2 text-sm text-rose-100"
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          id={liveId}
        >
          <p className="font-medium">Move failed</p>
          <p className="mt-1 text-xs text-rose-200/90">{dndError}</p>
          <button
            type="button"
            className="mt-2 text-xs font-semibold text-sky-300 underline hover:text-sky-200"
            onClick={() => setDndError(null)}
          >
            Dismiss
          </button>
        </div>
      ) : (
        <div id={liveId} className="sr-only" aria-live="polite" />
      )}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {lists.map((list) => (
          <DroppableColumn key={list.id} list={list}>
            <div className="border-b border-slate-800 px-3 py-2">
              <h2 className="text-sm font-semibold text-slate-100">{list.name}</h2>
            </div>
            <div className="space-y-2 px-3 py-3">
              {list.cards.map((card) => (
                <DraggableCard key={card.id} card={card} listId={list.id} canDrag>
                  <p className="text-sm font-medium text-slate-100">{card.title}</p>
                  {card.description ? <p className="mt-1 text-xs text-slate-400">{card.description}</p> : null}
                </DraggableCard>
              ))}

              <form action={createCard} className="space-y-2 rounded-lg border border-dashed border-slate-700 p-2">
                <input type="hidden" name="listId" value={list.id} readOnly />
                <input
                  name="title"
                  placeholder="Card title"
                  className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-white"
                  required
                />
                <button
                  type="submit"
                  className="w-full rounded-md bg-slate-800 px-2 py-1 text-xs text-slate-100 hover:bg-slate-700"
                >
                  Add card
                </button>
              </form>
            </div>
          </DroppableColumn>
        ))}
      </div>
    </DndContext>
  );
}
