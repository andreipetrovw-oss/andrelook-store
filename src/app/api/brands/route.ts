import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const brands = await prisma.brand.findMany({
    orderBy: { name: 'asc' }
  });

  return NextResponse.json(brands);
}

// src/app/api/products/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const brandId = searchParams.get('brandId');

  const products = await prisma.product.findMany({
    where: brandId ? { brandId } : undefined,
    include: {
      brand: { select: { name: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json(products);
}

// src/app/api/products/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      brand: { select: { name: true } }
    }
  });

  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  return NextResponse.json(product);
}

// src/app/api/orders/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(request: Request) {
  const body = await request.json();
  const session = await auth();

  // Генерируем номер заказа
  const orderNumber = `ORD-${Date.now()}`;

  const order = await prisma.order.create({
    data: {
      orderNumber,
      userId: session?.user?.id,
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      customerPhone: body.customerPhone,
      deliveryAddress: body.deliveryAddress,
      paymentMethod: body.paymentMethod,
      status: 'processing',
      total: body.total,
      items: {
        create: body.items.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        }))
      }
    },
    include: {
      items: {
        include: {
          product: true
        }
      }
    }
  });

  // Отправка email (можно добавить Resend здесь)
  try {
    await fetch(`${process.env.NEXT_PUBLIC_URL}/api/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: body.customerEmail,
        orderNumber,
        order
      })
    });
  } catch (error) {
    console.error('Email send error:', error);
  }

  return NextResponse.json(order);
}

// src/app/api/orders/my/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: {
      items: {
        include: {
          product: {
            select: {
              name: true,
              image: true
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json(orders);
}

// src/app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    // Проверяем, существует ли пользователь
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создаем пользователя
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: 'user'
      }
    });

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}

// src/app/api/send-email/route.ts
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { to, orderNumber, order } = body;

    const data = await resend.emails.send({
      from: 'AndreLook <orders@andrelook.com>',
      to: [to],
      subject: `Заказ ${orderNumber} оформлен`,
      html: `
        <h2>Спасибо за заказ!</h2>
        <p>Номер заказа: <strong>${orderNumber}</strong></p>
        <p>Сумма: <strong>€${order.total}</strong></p>
        <p>Статус: В обработке</p>
        <br>
        <p>Мы отправим уведомление на этот email, когда заказ будет отправлен.</p>
        <br>
        <p>С уважением,<br>Команда AndreLook</p>
      `
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Email error:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}

