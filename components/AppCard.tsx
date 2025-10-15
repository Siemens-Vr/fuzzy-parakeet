import Link from 'next/link';
import DownloadButton from './DownloadButton';
import { formatBytes } from './bytes';


type AppMeta = {
slug: string;
name: string;
version: string;
filename: string;
sizeBytes: number;
sha256: string;
summary?: string;
};


export default function AppCard({ app }: { app: AppMeta }) {
return (
<div className="rounded-lg border p-4 grid gap-2">
<div className="flex items-baseline justify-between gap-3">
<h2 className="text-lg font-semibold">
<Link href={`/apps/${app.slug}`} className="hover:underline">{app.name}</Link>
</h2>
<span className="text-xs text-gray-500">v{app.version}</span>
</div>
{app.summary && <p className="text-sm text-gray-700">{app.summary}</p>}
<div className="text-xs text-gray-500">Size: {formatBytes(app.sizeBytes)}</div>
<div className="text-[11px] text-gray-400 break-all">SHA-256: {app.sha256}</div>
<div className="pt-2">
<DownloadButton slug={app.slug} />
</div>
</div>
);
}