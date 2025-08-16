"use client"
import Image from "next/image";

interface LogoProps {
  size?: number; 
  rounded?: "full" | "lg" | "none";
  className?: string;
}

export default function Logo({
  size = 30,
  rounded = "none",
  className = "",
}: LogoProps) {
  const roundedClass =
    rounded === "full"
      ? "rounded-full"
      : rounded === "lg"
      ? "rounded-lg"
      : "";

  return (
    <Image
      src="/CompliAI.svg"
      alt="CompliAI Logo"
      width={size}
      height={size}
      priority
      className={`${roundedClass} ${className}`}
    />
  );
}
