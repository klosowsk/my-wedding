interface BotanicalCornersProps {
  /** Size class for the top-left leaf (Tailwind width) */
  topLeftSize?: string;
  /** Size class for the bottom-right leaf (Tailwind width) */
  bottomRightSize?: string;
  /** Opacity class (e.g., "opacity-15", "opacity-25") */
  opacity?: string;
}

export default function BotanicalCorners({
  topLeftSize = "w-24",
  bottomRightSize = "w-20",
  opacity = "opacity-15",
}: BotanicalCornersProps) {
  return (
    <>
      <img
        src="/assets/vectors/leaves-top-left.svg"
        alt=""
        aria-hidden="true"
        className={`hidden md:block absolute -top-4 -left-4 ${topLeftSize} ${opacity} pointer-events-none select-none`}
      />
      <img
        src="/assets/vectors/leaves-bottom-right.svg"
        alt=""
        aria-hidden="true"
        className={`hidden md:block absolute -bottom-4 -right-4 ${bottomRightSize} ${opacity} pointer-events-none select-none`}
      />
    </>
  );
}
