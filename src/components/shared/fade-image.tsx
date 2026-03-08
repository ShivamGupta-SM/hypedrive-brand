/**
 * FadeImage — drop-in <img> replacement with smooth load-in.
 * Image starts invisible and fades in with a subtle blur lift when loaded.
 */

import clsx from "clsx";
import type React from "react";
import { useCallback, useRef, useState } from "react";

export function FadeImage({ className, onLoad, loading = "lazy", ...props }: React.ComponentPropsWithoutRef<"img">) {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Handle the case where the image is already cached/complete before React hydrates
  const refCallback = useCallback((node: HTMLImageElement | null) => {
    (imgRef as React.MutableRefObject<HTMLImageElement | null>).current = node;
    if (node?.complete && node.naturalWidth > 0) {
      setLoaded(true);
    }
  }, []);

  return (
    <img
      {...props}
      ref={refCallback}
      loading={loading}
      className={clsx(
        className,
        "transition-[opacity,filter] duration-300 ease-out",
        loaded ? "opacity-100" : "opacity-0 blur-[1px]"
      )}
      onLoad={(e) => {
        setLoaded(true);
        onLoad?.(e);
      }}
    />
  );
}
