import React, { useRef } from "react";

interface RenderCompiledProps {
  code: string;
}

const RenderCompiled: React.FC<RenderCompiledProps> = () => {
  const containerRef = useRef<HTMLDivElement>(null);


  return (
    <div>
      <h3>Live Output:</h3>
      <div ref={containerRef} />
    </div>
  );
};

export default RenderCompiled;
