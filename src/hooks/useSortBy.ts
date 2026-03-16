import { useMemo } from "react";

interface UseSortByProps<T> {
  items: T[];
  sortBy?: keyof T | ((a: T, b: T) => number) | "nothing";
  ascending?: boolean;
}

function useSortBy<T>({ items, sortBy, ascending = true }: UseSortByProps<T>): T[] {
  const sortedItems = useMemo(() => {
    if (!items || items.length === 0) return [];

    if (sortBy === "nothing" || sortBy == null) {
      return items; // No sorting
    }

    const sorted = [...items].sort((a, b) => {
      if (typeof sortBy === "function") {
        return sortBy(a, b);
      }

      const aValue = a[sortBy];
      const bValue = b[sortBy];

      if (aValue === bValue) return 0;
      if (aValue == null) return ascending ? -1 : 1;
      if (bValue == null) return ascending ? 1 : -1;

      if (typeof aValue === "number" && typeof bValue === "number") {
        return ascending ? aValue - bValue : bValue - aValue;
      }

      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();

      return ascending ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });

    return sorted;
  }, [items, sortBy, ascending]);

  return sortedItems;
}

export default useSortBy;