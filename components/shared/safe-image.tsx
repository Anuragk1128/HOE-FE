"use client"

import Image, { ImageProps } from "next/image"
import { useState } from "react"

export type SafeImageProps = Omit<ImageProps, "onError" | "fill"> & {
  fallbackText?: string
}

export default function SafeImage({
  src,
  alt,
  width,
  height,
  className,
  fallbackText = "No image available",
  ...rest
}: SafeImageProps) {
  const [errored, setErrored] = useState(false)

  if (errored || !src) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <span className="text-slate-400 text-sm">{fallbackText}</span>
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={() => setErrored(true)}
      {...rest}
    />
  )
}
