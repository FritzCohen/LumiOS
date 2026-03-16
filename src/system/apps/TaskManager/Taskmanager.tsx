import { useState, useMemo, useRef } from "react";
import { useKernel } from "../../../hooks/useKernal";
import "./taskManager.css";
import Input from "../../lib/Input";
import Button from "../../lib/Button";
import { useOutsideClick } from "../../../hooks/useOutsideClick";
import useSelection from "../../../hooks/Selection/useSelection";

const getLevel = (permission: number): string => {
	switch (permission) {
		case 1:
			return "Elevated";
		case 2:
			return "System";
		default:
			return "User";
	}
};

const TaskManager = () => {
	const [input, setInput] = useState("");
	const [task, setTask] = useState<"start" | "terminate">("start");

	const [baseSelected, setBaseSelected] = useState<string[]>([]);

	const { openedApps, openApp, closeApp } = useKernel();
	const containerRef = useRef<HTMLDivElement>(null);
	const footerRef = useRef<HTMLDivElement>(null);

	// Selection box hook
	const {
		selectedIds: dragSelectedIds,
		registerItem,
		selectionBoxStyle,
	} = useSelection(containerRef);

	// Effective selection = baseSelected ∪ dragSelected
	const effectiveSelected = useMemo(() => {
		const all = new Set([...baseSelected, ...Array.from(dragSelectedIds)]);
		return Array.from(all);
	}, [baseSelected, dragSelectedIds]);

	// Outside click clears selection
	useOutsideClick([containerRef, footerRef], ({ clickedRefIndex }) => {
		if (clickedRefIndex == 0) return;
		if (clickedRefIndex == 1) return;
		setBaseSelected([]);
	});

	// Filtering
	const filteredApps = useMemo(() => {
		if (!input.trim()) return openedApps;

		const query = input.toLowerCase();
		return openedApps.filter((app) => {
			const displayName = app.executable.config.displayName.toLowerCase();
			const appName = app.executable.config.name.toLowerCase();
			const pid = String(app.id).toLowerCase();

			return (
				appName.includes(query) ||
				displayName.includes(query) ||
				pid.includes(query)
			);
		});
	}, [openedApps, input]);

	// Click handling
	const handleRowClick = (
		e: React.MouseEvent<HTMLDivElement>,
		index: number,
		pid: string
	) => {
		if (e.shiftKey) {
			// range select within filtered apps
			const ids = filteredApps.map((a) => a.id);
			const last = baseSelected[baseSelected.length - 1];
			const lastIndex = last ? ids.indexOf(last) : index;

			const start = Math.min(lastIndex, index);
			const end = Math.max(lastIndex, index);

			setBaseSelected(ids.slice(start, end + 1));
		} else if (e.ctrlKey || e.metaKey) {
			// toggle
			setBaseSelected((prev) =>
				prev.includes(pid)
					? prev.filter((id) => id !== pid)
					: [...prev, pid]
			);
		} else {
			// single select
			setBaseSelected([pid]);
		}
	};

    const handleExecute = () => {
        const selectedApps = openedApps.filter(app =>
            effectiveSelected.includes(app.id)
        );

        // Partition apps into normal and taskmanager
        const normalApps = selectedApps.filter(
            app => !app.executable.config.name.toLowerCase().includes("taskmanager")
        );
        const taskManagerApps = selectedApps.filter(app =>
            app.executable.config.name.toLowerCase().includes("taskmanager")
        );

        // Run normal apps first, then taskmanager
        [...normalApps, ...taskManagerApps].forEach(app => {
            if (task === "start") {
                openApp(app.executable);
            } else {
                closeApp(app.id);
            }
        });
    };

	// Clear when clicking blank space inside the container
	const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
		// prevent clearing if you actually clicked on a row (task-div has its own handler)
		if (e.target === containerRef.current) {
			setBaseSelected([]);
		}
	};

	return (
		<div className="w-full h-full flex flex-col p-2 relative">
			{/* Header */}
			<div className="task-div header">
				<span>Name</span>
				<span>Admin</span>
				<span>Version</span>
				<span>Description</span>
				<span>PID</span>
			</div>
            <hr />

			{/* Scrollable list */}
			<div
				className="flex-1 overflow-auto space-y-1 relative"
				ref={containerRef}
				onClick={handleBackgroundClick} // <-- add this
			>
				{filteredApps.map((app, index) => {
					const isSelected = effectiveSelected.includes(app.id);
					return (
						<div
							className={`task-div ${isSelected ? "active" : ""}`}
							key={app.id}
							onClick={(e) => handleRowClick(e, index, app.id)}
							ref={(el) => registerItem(app.id, el)}
						>
							<span>{app.executable.config.displayName}</span>
							<span>
								{getLevel(app.executable.config.permissions)}
							</span>
							<span>
								{app.executable.config?.version || "N/A"}
							</span>
							<span className="truncate">
								{app.executable.config?.description || "N/A"}
							</span>
							<span>{app.id}</span>
						</div>
					);
				})}

				{/* drag-box overlay */}
				{selectionBoxStyle && (
					<div
						className="absolute border-2 border-blue-400 bg-blue-200 bg-opacity-25 pointer-events-none"
						style={selectionBoxStyle}
					/>
				)}
			</div>

			{/* Footer */}
			<div className="task-footer" ref={footerRef}>
				<Input
					placeholder="Enter PID or name..."
					className="flex-[3]"
					onChange={(e) => setInput(e.target.value)}
				/>
				<select
					className="select-task flex-[1] min-w-[110px]"
					onChange={(e) =>
						setTask(e.target.value as "start" | "terminate")
					}
				>
					<option value="start">Start</option>
					<option value="terminate">Terminate</option>
				</select>
				<Button
					onClick={handleExecute}
					className="flex-[1] min-w-[100px]"
				>
					Execute
				</Button>
			</div>
		</div>
	);
};

export default TaskManager;
