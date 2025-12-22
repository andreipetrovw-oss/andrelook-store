import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  
  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  const brand = await prisma.brand.update({
    where: { id: params.id },
    data: {
      name: body.name,
      nameEn: body.nameEn,
      nameEt: body.nameEt,
      image: body.image,
    },
  });

  return NextResponse.json(brand);
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  
  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await prisma.brand.delete({
    where: { id: params.id },
  });

  return NextResponse.json({ success: true });
}