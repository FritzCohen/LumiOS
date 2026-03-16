import Button from "../../../../lib/Button";

interface NavigationProps {
  currentStep: number;
  totalSteps: number;
  goNext: () => void;
  goPrev: () => void;
  goToStep: (index: number) => void;
  skip: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  showStepIndicator?: boolean;
  nextButtonText: string;
  prevButtonText: string;
  skipButtonText: string;
  finishButtonText: string;
}

const Navigation: React.FC<NavigationProps> = ({
  currentStep,
  totalSteps,
  goNext,
  goPrev,
  goToStep,
  skip,
  isFirstStep,
  isLastStep,
  showStepIndicator = true,
  nextButtonText,
  prevButtonText,
  skipButtonText,
  finishButtonText,
}) => {
  return (
    <div className="relative flex items-center mt-4 w-full">
      {/* Skip button pinned right */}
      {!isLastStep && (
        <div className="absolute right-0">
          <Button onClick={skip}>{skipButtonText}</Button>
        </div>
      )}

      {/* Center group */}
      <div className="flex items-center gap-2 mx-auto">
        {showStepIndicator && (
          <div className="flex gap-1 mr-2">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <button
                key={index}
                onClick={() => goToStep(index)}
                className={`w-2 h-2 rounded-full ${
                  currentStep === index ? "bg-blue-500" : "bg-gray-300"
                }`}
                aria-label={`Go to step ${index + 1}`}
              />
            ))}
          </div>
        )}

        <Button
          onClick={goPrev}
          disabled={isFirstStep}
          className={isFirstStep ? "opacity-50 cursor-not-allowed" : ""}
        >
          {prevButtonText}
        </Button>

        <Button onClick={goNext}>
          {isLastStep ? finishButtonText : nextButtonText}
        </Button>
      </div>
    </div>
  );
};

export default Navigation;