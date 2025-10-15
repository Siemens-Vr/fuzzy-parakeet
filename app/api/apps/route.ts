import apps from '@/data/apps.json';


export const dynamic = 'force-static';


export async function GET() {
    return new Response(JSON.stringify(apps), {
    headers: {
    'content-type': 'application/json',
    'cache-control': 'public, max-age=300',
    },
    });
}