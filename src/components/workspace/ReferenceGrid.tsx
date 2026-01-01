'use client';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ReferenceImage } from '@/types';
import { ReferenceCard } from './ReferenceCard';

interface SortableReferenceProps {
  reference: ReferenceImage;
  index: number;
  onUpdate: (id: string, updates: { name?: string; description?: string }) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

function SortableReference({ reference, index, onUpdate, onDelete }: SortableReferenceProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: reference.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 0,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <ReferenceCard
        reference={reference}
        index={index}
        onUpdate={onUpdate}
        onDelete={onDelete}
        isDragging={isDragging}
        dragListeners={listeners}
      />
    </div>
  );
}

interface ReferenceGridProps {
  references: ReferenceImage[];
  onReorder: (references: ReferenceImage[]) => void;
  onUpdate: (id: string, updates: { name?: string; description?: string }) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

export function ReferenceGrid({
  references,
  onReorder,
  onUpdate,
  onDelete,
}: ReferenceGridProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = references.findIndex((r) => r.id === active.id);
      const newIndex = references.findIndex((r) => r.id === over.id);
      const newOrder = arrayMove(references, oldIndex, newIndex);
      onReorder(newOrder);
    }
  };

  if (references.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No reference images yet</p>
        <p className="text-sm">Upload images above to get started</p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={references.map((r) => r.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2">
          {references.map((reference, index) => (
            <SortableReference
              key={reference.id}
              reference={reference}
              index={index}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
