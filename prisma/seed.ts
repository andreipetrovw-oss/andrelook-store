import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Начинаем заполнение базы данных...');

  // Создаём админа
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'andrei.petrovw@gmail.com' },
    update: {},
    create: {
      email: 'andrei.petrovw@gmail.com',
      name: 'Andrei Petrov',
      password: hashedPassword,
      role: 'admin',
    },
  });

  console.log('✅ Админ создан:', admin.email);

  // Создаём бренды
  const moncler = await prisma.brand.upsert({
    where: { name: 'Moncler' },
    update: {},
    create: {
      name: 'Moncler',
      nameEn: 'Moncler',
      nameEt: 'Moncler',
      image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400',
    },
  });

  const parajumpers = await prisma.brand.upsert({
    where: { name: 'Parajumpers' },
    update: {},
    create: {
      name: 'Parajumpers',
      nameEn: 'Parajumpers',
      nameEt: 'Parajumpers',
      image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400',
    },
  });

  const cpcompany = await prisma.brand.upsert({
    where: { name: 'CP Company' },
    update: {},
    create: {
      name: 'CP Company',
      nameEn: 'CP Company',
      nameEt: 'CP Company',
      image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400',
    },
  });

  console.log('✅ Бренды созданы');

  // Создаём тестовые товары
  await prisma.product.create({
    data: {
      name: 'Maya Down Jacket',
      nameEn: 'Maya Down Jacket',
      nameEt: 'Maya Down Jacket',
      descriptionRu: 'Легендарная пуховая куртка Moncler Maya - воплощение роскоши и функциональности. Изготовлена из высококачественного нейлона с пуховым наполнителем премиум-класса.',
      descriptionEn: 'The legendary Moncler Maya down jacket - embodiment of luxury and functionality. Made from high-quality nylon with premium down filling.',
      descriptionEt: 'Legendaarne Moncler Maya sulejope - luksuse ja funktsionaalsuse kehastus. Valmistatud kvaliteetsest nailonist koos premium suletäidisega.',
      price: 1450,
      brandId: moncler.id,
      image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600',
      images: [
        'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600',
        'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600',
      ],
      rating: 5,
    },
  });

  console.log('✅ Товары созданы');

  console.log('🎉 База данных заполнена!');
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
