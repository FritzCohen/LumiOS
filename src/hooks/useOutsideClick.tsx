import { useEffect, RefObject } from "react";

type OutsideClickHandler = (info: {
	clickedRefIndex: number | null;
	target: EventTarget | null;
}) => void;

type RefOrId = RefObject<HTMLElement> | string;

/**
 * Listen for clicks outside of multiple refs or element IDs, and tell which one was clicked or missed.
 */
export function useOutsideClick(
	refs: RefOrId[],
	handler: OutsideClickHandler,
) {
	useEffect(() => {
		const listener = (event: MouseEvent) => {
			const target = event.target as Node;
			let clickedRefIndex: number | null = null;

			refs.forEach((refOrId, index) => {
				let el: HTMLElement | null = null;

				if (typeof refOrId === "string") {
					el = document.getElementById(refOrId);
				} else {
					el = refOrId.current;
				}

				if (el?.contains(target)) {
					clickedRefIndex = index;
				}
			});

			handler({ clickedRefIndex, target: event.target });
		};

		document.addEventListener("mousedown", listener);
		return () => {
			document.removeEventListener("mousedown", listener);
		};
	}, [refs, handler]);
}
