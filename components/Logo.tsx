import Image from "next/image";
import Link from "next/link";

export default function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="block">
      <Image src="/logo-white.png" alt="Origami Brazilian Jiu-Jitsu" width={275} height={113} priority className="h-9 w-auto sm:h-11" />
    </Link>
  );
}
