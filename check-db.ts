import { prisma } from './lib/prisma';

async function main() {
    const users = await prisma.user.findMany({
        include: {
            developer: true
        }
    });
    console.log('Users and Developers:');
    console.dir(users, { depth: null });

    const apps = await prisma.app.findMany();
    console.log('\nApps:');
    console.dir(apps, { depth: null });
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
