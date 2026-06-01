import type { ImgHTMLAttributes } from "react";
import { cn } from "@/lib/classNames";

type WatermarkedImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  showWatermark?: boolean;
  wrapperClassName?: string;
  watermarkClassName?: string;
};

export function WatermarkedImage({
  showWatermark = true,
  wrapperClassName,
  watermarkClassName,
  className,
  alt,
  ...imageProps
}: WatermarkedImageProps) {
  return (
    <span className={cn("watermarked-image", wrapperClassName)}>
      <img {...imageProps} alt={alt ?? ""} className={className} />
      {showWatermark ? (
        <span
          aria-hidden="true"
          className={cn("site-photo-watermark", watermarkClassName)}
        />
      ) : null}
    </span>
  );
}
