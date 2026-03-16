import { OpenedApp } from "../../../../context/kernal/kernal";
import Popup from "./Popup";
import { BaseError } from "../../../../types/globals"; // assuming the improved AppError type
import Button from "../../../lib/Button";

interface ErrorPopupProps {
  props: OpenedApp;
  onComplete: (value: string) => void;
  ErrorType: BaseError<any>; // generic error type, still typed
}

const TextPopup: React.FC<ErrorPopupProps> = ({
  props,
  onComplete,
  ErrorType,
}) => {
  return (
    <Popup
      app={props}
      closeOnComplete
      frozenBackground={true}
      width={300}
      height={200}
    >
      {({ complete }) => {
        const handleConfirm = () => {
          complete();
          onComplete("ok"); // or pass ErrorType.type if needed
        };

        return (
          <div
            style={{
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 12,
              justifyContent: "space-between",
              height: "100%",
            }}
          >
            <div>
              <h3 style={{ fontWeight: "bold", fontSize: 18, marginBottom: 8 }}>
                {ErrorType.message}
              </h3>
              <p style={{ fontSize: 14, color: "#666" }}>
                {ErrorType.description ?? "An unexpected error occurred."}
              </p>
              {ErrorType.code && (
                <p style={{ fontSize: 12, marginTop: 8, color: "#999" }}>
                  Error Code: {ErrorType.code}
                </p>
              )}
            </div>
            <Button onClick={handleConfirm} className="mt-auto self-end">
              OK
            </Button>
          </div>
        );
      }}
    </Popup>
  );
};

export default TextPopup;