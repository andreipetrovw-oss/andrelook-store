import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET() {
  const brands = await prisma.brand.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  });

  return NextResponse.json(brands);
}

export async function POST(request: Request) {
  const session = await auth();
  
  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  const brand = await prisma.brand.create({
    data: {
      name: body.name,
      nameEn: body.nameEn,
      nameEt: body.nameEt,
      image: body.image,
    },
  });

  return NextResponse.json(brand);
}