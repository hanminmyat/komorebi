import Link from "next/link";

interface Capsule {
  id: string;
  title: string;
  description: string | null;
  type: "audio" | "photo" | "mixed";
  created_at: string;
}

export default function CapsuleCard({ capsule }: { capsule: Capsule }) {
  const typeColors = {
    audio: "bg-blue-100 text-blue-800",
    photo: "bg-green-100 text-green-800",
    mixed: "bg-purple-100 text-purple-800",
  };

  return (
    <Link
      href={`/capsules/${capsule.id}`}
      className="block rounded-lg border p-4 transition-colors hover:border-gray-400"
    >
      <div className="mb-2 flex items-start justify-between">
        <h3 className="font-semibold">{capsule.title}</h3>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${typeColors[capsule.type]}`}
        >
          {capsule.type}
        </span>
      </div>
      {capsule.description && (
        <p className="text-sm text-gray-600 line-clamp-2">
          {capsule.description}
        </p>
      )}
      <p className="mt-2 text-xs text-gray-400">
        {new Date(capsule.created_at).toLocaleDateString()}
      </p>
    </Link>
  );
}
