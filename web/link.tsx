import type { AnchorHTMLAttributes } from "react";
type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & { href: string };
export default function Link({ href, ...props }: LinkProps) {
  return <a {...props} href={href.startsWith("/") ? "#" + href : href} />;
}
