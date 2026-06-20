import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const eventTemplates = [
  { title: 'Tech Conference 2026', description: 'Annual technology conference featuring industry leaders.', venue: 'Convention Center Hall A', price: 99.99 },
  { title: 'Jazz Night Live', description: 'An evening of smooth jazz with renowned musicians.', venue: 'Blue Note Lounge', price: 45.0 },
  { title: 'Startup Pitch Battle', description: 'Watch startups compete for funding in front of investors.', venue: 'Innovation Hub', price: 25.0 },
  { title: 'Food & Wine Festival', description: 'Taste dishes from top chefs paired with fine wines.', venue: 'Riverside Park', price: 75.0 },
  { title: 'Yoga Retreat Weekend', description: 'A rejuvenating weekend of yoga, meditation, and wellness.', venue: 'Mountain View Resort', price: 150.0 },
  { title: 'Photography Workshop', description: 'Learn professional photography techniques from experts.', venue: 'Art Studio Downtown', price: 60.0 },
  { title: 'Comedy Stand-Up Night', description: 'Laugh out loud with the best comedians in town.', venue: 'Laugh Factory', price: 35.0 },
  { title: 'Marathon 2026', description: 'Annual city marathon with 5K, 10K, and full marathon options.', venue: 'City Stadium', price: 40.0 },
  { title: 'Art Exhibition Opening', description: 'Opening night of contemporary art from local artists.', venue: 'Modern Art Gallery', price: 20.0 },
  { title: 'Cooking Masterclass', description: 'Hands-on cooking class with a Michelin-star chef.', venue: 'Culinary Institute', price: 85.0 },
  { title: 'Blockchain Summit', description: 'Explore the future of blockchain and Web3 technologies.', venue: 'Tech Park Auditorium', price: 120.0 },
  { title: 'Classical Orchestra', description: 'Symphony orchestra performing Beethoven and Mozart.', venue: 'Grand Opera House', price: 55.0 },
  { title: 'Film Festival Premiere', description: 'World premiere of award-winning independent films.', venue: 'Cinema Paradiso', price: 30.0 },
  { title: 'Business Networking Mixer', description: 'Connect with professionals across industries.', venue: 'Rooftop Lounge', price: 15.0 },
  { title: 'Kids Science Fair', description: 'Interactive science exhibits for children and families.', venue: 'Science Museum', price: 10.0 },
  { title: 'Rock Concert Live', description: 'High-energy rock concert with top bands.', venue: 'Arena Stadium', price: 80.0 },
  { title: 'Poetry Slam', description: 'Spoken word poetry competition with open mic sessions.', venue: 'The Word Cafe', price: 12.0 },
  { title: 'Gaming Tournament', description: 'Esports tournament with prizes for top players.', venue: 'GameZone Arena', price: 25.0 },
  { title: 'Wine Tasting Evening', description: 'Guided wine tasting featuring international selections.', venue: 'Vineyard Estate', price: 65.0 },
  { title: 'Dance Festival', description: 'Celebration of dance styles from around the world.', venue: 'Cultural Center', price: 40.0 },
];

async function main() {
  console.log('Seeding database...');

  await prisma.activityLog.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('password123', 12);

  const organizers = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Sarah Johnson',
        email: 'sarah@bookit.com',
        password: hashedPassword,
        role: 'ORGANIZER',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Michael Chen',
        email: 'michael@bookit.com',
        password: hashedPassword,
        role: 'ORGANIZER',
      },
    }),
  ]);

  const users = await Promise.all(
    Array.from({ length: 10 }, (_, i) =>
      prisma.user.create({
        data: {
          name: `User ${i + 1}`,
          email: `user${i + 1}@bookit.com`,
          password: hashedPassword,
          role: 'USER',
        },
      })
    )
  );

  const events = [];
  for (let i = 0; i < 20; i++) {
    const template = eventTemplates[i];
    const organizer = organizers[i % organizers.length];
    const daysAhead = 7 + i * 3;

    const event = await prisma.event.create({
      data: {
        title: template.title,
        description: template.description,
        venue: template.venue,
        eventDate: new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000),
        capacity: [50, 100, 150, 200, 1][i % 5],
        price: template.price,
        organizerId: organizer.id,
      },
    });
    events.push(event);
  }

  const bookings = [];
  for (let i = 0; i < 15; i++) {
    const user = users[i % users.length];
    const event = events[i % events.length];

    const existing = bookings.find(
      (b) => b.userId === user.id && b.eventId === event.id
    );
    if (existing) continue;

    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        eventId: event.id,
        status: 'CONFIRMED',
      },
    });
    bookings.push(booking);

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        eventId: event.id,
        actionType: 'BOOKING_STARTED',
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        eventId: event.id,
        actionType: 'BOOKING_CONFIRMED',
      },
    });
  }

  for (const event of events.slice(0, 10)) {
    for (let v = 0; v < 5 + Math.floor(Math.random() * 10); v++) {
      const user = users[Math.floor(Math.random() * users.length)];
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          eventId: event.id,
          actionType: 'EVENT_VIEWED',
        },
      });
    }
  }

  for (const booking of bookings.slice(0, 3)) {
    await prisma.booking.update({
      where: { id: booking.id },
      data: { status: 'CANCELLED' },
    });

    await prisma.activityLog.create({
      data: {
        userId: booking.userId,
        eventId: booking.eventId,
        actionType: 'BOOKING_CANCELLED',
      },
    });
  }

  console.log('Seed completed successfully!');
  console.log(`Created ${organizers.length} organizers`);
  console.log(`Created ${users.length} users`);
  console.log(`Created ${events.length} events`);
  console.log(`Created ${bookings.length} bookings`);
  console.log('\nDemo credentials:');
  console.log('Organizer: sarah@bookit.com / password123');
  console.log('Organizer: michael@bookit.com / password123');
  console.log('User: user1@bookit.com / password123');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
