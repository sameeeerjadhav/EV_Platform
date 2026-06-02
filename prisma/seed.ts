import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const sampleBikes = [
  {
    name: "Ather 450X",
    brand: "Ather",
    model: "450X Gen 3",
    batteryCapacity: "3.7 kWh",
    range: "146 km",
    topSpeed: "90 km/h",
    chargingTime: "5.5 hrs (0-100%)",
    price: 145900,
    description:
      "The Ather 450X Gen 3 is the most powerful electric scooter from Ather Energy. Featuring a cutting-edge 3.7 kWh battery, it delivers an impressive range of 146 km with its fast-charging capability. With a 7-inch touchscreen dashboard and OTA updates, it offers a truly connected riding experience.",
    isAvailable: true,
  },
  {
    name: "Ola S1 Pro",
    brand: "Ola Electric",
    model: "S1 Pro Gen 2",
    batteryCapacity: "4 kWh",
    range: "195 km",
    topSpeed: "120 km/h",
    chargingTime: "6.5 hrs (0-100%)",
    price: 134999,
    description:
      "The Ola S1 Pro Gen 2 is India's most powerful electric scooter with a 8.5 kW motor and 4 kWh battery delivering an incredible 195 km range. It features a 7-inch touchscreen, music playback, call management, and navigation — all designed to make urban commuting smarter and greener.",
    isAvailable: true,
  },
  {
    name: "Revolt RV400",
    brand: "Revolt",
    model: "RV400 BRZ",
    batteryCapacity: "3.24 kWh",
    range: "150 km",
    topSpeed: "85 km/h",
    chargingTime: "4.5 hrs (0-100%)",
    price: 134990,
    description:
      "The Revolt RV400 BRZ is a premium electric motorcycle that comes with AI-enabled technology. It features swappable battery technology, a motorcycle-styled body, and four distinct ride modes. The bike is perfect for riders who want the performance of a petrol motorcycle with zero emissions.",
    isAvailable: true,
  },
  {
    name: "Bajaj Chetak Premium",
    brand: "Bajaj",
    model: "Chetak 3501",
    batteryCapacity: "3 kWh",
    range: "128 km",
    topSpeed: "73 km/h",
    chargingTime: "5 hrs (0-100%)",
    price: 110000,
    description:
      "The Bajaj Chetak Premium brings back the iconic Chetak legacy with a modern electric twist. With its retro-modern design, IP67-rated battery, and connected features via the Chetak app, it offers a blend of style and practicality. The metal body ensures durability and premium build quality.",
    isAvailable: true,
  },
  {
    name: "TVS iQube ST",
    brand: "TVS",
    model: "iQube ST",
    batteryCapacity: "5.1 kWh",
    range: "145 km",
    topSpeed: "82 km/h",
    chargingTime: "5 hrs (0-100%)",
    price: 129990,
    description:
      "The TVS iQube ST is a feature-packed electric scooter with a large 5.1 kWh battery and a 7-inch TFT display. It offers multiple riding modes, geo-fencing, and remote diagnostics through the TVS iQube connected app. The scooter is perfect for both urban commutes and weekend rides.",
    isAvailable: false,
  },
];

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing bikes (for fresh seed)
  await prisma.bikeImage.deleteMany();
  await prisma.bike.deleteMany();

  // Create bikes
  for (const bikeData of sampleBikes) {
    const bike = await prisma.bike.create({ data: bikeData });
    console.log(`✅ Created bike: ${bike.brand} ${bike.name}`);
  }

  console.log("\n🎉 Seeding complete!");
  console.log("\n📋 Next steps:");
  console.log("  1. Visit http://localhost:3000/admin-setup to create your admin account");
  console.log("  2. Set ADMIN_SETUP_KEY in your .env file first");
  console.log("  3. Log in at http://localhost:3000/login");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
