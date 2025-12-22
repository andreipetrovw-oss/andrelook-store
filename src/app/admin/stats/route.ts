import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET() {
  const session = await auth();
  
  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const totalProducts = await prisma.product.count();
  const totalOrders = await prisma.order.count();
  const totalCustomers = await prisma.user.count({ where: { role: 'user' } });
  
  const orders = await prisma.order.findMany({ select: { total: true } });
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

  return NextResponse.json({
    totalProducts,
    totalOrders,
    totalCustomers,
    totalRevenue
  });
}

// src/app/api/admin/brands/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET() {
  const session = await auth();
  
  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const brands = await prisma.brand.findMany({
    include: {
      _count: {
        select: { products: true }
      }
    },
    orderBy: { name: 'asc' }
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
      image: body.image
    }
  });

  return NextResponse.json(brand);
}

// src/app/api/admin/brands/[id]/route.ts
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
      image: body.image
    }
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
    where: { id: params.id }
  });

  return NextResponse.json({ success: true });
}

// src/app/api/admin/products/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET() {
  const session = await auth();
  
  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const products = await prisma.product.findMany({
    include: {
      brand: { select: { name: true } }
    },
    orderBy: { createdAt: 'desc' }
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
      images: [],
      rating: body.rating || 5,
      inStock: body.inStock !== false
    }
  });

  return NextResponse.json(product);
}

// src/app/api/admin/products/[id]/route.ts
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
      inStock: body.inStock
    }
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
    where: { id: params.id }
  });

  return NextResponse.json({ success: true });
}
