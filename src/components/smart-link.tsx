import Link from "next/link";

export const isExternal = (href: string) => /^https?:\/\//i.test(href);

/** Next.js Link for site pages; a new-tab anchor for external forms. */
export function SmartLink({
  href,
  children,
  ...props
}: Omit<React.ComponentProps<"a">, "href"> & { href: string }) {
  if (isExternal(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} {...props}>
      {children}
    </Link>
  );
}
