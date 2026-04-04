interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
}

function Skeleton({ className = "", width, height }: SkeletonProps) {
  return (
    <div
      className={[
        "bg-surface animate-pulse rounded-lg",
        !width && "w-full",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
      }}
      aria-hidden="true"
    />
  );
}

export { Skeleton };
export type { SkeletonProps };
