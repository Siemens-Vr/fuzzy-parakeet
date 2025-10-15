import apps from '@/data/apps.json';
import { notFound } from 'next/navigation';
import { formatBytes } from '@/components/bytes';
import DownloadButton from '@/components/DownloadButton';


export const dynamic = 'force-static';


export default function AppDetail({ params }: { params: { slug: string } }) {
const app = (apps as any[]).find((a) => a.slug === params.slug);
if (!app) return notFound();


return (
<article className="prose max-w-none">
<h1 className="mb-2">{app.name}</h1>
<p className="text-sm text-gray-600">Version {app.version}</p>
{app.summary && <p className="mt-3">{app.summary}</p>}


<ul className="mt-4 text-sm text-gray-700">
<li><strong>Filename:</strong> {app.filename}</li>
<li><strong>Size:</strong> {formatBytes(app.sizeBytes)}</li>
<li className="break-all"><strong>SHA-256:</strong> {app.sha256}</li>
</ul>


<div className="mt-6">
<DownloadButton slug={app.slug} />
</div>


<details className="mt-6 text-sm">
<summary className="cursor-pointer text-gray-700">Install tips (Android/Quest)</summary>
<ol className="list-decimal ml-6 mt-2">
<li>Download the APK.</li>
<li>On Android 8+, allow the browser/files app to install unknown apps.</li>
<li>Open the download and confirm installation.</li>
</ol>
</details>
</article>
);
}