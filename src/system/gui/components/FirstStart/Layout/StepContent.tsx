import { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface StepContentProps {
	id: string | number;
	title?: string;
	image?: string | ReactNode;
	content: ReactNode;
	imageClasses: string;
	contentClasses: string;
}

const StepContent: React.FC<StepContentProps> = ({
	id,
	title,
	image,
	content,
	imageClasses,
	contentClasses,
}) => {
	return (
		<>
			{/* Image */}
			<div
				className={`flex-shrink-0 flex justify-center items-center p-4 ${imageClasses}`}
			>
				<div className="w-full h-0 pb-[100%] relative">
					{" "}
					{/* maintains a square aspect ratio */}
					<AnimatePresence mode="wait">
						<motion.img
							key={`${id}-image`}
							src={typeof image === "string" ? image : undefined}
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.4 }}
							className="absolute top-0 left-0 w-full h-full object-contain"
							alt={title || "Step image"}
						/>
						{/* If image is a ReactNode */}
						{typeof image !== "string" && (
							<motion.div
								key={`${id}-custom-image`}
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.4 }}
								className="absolute top-0 left-0 w-full h-full flex justify-center items-center"
							>
								{image}
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</div>

			{/* Content */}
			<div
				className={`flex flex-col p-4 h-full w-full ${contentClasses}`}
			>
				<AnimatePresence mode="wait">
					<motion.div
						key={`${id}-content`}
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.4 }}
						className="overflow-y-auto flex flex-col gap-4 w-full h-full justify-center"
					>
						{title && (
							<h2 className="text-2xl font-bold text-center">
								{title}
							</h2>
						)}
						<div className="w-full flex justify-center">
							{content}
						</div>
					</motion.div>
				</AnimatePresence>
			</div>
		</>
	);
};

export default StepContent;
