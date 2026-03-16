import { useEffect, useState } from "react";
import { defaultLoadingState, LoadingState } from "../../../api/types";
import virtualFS from "../../../api/virtualFS";
import "./login.css";

export default function Loading() {
  const [loadingState, setLoadingState] = useState<LoadingState>(defaultLoadingState);

  useEffect(() => {
    const unsubscribe = virtualFS.subscribeToStorageLoadingState(state => {
      setLoadingState({ ...state });
    });
    return () => unsubscribe();
  }, []);

  if (loadingState.finished) return null;

  return (
    <div className="loading-overlay">
      <h2 className="loading-title">{loadingState.name}</h2>
      <p className="loading-description">{loadingState.description}</p>
      <progress
        className="loading-progress"
        value={loadingState.percentDone}
        max={100}
      />
      {loadingState.error && (
        <p className="loading-error">{loadingState.error.message}</p>
      )}
    </div>
  );
}
