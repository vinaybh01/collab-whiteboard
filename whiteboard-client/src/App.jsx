import { useEffect, useRef, useState } from "react";

function App() {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const contextRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = new WebSocket("ws://192.168.1.2:8080");
    socketRef.current.onmessage = (event) => {
      const { x, y } = JSON.parse(event.data);
      contextRef.current.lineTo(x, y);
      contextRef.current.stroke();
    };

    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const context = canvas.getContext("2d");
    context.lineCap = "round";
    context.strokeStyle = "white";
    context.lineWidth = 2;
    context.fillStyle = "#121212"; // dark background

    context.fillRect(0, 0, canvas.width, canvas.height);
    contextRef.current = context;

    return () => {
      socketRef.current.close();
    };
  }, []);

  const startDrawing = (e) => {
    contextRef.current.beginPath();
    contextRef.current.moveTo(e.clientX, e.clientY);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    contextRef.current.lineTo(e.clientX, e.clientY);
    contextRef.current.stroke();

    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ x: e.clientX, y: e.clientY }));
    }
  };

  const stopDrawing = () => {
    contextRef.current.closePath();
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    contextRef.current.fillStyle = "#121212";
    contextRef.current.fillRect(0, 0, canvas.width, canvas.height);
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.download = "drawing.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        style={{
          display: "block",
          background: "#121212",
          cursor: "crosshair",
        }}
      />
      <div style={{ position: "fixed", top: 10, left: 10 }}>
        <button onClick={clearCanvas} style={btnStyle}>
          Clear
        </button>
        <button onClick={downloadImage} style={btnStyle}>
          Download
        </button>
      </div>
    </div>
  );
}

const btnStyle = {
  background: "#333",
  color: "white",
  padding: "8px 12px",
  marginRight: "8px",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
};

export default App;
