import Link from "next/link";
import { Button } from "./ui/button";
import { CircleArrowLeft } from "lucide-react";

export default function ButtonBack() {
  return (
    <Button
      variant="secondary"
      className="absolute left-4 top-4 cursor-pointer"
    >
      <Link href="/" className="flex gap-2 items-center text-md">
        <CircleArrowLeft /> Back
      </Link>
    </Button>
  );
}
