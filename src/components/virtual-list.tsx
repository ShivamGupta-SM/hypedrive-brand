/**
 * VirtualList - Wrapper for @tanstack/react-virtual
 * Provides efficient rendering of large lists with virtualization
 */

import { useRef, type ReactNode } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import clsx from "clsx";

// =============================================================================
// VIRTUAL LIST
// =============================================================================

export interface VirtualListProps<T> {
  /** Items to render */
  items: T[];
  /** Render function for each item */
  renderItem: (item: T, index: number) => ReactNode;
  /** Estimated item height in pixels */
  estimateSize?: number;
  /** Height of the container (CSS value) */
  height?: string | number;
  /** Container class name */
  className?: string;
  /** Item wrapper class name */
  itemClassName?: string;
  /** Gap between items in pixels */
  gap?: number;
  /** Overscan count (items to render outside visible area) */
  overscan?: number;
  /** Horizontal scrolling */
  horizontal?: boolean;
  /** Get unique key for item */
  getItemKey?: (item: T, index: number) => string | number;
  /** Custom scroll element */
  scrollElement?: HTMLElement | null;
}

export function VirtualList<T>({
  items,
  renderItem,
  estimateSize = 50,
  height = 400,
  className,
  itemClassName,
  gap = 0,
  overscan = 5,
  horizontal = false,
  getItemKey,
  scrollElement,
}: VirtualListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scrollElement ?? parentRef.current,
    estimateSize: () => estimateSize,
    overscan,
    horizontal,
    gap,
    getItemKey: getItemKey
      ? (index) => getItemKey(items[index], index)
      : undefined,
  });

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <div
      ref={parentRef}
      className={clsx("overflow-auto", className)}
      style={{ height: typeof height === "number" ? `${height}px` : height }}
    >
      <div
        style={{
          height: horizontal ? "100%" : `${virtualizer.getTotalSize()}px`,
          width: horizontal ? `${virtualizer.getTotalSize()}px` : "100%",
          position: "relative",
        }}
      >
        {virtualItems.map((virtualItem) => (
          <div
            key={virtualItem.key}
            className={itemClassName}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: horizontal ? undefined : "100%",
              height: horizontal ? "100%" : `${virtualItem.size}px`,
              transform: horizontal
                ? `translateX(${virtualItem.start}px)`
                : `translateY(${virtualItem.start}px)`,
            }}
          >
            {renderItem(items[virtualItem.index], virtualItem.index)}
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// VIRTUAL GRID
// =============================================================================

export interface VirtualGridProps<T> {
  /** Items to render */
  items: T[];
  /** Render function for each item */
  renderItem: (item: T, index: number) => ReactNode;
  /** Number of columns */
  columns: number;
  /** Height of each row in pixels */
  rowHeight: number;
  /** Height of the container (CSS value) */
  height?: string | number;
  /** Container class name */
  className?: string;
  /** Item wrapper class name */
  itemClassName?: string;
  /** Gap between items in pixels */
  gap?: number;
  /** Overscan count */
  overscan?: number;
  /** Get unique key for item */
  getItemKey?: (item: T, index: number) => string | number;
}

export function VirtualGrid<T>({
  items,
  renderItem,
  columns,
  rowHeight,
  height = 400,
  className,
  itemClassName,
  gap = 0,
  overscan = 5,
  getItemKey,
}: VirtualGridProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);
  const rowCount = Math.ceil(items.length / columns);

  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight + gap,
    overscan,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();

  return (
    <div
      ref={parentRef}
      className={clsx("overflow-auto", className)}
      style={{ height: typeof height === "number" ? `${height}px` : height }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualRows.map((virtualRow) => {
          const startIndex = virtualRow.index * columns;
          const rowItems = items.slice(startIndex, startIndex + columns);

          return (
            <div
              key={virtualRow.key}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${rowHeight}px`,
                transform: `translateY(${virtualRow.start}px)`,
                display: "grid",
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
                gap: `${gap}px`,
              }}
            >
              {rowItems.map((item, colIndex) => {
                const itemIndex = startIndex + colIndex;
                return (
                  <div
                    key={
                      getItemKey
                        ? getItemKey(item, itemIndex)
                        : itemIndex
                    }
                    className={itemClassName}
                  >
                    {renderItem(item, itemIndex)}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =============================================================================
// VIRTUAL TABLE
// =============================================================================

export interface VirtualTableColumn<T> {
  key: string;
  header: ReactNode;
  width?: number | string;
  render: (item: T, index: number) => ReactNode;
  headerClassName?: string;
  cellClassName?: string;
}

export interface VirtualTableProps<T> {
  /** Items to render */
  items: T[];
  /** Column definitions */
  columns: VirtualTableColumn<T>[];
  /** Height of each row in pixels */
  rowHeight?: number;
  /** Height of header in pixels */
  headerHeight?: number;
  /** Height of the container (CSS value) */
  height?: string | number;
  /** Container class name */
  className?: string;
  /** Row class name or function */
  rowClassName?: string | ((item: T, index: number) => string);
  /** Overscan count */
  overscan?: number;
  /** Get unique key for item */
  getItemKey?: (item: T, index: number) => string | number;
  /** Row click handler */
  onRowClick?: (item: T, index: number) => void;
}

export function VirtualTable<T>({
  items,
  columns,
  rowHeight = 48,
  headerHeight = 48,
  height = 400,
  className,
  rowClassName,
  overscan = 10,
  getItemKey,
  onRowClick,
}: VirtualTableProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan,
    getItemKey: getItemKey
      ? (index) => getItemKey(items[index], index)
      : undefined,
  });

  const virtualItems = virtualizer.getVirtualItems();

  const getRowClassName = (item: T, index: number) => {
    if (typeof rowClassName === "function") {
      return rowClassName(item, index);
    }
    return rowClassName;
  };

  return (
    <div className={clsx("overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700", className)}>
      {/* Header */}
      <div
        className="flex border-b border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/50"
        style={{ height: `${headerHeight}px` }}
      >
        {columns.map((column) => (
          <div
            key={column.key}
            className={clsx(
              "flex items-center px-4 text-sm font-medium text-zinc-600 dark:text-zinc-400",
              column.headerClassName
            )}
            style={{ width: column.width, flex: column.width ? undefined : 1 }}
          >
            {column.header}
          </div>
        ))}
      </div>

      {/* Body */}
      <div
        ref={parentRef}
        className="overflow-auto"
        style={{
          height:
            typeof height === "number"
              ? `${height - headerHeight}px`
              : `calc(${height} - ${headerHeight}px)`,
        }}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {virtualItems.map((virtualItem) => {
            const item = items[virtualItem.index];
            return (
              <div
                key={virtualItem.key}
                role={onRowClick ? "button" : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                className={clsx(
                  "absolute left-0 top-0 flex w-full border-b border-zinc-100 dark:border-zinc-800",
                  onRowClick && "cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50",
                  getRowClassName(item, virtualItem.index)
                )}
                style={{
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
                onClick={() => onRowClick?.(item, virtualItem.index)}
                onKeyDown={(e) => {
                  if (onRowClick && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    onRowClick(item, virtualItem.index);
                  }
                }}
              >
                {columns.map((column) => (
                  <div
                    key={column.key}
                    className={clsx(
                      "flex items-center px-4 text-sm text-zinc-900 dark:text-zinc-100",
                      column.cellClassName
                    )}
                    style={{ width: column.width, flex: column.width ? undefined : 1 }}
                  >
                    {column.render(item, virtualItem.index)}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// INFINITE SCROLL HELPER
// =============================================================================

export interface UseInfiniteScrollOptions {
  /** Load more callback */
  onLoadMore: () => void | Promise<void>;
  /** Whether there are more items to load */
  hasMore: boolean;
  /** Whether currently loading */
  isLoading: boolean;
  /** Threshold in pixels before end to trigger load */
  threshold?: number;
}

export function useInfiniteScroll({
  onLoadMore,
  hasMore,
  isLoading,
  threshold = 200,
}: UseInfiniteScrollOptions) {
  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    if (distanceFromBottom < threshold && hasMore && !isLoading) {
      onLoadMore();
    }
  };

  return { onScroll: handleScroll };
}

// Re-export for advanced usage
export { useVirtualizer } from "@tanstack/react-virtual";
