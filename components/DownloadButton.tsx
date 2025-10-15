'use client';
import Link from 'next/link';
import { useState } from 'react';


export default function DownloadButton({ slug }: { slug: string }) {
const [busy, setBusy] = useState(false);
return (
<Link
href={`/api/download/${slug}`}
onClick={() => setBusy(true)}
className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-white ${busy ? 'bg-gray-600' : 'bg-black hover:bg-gray-800'} transition`}
>
{busy ? 'Starting…' : 'Download APK'}
</Link>
);
}