const PRODUCT_TASK_SETS = [
  {
    title: 'Women\'s Jacket',
    image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=80',
    category: 'Clothing',
    store: 'Official Clothing Store',
    city: 'Mall Order',
    basePrice: 58,
    badge: 'HOT',
  },
  {
    title: 'Running Shoes',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
    category: 'Shoes',
    store: 'Official Sneaker Store',
    city: 'Mall Order',
    basePrice: 72,
    badge: 'NEW',
  },
  {
    title: 'Handbag',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
    category: 'Bags',
    store: 'Official Bag Store',
    city: 'Mall Order',
    basePrice: 168,
    badge: 'VIP',
  },
  {
    title: 'Casual Shoes',
    image: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=800&q=80',
    category: 'Shoes',
    store: 'Brand Shoes Store',
    city: 'Mall Order',
    basePrice: 96,
    badge: 'HOT',
  },
  {
    title: 'Men\'s Hoodie',
    image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80',
    category: 'Clothing',
    store: 'Streetwear Store',
    city: 'Mall Order',
    basePrice: 88,
    badge: 'NEW',
  },
  {
    title: 'Women\'s Dress',
    image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80',
    category: 'Clothing',
    store: 'Fashion Boutique',
    city: 'Mall Order',
    basePrice: 76,
    badge: 'HOT',
  },
  {
    title: 'Leather Backpack',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
    category: 'Bags',
    store: 'Travel Goods Store',
    city: 'Mall Order',
    basePrice: 134,
    badge: 'TOP',
  },
  {
    title: 'Baseball Cap',
    image: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=800&q=80',
    category: 'Accessories',
    store: 'Accessories Store',
    city: 'Mall Order',
    basePrice: 42,
    badge: 'NEW',
  },
  {
    title: 'Sports Set',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
    category: 'Clothing',
    store: 'Fitness Apparel Store',
    city: 'Mall Order',
    basePrice: 118,
    badge: 'HOT',
  },
  {
    title: 'Wallet',
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80',
    category: 'Bags',
    store: 'Leather Goods Store',
    city: 'Mall Order',
    basePrice: 64,
    badge: 'TOP',
  },
]

const COLORS = ['Black', 'White', 'Grey', 'Beige', 'Blue', 'Pink', 'Brown', 'Khaki']
const SIZES = ['S', 'M', 'L', 'XL', '39', '40', '41', '42', 'One Size']
const QUANTITIES = [1, 1, 1, 2]

function buildTask(seed, config) {
  const variants = ['Mall Purchase', 'Store Order', 'Product Order', 'Shopping Task', 'Online Order']
  const proofSets = [
    ['Order Screenshot', 'Shipping Info Required'],
    ['Receiver Details', 'Phone Number Required'],
    ['Address Submission', 'Order Confirmation'],
    ['Product Link', 'Shipping Info Required'],
    ['Contact Info', 'Delivery Address'],
  ]
  const title = `${config.title} ${variants[seed % variants.length]}`
  const price = config.basePrice + (seed % 7) * 6
  const verified = proofSets[seed % proofSets.length]
  const time = `${10 + (seed % 6) * 3} mins`
  const color = COLORS[seed % COLORS.length]
  const size = config.category === 'Bags' || config.category === 'Accessories'
    ? 'One Size'
    : SIZES[seed % (SIZES.length - 1)]
  const quantity = QUANTITIES[seed % QUANTITIES.length]
  const sku = `SKU-${config.category.slice(0, 3).toUpperCase()}-${1000 + seed}`
  const shopName = `${config.store} Flagship Shop`

  return {
    id: 101 + seed,
    title,
    price,
    location: config.store,
    badge: config.badge,
    image: config.image,
    verified,
    description: `Help place an order for the ${config.title.toLowerCase()} product in the online shop. After claiming the task, submit consignee name, phone number, and full shipping address to complete the order request.`,
    rating: Number((4.5 + ((seed % 5) * 0.1)).toFixed(1)),
    commission: `$${price}`,
    time,
    city: config.city,
    type: config.category,
    color,
    size,
    quantity,
    sku,
    shopName,
  }
}

export const tasks = Array.from({ length: 55 }, (_, index) => {
  const config = PRODUCT_TASK_SETS[index % PRODUCT_TASK_SETS.length]
  return buildTask(index, config)
})

export const tabs = [
  { key: 'home', label: 'Home', title: 'Home', icon: 'home' },
  { key: 'tasks', label: 'Tasks', title: 'Task Hall', icon: 'tasks' },
  { key: 'task-center', label: 'Task Center', title: 'Task Center', icon: 'feed' },
  { key: 'support', label: 'Support', title: 'Customer Service', icon: 'support' },
  { key: 'profile', label: 'Profile', title: 'Profile', icon: 'user' },
]

export const tickerItems = [
  'User A862 completed a women\'s jacket order and earned $120',
  'User M118 confirmed a sneaker order and withdrew $460',
  'User K520 grabbed a clothing mall order and earned $188',
  'User P903 completed 7 product purchase tasks in a row and received $66',
]

export const featuredTasks = tasks.slice(0, 3).map((task) => ({
  id: task.id,
  title: task.title,
  price: task.price,
  tag: task.badge,
  city: task.city,
  image: task.image,
}))

export const taskFilters = ['All', 'Clothing', 'Shoes', 'Bags', 'Accessories']

export const earningsFeed = [
  {
    id: 1,
    user: 'User A862',
    amount: '$120',
    text: 'Completed a women\'s clothing order task and received the commission successfully.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    image: tasks[0].image,
  },
  {
    id: 2,
    user: 'User K520',
    amount: '$188',
    text: 'Finished a sneaker mall order and submitted delivery details smoothly.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    image: tasks[1].image,
  },
]

export const leaderboard = [
  { id: 1, name: 'Aurora', level: 'VIP3', amount: '$4,820' },
  { id: 2, name: 'Mason', level: 'VIP2', amount: '$3,760' },
  { id: 3, name: 'Olivia', level: 'VIP2', amount: '$3,140' },
  { id: 4, name: 'Ethan', level: 'VIP1', amount: '$2,580' },
]
