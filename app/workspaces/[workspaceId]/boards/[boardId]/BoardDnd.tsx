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
import {
  createCard,
  createList,
  deleteCard,
  deleteList,
  moveCardToList,
  renameList,
  reorderCardsInList,
  updateCard,
} from "@/app/actions/board";
import { SubmitButton } from "@/components/SubmitButton";
import { applyCardOrder } from "@/lib/apply-card-order";
import { isoToDatetimeLocalValue } from "@/lib/datetime-local";
import { getDueStatus, type DueStatus } from "@/lib/due-status";
import { insertCardIntoTargetOrder } from "@/lib/insert-card-into-order";
import { reorderCardIdsAfterDrop } from "@/lib/reorder-card-ids";

export type BoardDndList = {
  id: string;
  name: string;
  cards: { id: string; title: string; description: string | null; dueAt: Date | string | null }[];
};

type BoardCard = BoardDndList["cards"][number];

const fieldClass =
  "mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-white placeholder:text-slate-500 focus:border-sky-600";
const fieldLabelClass = "block text-[11px] font-medium text-slate-400";

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

const dueTone: Record<DueStatus, string> = {
  overdue: "border-rose-800/70 bg-rose-950/50 text-rose-200",
  soon: "border-amber-800/70 bg-amber-950/40 text-amber-200",
  later: "border-slate-700 bg-slate-900/60 text-slate-300",
};

const dueLabel: Record<DueStatus, string> = {
  overdue: "Overdue",
  soon: "Due soon",
  later: "Due",
};

function DueBadge({ dueAt }: { dueAt: BoardCard["dueAt"] }) {
  const status = getDueStatus(dueAt);
  if (!status || dueAt == null) return null;
  const date = new Date(dueAt);
  return (
    <p className={`mt-2 inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-medium ${dueTone[status]}`}>
      <span>{dueLabel[status]}</span>
      <time dateTime={date.toISOString()} suppressHydrationWarning>
        {date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
      </time>
    </p>
  );
}

function GripIcon() {
  return (
    <svg aria-hidden viewBox="0 0 16 16" className="h-4 w-4 fill-current">
      <circle cx="5.5" cy="3.5" r="1.25" />
      <circle cx="10.5" cy="3.5" r="1.25" />
      <circle cx="5.5" cy="8" r="1.25" />
      <circle cx="10.5" cy="8" r="1.25" />
      <circle cx="5.5" cy="12.5" r="1.25" />
      <circle cx="10.5" cy="12.5" r="1.25" />
    </svg>
  );
}

function DroppableColumn({ list, children }: { list: BoardDndList; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `list:${list.id}`,
  });

  return (
    <section
      ref={setNodeRef}
      aria-label={list.name}
      className={`flex max-h-[calc(100vh-220px)] w-72 shrink-0 flex-col rounded-xl border bg-slate-950/60 transition ${
        isOver ? "border-sky-600 ring-1 ring-sky-600/40" : "border-slate-800"
      }`}
    >
      {children}
    </section>
  );
}

function DraggableCard({
  card,
  listId,
  canDrag,
  children,
}: {
  card: BoardCard;
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
      }
    : undefined;

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`group relative rounded-lg border bg-slate-900/80 p-3 transition ${
        isDragging ? "border-sky-600 shadow-lg shadow-black/40" : "border-slate-800 hover:border-slate-700"
      }`}
    >
      {canDrag ? (
        <button
          type="button"
          aria-label={`Move card: ${card.title}`}
          title="Drag to move (or focus and press Space, then arrow keys)"
          className="absolute right-1.5 top-1.5 cursor-grab touch-none rounded p-1 text-slate-500 hover:bg-slate-800 hover:text-slate-200 active:cursor-grabbing"
          {...listeners}
          {...attributes}
        >
          <GripIcon />
        </button>
      ) : null}
      {children}
    </article>
  );
}

function CardBody({ card, withHandle }: { card: BoardCard; withHandle: boolean }) {
  return (
    <>
      <p className={`break-words text-sm font-medium text-slate-100 ${withHandle ? "pr-7" : ""}`}>{card.title}</p>
      {card.description ? (
        <p className="mt-1 line-clamp-3 whitespace-pre-line break-words text-xs text-slate-400">{card.description}</p>
      ) : null}
      <DueBadge dueAt={card.dueAt} />
    </>
  );
}

function ListHeader({ list, canEdit }: { list: BoardDndList; canEdit: boolean }) {
  const cardWord = list.cards.length === 1 ? "card" : "cards";
  return (
    <div className="flex items-center justify-between gap-2 border-b border-slate-800 px-3 py-2">
      <h2 className="flex min-w-0 items-center gap-2 text-sm font-semibold text-slate-100">
        <span className="truncate">{list.name}</span>
        <span
          className="rounded-full bg-slate-800 px-1.5 py-0.5 text-[11px] font-medium text-slate-300"
          aria-label={`${list.cards.length} ${cardWord}`}
        >
          {list.cards.length}
        </span>
      </h2>
      {canEdit ? (
        <details className="relative">
          <summary
            aria-label={`List options: ${list.name}`}
            className="cursor-pointer select-none rounded px-1.5 text-lg leading-none text-slate-400 hover:bg-slate-800 hover:text-slate-100"
          >
            ⋯
          </summary>
          <div className="absolute right-0 z-20 mt-1 w-56 space-y-3 rounded-lg border border-slate-800 bg-slate-950 p-3 shadow-xl shadow-black/40">
            <form action={renameList} className="space-y-2">
              <input type="hidden" name="listId" value={list.id} readOnly />
              <label className={fieldLabelClass}>
                List name
                <input name="name" defaultValue={list.name} maxLength={60} required className={fieldClass} />
              </label>
              <SubmitButton
                className="w-full rounded-md bg-slate-800 px-2 py-1.5 text-xs font-semibold text-slate-100 hover:bg-slate-700"
                pendingLabel="Saving…"
              >
                Rename list
              </SubmitButton>
            </form>
            <form action={deleteList} className="border-t border-slate-800 pt-3">
              <input type="hidden" name="listId" value={list.id} readOnly />
              <SubmitButton
                className="w-full rounded-md border border-rose-900/50 bg-rose-950/30 px-2 py-1.5 text-xs font-semibold text-rose-200 hover:bg-rose-950/50"
                pendingLabel="Deleting…"
                confirmMessage={
                  list.cards.length > 0
                    ? `Delete list "${list.name}" and its ${list.cards.length} ${cardWord}? This cannot be undone.`
                    : `Delete list "${list.name}"?`
                }
              >
                Delete list
              </SubmitButton>
            </form>
          </div>
        </details>
      ) : null}
    </div>
  );
}

export function BoardDnd({ boardId, lists, canEdit }: { boardId: string; lists: BoardDndList[]; canEdit: boolean }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const liveId = useId();
  const [dndError, setDndError] = useState<string | null>(null);
  // Optimistic card order after a drop; ignored as soon as the server sends new `lists`.
  const [optimistic, setOptimistic] = useState<{ base: BoardDndList[]; lists: BoardDndList[] } | null>(null);
  const view = optimistic && optimistic.base === lists ? optimistic.lists : lists;

  function runAction(action: () => Promise<void>, fallbackMessage: string, logLabel: string) {
    startTransition(() => {
      void (async () => {
        try {
          await action();
          setDndError(null);
          router.refresh();
        } catch (err) {
          console.error(`[board] ${logLabel} failed:`, err);
          setOptimistic(null);
          setDndError(err instanceof Error ? err.message : fallbackMessage);
        }
      })();
    });
  }

  function handleUpdateCardSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const dueVal = fd.get("dueAt");
    if (typeof dueVal === "string" && dueVal.trim()) {
      const inst = new Date(dueVal);
      if (!Number.isNaN(inst.getTime())) {
        fd.set("dueAt", inst.toISOString());
      }
    } else {
      fd.set("dueAt", "");
    }
    form.closest("details")?.removeAttribute("open");

    runAction(() => updateCard(fd), "Could not save card. Try again.", "updateCard");
  }

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
    const toListId = resolveTargetListId(over?.id, view);
    if (!fromListId || !toListId) return;

    if (fromListId === toListId) {
      const list = view.find((l) => l.id === fromListId);
      if (!list) return;
      const orderedIds = list.cards.map((c) => c.id);
      const newIds = reorderCardIdsAfterDrop(orderedIds, cardId, over?.id, fromListId);
      if (!newIds) return;

      setOptimistic({ base: lists, lists: applyCardOrder(view, { [fromListId]: newIds }) });
      runAction(() => reorderCardsInList(fromListId, newIds), "Could not move card. Try again.", "reorderCardsInList");
      return;
    }

    const overStr = over?.id != null ? String(over.id) : "";
    let beforeCardId: string | null = null;
    if (overStr.startsWith("card:")) {
      beforeCardId = overStr.slice("card:".length);
    }

    const target = view.find((l) => l.id === toListId);
    if (target) {
      const targetIds = target.cards.map((c) => c.id);
      setOptimistic({
        base: lists,
        lists: applyCardOrder(view, { [toListId]: insertCardIntoTargetOrder(targetIds, cardId, beforeCardId) }),
      });
    }
    runAction(() => moveCardToList(cardId, toListId, beforeCardId), "Could not move card. Try again.", "moveCardToList");
  }

  return (
    <DndContext sensors={sensors} collisionDetection={pointerWithin} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      {dndError ? (
        <div
          className="mb-4 flex items-start justify-between gap-4 rounded-md border border-rose-900/60 bg-rose-950/40 px-3 py-2 text-sm text-rose-100"
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          id={liveId}
        >
          <div>
            <p className="font-medium">Action failed</p>
            <p className="mt-1 text-xs text-rose-200/90">{dndError}</p>
          </div>
          <button
            type="button"
            className="text-xs font-semibold text-sky-300 underline hover:text-sky-200"
            onClick={() => setDndError(null)}
          >
            Dismiss
          </button>
        </div>
      ) : (
        <div id={liveId} className="sr-only" aria-live="polite" />
      )}

      {view.length === 0 && !canEdit ? (
        <p className="rounded-xl border border-dashed border-slate-700 p-8 text-center text-sm text-slate-400">
          This board has no lists yet.
        </p>
      ) : null}

      <div className="board-scroll flex items-start gap-4 overflow-x-auto pb-4">
        {view.map((list) => (
          <DroppableColumn key={list.id} list={list}>
            <ListHeader list={list} canEdit={canEdit} />
            <div className="flex-1 space-y-2 overflow-y-auto px-3 py-3">
              {list.cards.length === 0 ? (
                <p className="rounded-lg border border-dashed border-slate-800 px-3 py-4 text-center text-xs text-slate-500">
                  {canEdit ? "No cards yet. Drop one here or add below." : "No cards."}
                </p>
              ) : null}

              {list.cards.map((card) => (
                <DraggableCard key={card.id} card={card} listId={list.id} canDrag={canEdit}>
                  <CardBody card={card} withHandle={canEdit} />
                  {canEdit ? (
                    <details className="mt-2">
                      <summary className="cursor-pointer select-none text-xs font-semibold text-slate-500 hover:text-sky-300 group-hover:text-sky-400">
                        Edit card
                      </summary>
                      <form className="mt-2 space-y-2 border-t border-slate-800 pt-2" onSubmit={handleUpdateCardSubmit}>
                        <input type="hidden" name="cardId" value={card.id} readOnly />
                        <label className={fieldLabelClass}>
                          Title
                          <input name="title" required maxLength={200} defaultValue={card.title} className={fieldClass} />
                        </label>
                        <label className={fieldLabelClass}>
                          Description
                          <textarea
                            name="description"
                            rows={3}
                            defaultValue={card.description ?? ""}
                            className={`${fieldClass} resize-y`}
                          />
                        </label>
                        <label className={fieldLabelClass}>
                          Due (optional)
                          <input
                            type="datetime-local"
                            name="dueAt"
                            defaultValue={isoToDatetimeLocalValue(card.dueAt)}
                            className={fieldClass}
                          />
                        </label>
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            className="flex-1 rounded-md bg-sky-500 px-2 py-1.5 text-xs font-semibold text-slate-950 hover:bg-sky-400"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            className="rounded-md border border-rose-900/50 bg-rose-950/30 px-2 py-1.5 text-xs font-semibold text-rose-200 hover:bg-rose-950/50"
                            onClick={() => {
                              if (!window.confirm(`Delete card "${card.title}" permanently?`)) return;
                              runAction(() => deleteCard(card.id), "Could not delete card. Try again.", "deleteCard");
                            }}
                          >
                            Delete card
                          </button>
                        </div>
                      </form>
                    </details>
                  ) : null}
                </DraggableCard>
              ))}
            </div>

            {canEdit ? (
              <form action={createCard} className="flex gap-2 border-t border-slate-800 p-3">
                <input type="hidden" name="listId" value={list.id} readOnly />
                <input
                  name="title"
                  aria-label={`New card title in ${list.name}`}
                  placeholder="Card title"
                  maxLength={200}
                  className="min-w-0 flex-1 rounded-md border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-white placeholder:text-slate-500 focus:border-sky-600"
                  required
                />
                <SubmitButton
                  className="rounded-md bg-slate-800 px-2.5 py-1.5 text-xs font-semibold text-slate-100 hover:bg-slate-700 disabled:opacity-60"
                  pendingLabel="Adding…"
                >
                  Add card
                </SubmitButton>
              </form>
            ) : null}
          </DroppableColumn>
        ))}

        {canEdit ? (
          <form
            action={createList}
            className="w-72 shrink-0 space-y-2 rounded-xl border border-dashed border-slate-700 bg-slate-950/30 p-3"
          >
            <input type="hidden" name="boardId" value={boardId} readOnly />
            <input
              name="name"
              aria-label="New list name"
              placeholder="New list"
              maxLength={60}
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm text-white placeholder:text-slate-500 focus:border-sky-600"
              required
            />
            <SubmitButton
              className="w-full rounded-md bg-slate-100 px-2 py-1.5 text-sm font-semibold text-slate-900 hover:bg-white disabled:opacity-60"
              pendingLabel="Adding…"
            >
              Add list
            </SubmitButton>
          </form>
        ) : null}
      </div>
    </DndContext>
  );
}
