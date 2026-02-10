import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { compare, hash } from 'bcryptjs'; // Assuming bcryptjs is used, or similar

export async function POST(req: NextRequest) {
    try {
        const userPayload = getUserFromRequest(req);
        if (!userPayload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { currentPassword, newPassword } = await req.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        if (newPassword.length < 8) {
            return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { id: userPayload.userId }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Verify current password
        const isValid = await compare(currentPassword, user.password);
        if (!isValid) {
            return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });
        }

        // Hash new password
        const hashedPassword = await hash(newPassword, 12);

        // Update user
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }
        });

        // In a real app with sessions, you'd invalidate other sessions here.
        // For JWT stateless, the user just needs to use the new password next time token expires? 
        // Or if you track token versions in DB, increment it.
        // Given the context, we'll just return success.

        return NextResponse.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
