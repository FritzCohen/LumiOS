import { images } from "../../../../../constants/constants";
import { useFirstStartProps } from "../useFirstStart";

const Background: React.FC<{ userPrefab: useFirstStartProps }> = ({
	userPrefab,
}) => {
	const handleImageClick = (index: number) => {
		userPrefab.setBackgroundIndex(index);
		userPrefab.updateField("backgroundImage", images[index]);
	};

	return (
		<div className="flex flex-wrap justify-center gap-4 mb-5 px-4">
			{images.map((image, index) => {
				const isActive = index === userPrefab.backgroundIndex;

				return (
					<img
						src={image}
						alt={`Background ${index}`}
						key={index}
						onClick={() => handleImageClick(index)}
						className={`w-32 h-20 object-cover rounded-lg cursor-pointer transition-all duration-200 ${
							userPrefab.backgroundIndex >= 0
								? isActive
									? "shadow-xl brightness-105"
									: "brightness-75"
								: ""
						}`}
					/>
				);
			})}
		</div>
	);
};

export default Background;
