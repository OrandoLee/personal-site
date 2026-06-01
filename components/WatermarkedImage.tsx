import type { ImgHTMLAttributes } from "react";
import { cn } from "@/lib/classNames";

type WatermarkedImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  wrapperClassName?: string;
  watermarkClassName?: string;
};

export function WatermarkedImage({
  wrapperClassName,
  watermarkClassName,
  className,
  alt,
  ...imageProps
}: WatermarkedImageProps) {
  return (
    <span className={cn("watermarked-image", wrapperClassName)}>
      <img {...imageProps} alt={alt ?? ""} className={className} />
      <span
        aria-hidden="true"
        className={cn("site-photo-watermark", watermarkClassName)}
      />
    </span>
  );
}
