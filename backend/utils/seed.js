import dotenv from "dotenv"
import mongoose from "mongoose"
import connectDB from "../config/db.js"
import User from "../models/User.js"
import Product from "../models/Product.js"
import Order from "../models/Order.js"
import CompanyApplication from "../models/CompanyApplication.js"
import ProductRequest from "../models/ProductRequest.js"
import CartItem from "../models/CartItem.js"
import WishlistItem from "../models/WishlistItem.js"

dotenv.config()

const COMPANY_PASSWORD = "company123"
const CUSTOMER_PASSWORD = "customer123"

const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

const img = (title, i) => "https://picsum.photos/seed/ecomart-" + slugify(title) + "-" + i + "/600/600"
const round2 = (n) => Math.round(n * 100) / 100

// Deterministic pseudo-stats so revenue/views look realistic but stable.
const stat = (i) => {
  const views = 90 + ((i * 73) % 1200)
  const orders = 6 + ((i * 29) % 140)
  return { views, orders }
}

// p = [title, description, price, category, score, badges, carbon, stock]
const p = (title, description, price, category, score, badges, carbon, stock) => ({
  title,
  description,
  price,
  category,
  sustainability_score: score,
  eco_badges: badges,
  carbon_saved_kg: carbon,
  stock,
})

const companies = [
  {
    full_name: "Green Earth Co.",
    email: "company@ecomart.com",
    website: "https://greenearth.example.com",
    description: "Plastic-free home and cleaning essentials for a zero-waste lifestyle.",
    products: [
      p("Bamboo Toothbrush Set", "Pack of 4 biodegradable bamboo toothbrushes with charcoal bristles.", 12.5, "home", 4, ["Biodegradable", "Plastic-Free"], 0.8, 300),
      p("Reusable Beeswax Wraps", "Plastic-free food wraps. Set of 3 sizes. Washable and compostable.", 18.0, "home", 5, ["Biodegradable", "Organic"], 1.2, 140),
      p("Refillable Glass Cleaner", "Streak-free, plant-based cleaner in a reusable glass bottle.", 9.99, "cleaning", 4, ["Biodegradable"], 0.5, 200),
      p("Compostable Trash Bags (50pk)", "Sturdy, fully compostable bin liners made from cornstarch.", 14.99, "cleaning", 4, ["Biodegradable"], 1.0, 260),
      p("Stainless Steel Straw Kit", "Reusable straws with cleaning brush and cotton carry pouch.", 11.0, "home", 4, ["Plastic-Free", "Recycled"], 0.6, 220),
      p("Recycled Wool Blanket", "Cozy throw woven from 70% recycled wool fibers.", 64.0, "home", 4, ["Recycled"], 3.1, 40),
    ],
  },
  {
    full_name: "EcoThreads",
    email: "threads@ecomart.com",
    website: "https://ecothreads.example.com",
    description: "Ethically made clothing and accessories from organic and recycled fibers.",
    products: [
      p("Organic Cotton T-Shirt", "Soft, breathable tee made from 100% GOTS-certified organic cotton.", 29.99, "clothing", 5, ["Organic", "Fair Trade"], 2.4, 120),
      p("Recycled Denim Jeans", "Classic-fit jeans crafted from reclaimed denim and recycled water.", 79.0, "clothing", 4, ["Recycled"], 6.0, 80),
      p("Hemp Everyday Backpack", "Durable hemp-canvas backpack with padded laptop sleeve.", 59.0, "accessories", 5, ["Organic"], 3.5, 60),
      p("Bamboo Socks (3-pack)", "Naturally antibacterial bamboo-blend socks. Ultra soft.", 16.0, "clothing", 4, ["Biodegradable"], 0.7, 200),
      p("Cork Bifold Wallet", "Slim vegan wallet made from sustainably harvested cork.", 34.0, "accessories", 5, ["Vegan", "Biodegradable"], 0.9, 110),
      p("Organic Linen Scarf", "Lightweight European flax linen scarf, naturally dyed.", 26.5, "accessories", 4, ["Organic"], 0.8, 90),
    ],
  },
  {
    full_name: "SolarNest",
    email: "solar@ecomart.com",
    website: "https://solarnest.example.com",
    description: "Solar-powered gadgets and energy-saving electronics for everyday life.",
    products: [
      p("Solar Power Bank 20000mAh", "Charge your devices anywhere with this rugged solar-powered battery.", 49.99, "electronics", 4, ["Carbon Neutral"], 5.5, 60),
      p("Foldable Solar Panel Charger", "28W foldable panel that powers phones and tablets off-grid.", 89.0, "electronics", 5, ["Carbon Neutral"], 9.0, 35),
      p("LED Solar Lantern", "Collapsible, waterproof lantern with 12-hour solar runtime.", 22.0, "electronics", 4, ["Carbon Neutral"], 2.0, 130),
      p("Hand-Crank Emergency Radio", "Crank or solar powered radio with flashlight and USB output.", 39.0, "electronics", 4, ["Carbon Neutral"], 1.5, 70),
      p("Bamboo Wireless Charger", "15W Qi charger with a real bamboo housing.", 29.0, "electronics", 4, ["Biodegradable"], 1.0, 100),
      p("Smart Energy Monitor Plug", "Track and cut appliance energy use from your phone.", 27.5, "electronics", 4, ["Carbon Neutral"], 1.2, 150),
    ],
  },
  {
    full_name: "BloomGarden",
    email: "bloom@ecomart.com",
    website: "https://bloomgarden.example.com",
    description: "Everything you need to grow a thriving, pollinator-friendly garden.",
    products: [
      p("Compostable Plant Pots (6-pack)", "Seed-starting pots made from coconut coir. Plant the whole pot.", 14.99, "garden", 5, ["Biodegradable", "Organic"], 0.9, 250),
      p("Heirloom Veggie Seed Kit", "12 varieties of non-GMO heirloom vegetable seeds.", 19.5, "garden", 5, ["Organic"], 0.4, 180),
      p("Bee-Friendly Wildflower Mix", "Native wildflower seed blend to support local pollinators.", 9.5, "garden", 5, ["Organic"], 0.3, 300),
      p("Recycled Rubber Garden Hose", "Kink-free 15m hose made from recycled rubber.", 42.0, "garden", 4, ["Recycled"], 2.5, 60),
      p("Self-Watering Planter", "Recycled-plastic planter with built-in water reservoir.", 34.99, "garden", 4, ["Recycled"], 1.4, 90),
      p("Kitchen Compost Bin", "Countertop compost caddy with charcoal odor filter.", 38.0, "garden", 5, ["Recycled", "Biodegradable"], 2.0, 70),
    ],
  },
  {
    full_name: "ClearGlow Beauty",
    email: "glow@ecomart.com",
    website: "https://clearglow.example.com",
    description: "Clean, cruelty-free skincare and beauty with zero-waste packaging.",
    products: [
      p("Organic Lavender Soap Bar", "Handmade cold-process soap with organic lavender essential oil.", 7.5, "beauty", 5, ["Organic", "Fair Trade"], 0.3, 180),
      p("Refillable Shampoo Bar", "Plastic-free shampoo bar good for up to 60 washes.", 13.0, "beauty", 5, ["Plastic-Free", "Vegan"], 0.5, 160),
      p("Zero-Waste Deodorant", "Aluminum-free deodorant in a compostable paper tube.", 11.5, "beauty", 4, ["Plastic-Free", "Vegan"], 0.4, 200),
      p("Reef-Safe Sunscreen SPF30", "Mineral sunscreen safe for coral reefs and sensitive skin.", 18.0, "beauty", 4, ["Vegan"], 0.6, 140),
      p("Rosehip Facial Oil", "Cold-pressed organic rosehip oil for glowing skin.", 24.0, "beauty", 5, ["Organic", "Vegan"], 0.5, 100),
      p("Bamboo Makeup Brush Set", "5-piece vegan brush set with bamboo handles.", 28.0, "beauty", 4, ["Vegan", "Biodegradable"], 0.9, 80),
    ],
  },
  {
    full_name: "FreshHarvest Foods",
    email: "harvest@ecomart.com",
    website: "https://freshharvest.example.com",
    description: "Organic, fair-trade pantry staples sourced directly from farmers.",
    products: [
      p("Fair Trade Coffee Beans 1kg", "Single-origin medium roast, fair-trade and shade-grown.", 21.0, "food", 5, ["Fair Trade", "Organic"], 1.0, 150),
      p("Raw Organic Honey Jar", "Unfiltered wildflower honey from regenerative apiaries.", 14.0, "food", 5, ["Organic"], 0.5, 200),
      p("Organic Quinoa 1kg", "Protein-rich white quinoa, washed and ready to cook.", 12.5, "food", 4, ["Organic"], 0.6, 220),
      p("Plant-Based Protein Powder", "Pea and rice protein blend, 20g protein per serving.", 34.99, "food", 4, ["Vegan", "Organic"], 1.5, 120),
      p("Ceremonial Matcha Tea", "Stone-ground first-harvest matcha from organic farms.", 27.0, "food", 5, ["Organic", "Fair Trade"], 0.7, 90),
      p("Raw Cacao Nibs", "Crunchy fair-trade cacao nibs, perfect for baking.", 9.99, "food", 4, ["Organic", "Fair Trade"], 0.4, 160),
    ],
  },
]

const customers = [
  { full_name: "Casey Customer", email: "customer@ecomart.com" },
  { full_name: "Maya Lopez", email: "maya@example.com" },
  { full_name: "Omar Khaled", email: "omar@example.com" },
  { full_name: "Lily Chen", email: "lily@example.com" },
  { full_name: "Noah Smith", email: "noah@example.com" },
]

const run = async () => {
  await connectDB()
  console.log("\u{1F331} Seeding EcoMart database (large dataset)...")

  // Drop whole collections (not just documents) so stale indexes left over
  // from older schema versions (e.g. a unique userEmail_1 index) are removed
  // too. Ignore "namespace not found" errors (code 26) for fresh databases.
  const models = [User, Product, Order, CompanyApplication, ProductRequest, CartItem, WishlistItem]
  for (const M of models) {
    try {
      await M.collection.drop()
    } catch (err) {
      if (err.code !== 26) throw err
    }
  }

  // --- Users (create() so the password pre-save hook hashes them) ---
  await User.create({
    full_name: "Platform Admin",
    email: "admin@ecomart.com",
    password: "admin123",
    role: "admin",
    account_type: null,
  })

  for (const c of companies) {
    await User.create({
      full_name: c.full_name,
      email: c.email,
      password: COMPANY_PASSWORD,
      role: "user",
      account_type: "company",
    })
  }

  for (const cu of customers) {
    await User.create({
      full_name: cu.full_name,
      email: cu.email,
      password: CUSTOMER_PASSWORD,
      role: "user",
      account_type: "customer",
    })
  }

  // --- Products ---
  let idx = 0
  const productDocs = []
  for (const c of companies) {
    for (const prod of c.products) {
      idx += 1
      const s = stat(idx)
      productDocs.push({
        ...prod,
        company_id: c.email,
        company_name: c.full_name,
        status: "active",
        views: s.views,
        orders_count: s.orders,
        revenue: round2(prod.price * s.orders),
        image_url: img(prod.title, idx),
      })
    }
  }
  const createdProducts = await Product.insertMany(productDocs)

  // --- Orders ---
  const statuses = ["delivered", "delivered", "shipped", "processing", "pending", "cancelled"]
  const cities = [
    ["New York", "NY"],
    ["Austin", "TX"],
    ["Seattle", "WA"],
    ["Denver", "CO"],
    ["Miami", "FL"],
  ]
  const orders = []
  for (let i = 0; i < 24; i += 1) {
    const cust = customers[i % customers.length]
    const n = 1 + (i % 3)
    const items = []
    let subtotal = 0
    let carbon = 0
    for (let k = 0; k < n; k += 1) {
      const prod = createdProducts[(i * 3 + k * 7) % createdProducts.length]
      const qty = 1 + ((i + k) % 3)
      items.push({
        product_id: prod._id.toString(),
        title: prod.title,
        price: prod.price,
        quantity: qty,
        image_url: prod.image_url,
        company_id: prod.company_id,
      })
      subtotal += prod.price * qty
      carbon += (prod.carbon_saved_kg || 0) * qty
    }
    const shipping = subtotal > 50 ? 0 : 5.99
    const place = cities[i % cities.length]
    orders.push({
      customer_email: cust.email,
      customer_name: cust.full_name,
      items,
      total: round2(subtotal + shipping),
      status: statuses[i % statuses.length],
      shipping_address: {
        street: `${100 + i} Greenway Blvd`,
        city: place[0],
        state: place[1],
        zip: `${10000 + i * 7}`,
        country: "USA",
      },
      carbon_saved_total: round2(carbon),
    })
  }
  await Order.insertMany(orders)

  // --- Company applications (approved history + a couple pending) ---
  const apps = companies.map((c) => ({
    user_email: c.email,
    user_name: c.full_name,
    company_name: c.full_name,
    company_description: c.description,
    website: c.website,
    status: "approved",
    admin_note: "Verified sustainable supplier.",
  }))

  const pendingCompanies = [
    {
      email: "wave@ecomart.com",
      name: "WaveZero Packaging",
      desc: "Compostable shipping materials for online stores.",
      site: "https://wavezero.example.com",
    },
    {
      email: "terra@ecomart.com",
      name: "TerraKnit Apparel",
      desc: "Recycled-yarn knitwear made in solar-powered factories.",
      site: "https://terraknit.example.com",
    },
  ]
  for (const pc of pendingCompanies) {
    await User.create({
      full_name: pc.name,
      email: pc.email,
      password: COMPANY_PASSWORD,
      role: "user",
      account_type: "pending_company",
    })
    apps.push({
      user_email: pc.email,
      user_name: pc.name,
      company_name: pc.name,
      company_description: pc.desc,
      website: pc.site,
      status: "pending",
      admin_note: "",
    })
  }
  await CompanyApplication.insertMany(apps)

  // --- Pending product requests (so the admin review queue is alive) ---
  const reqCompany = companies[0]
  const editTarget = createdProducts.find((x) => x.company_id === reqCompany.email)
  const delCompany = companies[1]
  const delTarget = createdProducts.find((x) => x.company_id === delCompany.email)

  const requests = [
    {
      company_id: reqCompany.email,
      company_name: reqCompany.full_name,
      request_type: "add",
      product_data: {
        title: "Compostable Phone Case",
        description: "Plant-based phone case that fully breaks down in compost.",
        price: 24.99,
        category: "accessories",
        stock: 90,
        sustainability_score: 5,
        eco_badges: ["Biodegradable", "Vegan"],
        carbon_saved_kg: 1.1,
      },
      status: "pending",
    },
    {
      company_id: reqCompany.email,
      company_name: reqCompany.full_name,
      request_type: "edit",
      product_id: editTarget ? editTarget._id.toString() : null,
      product_data: { price: 10.99 },
      status: "pending",
    },
    {
      company_id: delCompany.email,
      company_name: delCompany.full_name,
      request_type: "delete",
      product_id: delTarget ? delTarget._id.toString() : null,
      product_data: {},
      status: "pending",
    },
  ]
  await ProductRequest.insertMany(requests)

  // --- Wishlist + cart for the demo customer (so those pages aren't empty) ---
  const demo = customers[0]
  const wishlist = createdProducts.slice(0, 4).map((x) => ({
    user_email: demo.email,
    product_id: x._id.toString(),
    title: x.title,
    price: x.price,
    image_url: x.image_url,
  }))
  await WishlistItem.insertMany(wishlist)

  const cart = createdProducts.slice(4, 6).map((x) => ({
    user_email: demo.email,
    product_id: x._id.toString(),
    title: x.title,
    price: x.price,
    quantity: 1,
    image_url: x.image_url,
    company_id: x.company_id,
  }))
  await CartItem.insertMany(cart)

  // --- Summary ---
  console.log("\u2705 Seed complete!")
  console.log(`   Companies -> ${companies.length} (login: any company email / ${COMPANY_PASSWORD})`)
  console.log(`   Products  -> ${createdProducts.length}`)
  console.log(`   Customers -> ${customers.length} (login: any customer email / ${CUSTOMER_PASSWORD})`)
  console.log(`   Orders    -> ${orders.length}`)
  console.log(`   Applications -> ${apps.length} (${pendingCompanies.length} pending)`)
  console.log(`   Product requests -> ${requests.length} pending`)
  console.log("   Admin -> admin@ecomart.com / admin123")
  console.log("   Company emails: " + companies.map((c) => c.email).join(", "))

  await mongoose.connection.close()
  process.exit(0)
}

run().catch((err) => {
  console.error("Seed failed:", err)
  process.exit(1)
})
