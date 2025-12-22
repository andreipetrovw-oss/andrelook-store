import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET() {
  const products = await prisma.product.findMany({
    include: {
      brand: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const session = await auth();
  
  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  const product = await prisma.product.create({
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
      images: body.images || [],
      rating: body.rating || 5,
      inStock: body.inStock ?? true,
    },
  });

  return NextResponse.json(product);
} 