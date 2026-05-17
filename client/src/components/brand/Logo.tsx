import Image from 'next/image';
import Link from 'next/link';
import { clsx } from 'clsx';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  text?: string;
  href?: string;
  className?: string;
  prefetch?: boolean;
}

const sizes = { sm: 32, md: 44, lg: 56, xl: 72 };

export function Logo({
  size = 'md',
  showText = false,
  text = 'AIMI',
  href = '/',
  className,
  prefetch = false,
}: LogoProps) {
  const px = sizes[size];
  const img = (
    <Image
      src="/aimi-logo.png"
      alt={text}
      width={px}
      height={px}
      className="object-contain"
      priority
    />
  );

  const content = (
    <span className={clsx('inline-flex items-center gap-3', className)}>
      {img}
      {showText && (
        <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white sm:text-lg">
          {text}
        </span>
      )}
    </span>
  );

  if (href) {
    return (
      <Link href={href} prefetch={prefetch} className="transition-opacity hover:opacity-90">
        {content}
      </Link>
    );
  }
  return content;
}
