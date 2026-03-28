function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";
}

interface UserAvatarProps {
  name: string;
  src?: string | null;
  size?: number;     // px — used for both width and height
  rounded?: string;  // tailwind class e.g. "rounded-full" | "rounded-xl"
  textSize?: string; // tailwind class e.g. "text-xs" | "text-sm"
  className?: string;
}

export default function UserAvatar({
  name,
  src,
  size = 32,
  rounded = "rounded-full",
  textSize = "text-xs",
  className = "",
}: UserAvatarProps) {
  const style = { width: size, height: size, minWidth: size };

  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={src}
        alt={name}
        style={style}
        className={`object-cover ${rounded} ${className}`}
      />
    );
  }

  return (
    <div
      style={style}
      className={`gradient-brand flex items-center justify-center text-white font-bold ${rounded} ${textSize} ${className}`}
    >
      {getInitials(name)}
    </div>
  );
}
