import apps from '@/data/apps.json';
import AppCard from '@/components/AppCard';


export const dynamic = 'force-static';


export default function HomePage() {
return (
<div className="grid gap-4 md:grid-cols-2">
{apps.map((app) => (
<AppCard key={app.slug} app={app as any} />
))}
</div>
);
}