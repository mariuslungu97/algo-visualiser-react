import React, { useCallback, useEffect, useRef } from "react";

function Canvas({ width, height, drawable, eventHandlers }) {
  const canvasEl = useRef(null);

  const draw = useCallback(() => {
    const canvas = canvasEl.current;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      // clear screen
      const cWidth = canvas.clientWidth;
      const cHeight = canvas.clientHeight;
      ctx.clearRect(0, 0, cWidth, cHeight);
      // render drawable class instances - must have a .draw method
      let toDraw = !Array.isArray(drawable) ? [drawable] : drawable;
      for (const comp of toDraw) {
        if (comp && typeof comp.draw === "function") comp.draw(ctx);
      }

      // trigger re render
      window.requestAnimationFrame(draw);
    }
  }, [drawable]);

  // bind and remove event handlers from canvas
  useEffect(() => {
    const canvas = canvasEl.current;
    for (const [type, eventHandler] of eventHandlers)
      canvas?.addEventListener(type, eventHandler);
    // cleanup
    return () => {
      for (const [type, eventHandler] of eventHandlers)
        canvas?.removeEventListener(type, eventHandler);
    };
  }, [eventHandlers]);

  useEffect(() => {
    if (canvasEl?.current) draw();
  }, [canvasEl, draw]);

  return <canvas id="canvas" width={width} height={height} ref={canvasEl} />;
}

export default Canvas;
