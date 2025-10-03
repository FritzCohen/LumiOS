import { ReactNode } from "react";
import StepContent from "./Layout/StepContent";
import Navigation from "./Layout/Navigation";

interface Step {
  id: string | number;
  title?: string;
  image?: string | ReactNode;
  content: ReactNode;
}

interface StartMenuProps {
  steps: Step[];
  initialStep?: number;
  className?: string;
  layout?: "image-left" | "image-right" | "image-top" | "image-bottom";
  showStepIndicator?: boolean;
  showNavigation?: boolean;
  nextButtonText?: string;
  prevButtonText?: string;
  skipButtonText?: string;
  finishButtonText?: string;
  onStepChange?: (stepIndex: number) => void;
  onFinish?: () => void;
  onSkip: () => void;
  setCurrentStep: (prev: number) => void;
}

const StartMenu: React.FC<StartMenuProps> = ({
  steps,
  initialStep: currentStep = 0,
  className = "",
  layout = "image-left",
  showStepIndicator = true,
  showNavigation = true,
  nextButtonText = "Next",
  prevButtonText = "Back",
  skipButtonText = "Skip",
  finishButtonText = "Finish",
  onStepChange,
  onFinish,
  onSkip,
  setCurrentStep,
}) => {
  const goNext = () => {
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      onStepChange?.(nextStep);
    } else {
      onFinish?.();
    }
  };

  const goPrev = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      onStepChange?.(prevStep);
    }
  };

  const goToStep = (index: number) => {
    if (index >= 0 && index < steps.length) {
      setCurrentStep(index);
      onStepChange?.(index);
    }
  };

  const step = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  const getLayoutClasses = () => {
    switch (layout) {
      case "image-right":
        return "flex-row-reverse";
      case "image-top":
        return "flex-col";
      case "image-bottom":
        return "flex-col-reverse";
      default:
        return "flex-row";
    }
  };

  const getImageContainerClasses = () => {
    switch (layout) {
      case "image-top":
      case "image-bottom":
        return "w-full h-1/3";
      default:
        return "w-1/3 h-full";
    }
  };

  const getContentContainerClasses = () => {
    switch (layout) {
      case "image-top":
      case "image-bottom":
        return "w-full h-2/3";
      default:
        return "w-2/3 h-full";
    }
  };

  return (
    <div
      className={`glass-light flex flex-col overflow-hidden p-6 w-3/4 h-3/4 rounded-lg shadow ${getLayoutClasses()} ${className}`}
    >
      <div className="flex flex-row h-full flex-grow">
        <StepContent
          id={step.id}
          title={step.title}
          image={step.image}
          content={step.content}
          imageClasses={getImageContainerClasses()}
          contentClasses={getContentContainerClasses()}
        />
      </div>

      {showNavigation && (
        <Navigation
          currentStep={currentStep}
          totalSteps={steps.length}
          goNext={goNext}
          goPrev={goPrev}
          goToStep={goToStep}
          skip={onSkip}
          isFirstStep={isFirstStep}
          isLastStep={isLastStep}
          showStepIndicator={showStepIndicator}
          nextButtonText={nextButtonText}
          prevButtonText={prevButtonText}
          skipButtonText={skipButtonText}
          finishButtonText={finishButtonText}
        />
      )}
    </div>
  );
};

export default StartMenu;