import Image from "next/image";

interface ArtistAvatarProps {
  name: string;
  image: string | null;
  size?: number;
  className?: string;
}

export default function ArtistAvatar({ name, image, size = 48, className }: ArtistAvatarProps) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const rounded = className ?? `rounded-xl`;

  if (image) {
    return (
      <div
        className={`${rounded} overflow-hidden shrink-0 relative`}
        style={{ width: size, height: size }}
      >
        <Image src={image} alt={name} fill className="object-cover" sizes={`${size}px`} />
      </div>
    );
  }
  return (
    <div
      className={`${rounded} gradient-brand flex items-center justify-center text-white font-bold shrink-0`}
      style={{ width: size, height: size, fontSize: size * 0.28 }}
    >
      {initials}
    </div>
  );
}
