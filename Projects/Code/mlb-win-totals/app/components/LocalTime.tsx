'use client';

interface Props {
  iso: string;
}

export default function LocalTime({ iso }: Props) {
  const formatted = new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  });

  return <span>{formatted}</span>;
}
