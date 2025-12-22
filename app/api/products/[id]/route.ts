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

  const product = await prisma.product.update({
    where: { id: params.id },
    data: {
      name: body.name,
      nameEn: body.nameEn,
      nameEt: body.nameEt,
      descriptionRu: body.descriptionRu,
      descriptionEn: body.descriptionEn,
      descriptionEt: body.descriptionEt,
      price: body.price,
      brandId: body.brandId,
      image: body.image,
      rating: body.rating,
      inStock: body.inStock,
    },
  });

  return NextResponse.json(product);
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  
  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await prisma.product.delete({
    where: { id: params.id },
  });

  return NextResponse.json({ success: true });
} 