export const tabs = [
  { key: 'home', label: 'Home', title: 'Home', icon: 'home' },
  { key: 'tasks', label: 'Tasks', title: 'Task Hall', icon: 'tasks' },
  { key: 'earnings', label: 'Earnings', title: 'Earnings', icon: 'feed' },
  { key: 'leaderboard', label: 'Rank', title: 'Leaderboard', icon: 'rank' },
  { key: 'profile', label: 'Profile', title: 'Profile', icon: 'user' },
]

export const tickerItems = [
  'User A862 completed 8 orders today and earned $120',
  'User M118 withdrew $460 today and it has arrived',
  'User K520 grabbed a high-commission task and earned $188',
  'User P903 checked in for 7 straight days and received $66',
]

export const featuredTasks = [
  {
    id: 1,
    title: 'Brand Store Visit',
    price: 128,
    tag: 'HOT',
    city: 'Shanghai',
    image:
      'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 2,
    title: 'Short Video Voiceover Trial',
    price: 86,
    tag: 'NEW',
    city: 'Hangzhou',
    image:
      'https://images.unsplash.com/photo-1494173853739-c21f58b16055?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 3,
    title: 'Premium Dining Shoot',
    price: 200,
    tag: 'HOT',
    city: 'Shenzhen',
    image:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
  },
]

export const taskFilters = ['All', 'High Pay', 'Easy', 'Nearby']

export const tasks = [
  {
    id: 101,
    title: 'Store Check-in Shoot',
    price: 58,
    location: 'Pudong',
    badge: 'HOT',
    image:
      'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=800&q=80',
    verified: ['Verified', 'Video Verified'],
    description: 'Visit the store, complete the required camera shots, and submit a review. Great for beginners with fast approval.',
    rating: 4.8,
    commission: '$58',
    time: '25 mins',
    city: 'Shanghai',
    type: 'Nearby',
  },
  {
    id: 102,
    title: 'App New User Trial',
    price: 18,
    location: 'Online',
    badge: 'NEW',
    image:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
    verified: ['Verified'],
    description: 'Download the app and complete the onboarding process to get paid. Simple and ideal for spare time.',
    rating: 4.6,
    commission: '$18',
    time: '8 mins',
    city: 'Nationwide',
    type: 'Easy',
  },
  {
    id: 103,
    title: 'High-Commission Store Video',
    price: 168,
    location: 'Tianhe',
    badge: 'HOT',
    image:
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80',
    verified: ['Verified', 'Video Verified'],
    description: 'Create and upload a 30-second video clip. High commission task and must follow the given template.',
    rating: 4.9,
    commission: '$168',
    time: '45 mins',
    city: 'Guangzhou',
    type: 'High Pay',
  },
  {
    id: 104,
    title: 'Coffee Shop Review',
    price: 36,
    location: 'Futian',
    badge: 'NEW',
    image:
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80',
    verified: ['Verified'],
    description: 'Make a purchase in-store, upload your receipt, and submit your experience review for same-day approval.',
    rating: 4.7,
    commission: '$36',
    time: '20 mins',
    city: 'Shenzhen',
    type: 'Nearby',
  },
  {
    id: 105,
    title: 'Livestream Engagement Task',
    price: 22,
    location: 'Online',
    badge: 'HOT',
    image:
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80',
    verified: ['Verified'],
    description: 'Enter the assigned livestream, complete engagement actions, and submit screenshots for review.',
    rating: 4.5,
    commission: '$22',
    time: '12 mins',
    city: 'Nationwide',
    type: 'Easy',
  },
  {
    id: 106,
    title: 'Brand Event Co-shoot',
    price: 120,
    location: 'Xihu',
    badge: 'NEW',
    image:
      'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
    verified: ['Verified', 'Video Verified'],
    description: 'Assist with offline brand event shooting and upload the media files. Stable payout and clear workflow.',
    rating: 4.9,
    commission: '$120',
    time: '50 mins',
    city: 'Hangzhou',
    type: 'High Pay',
  },
]

export const earningsFeed = [
  {
    id: 1,
    user: 'Luna_88',
    amount: '$300',
    text: 'Finished 3 high-commission tasks today. Energy is high and I am going for more tonight.',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    image:
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 2,
    user: 'MasonGo',
    amount: '$188',
    text: 'My video verification task was approved and the payout arrived very quickly.',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    image:
      'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 3,
    user: 'CiciWin',
    amount: '$520',
    text: 'Daily check-in bonuses and task rewards were settled together today. New personal record.',
    avatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80',
    image:
      'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=800&q=80',
  },
]

export const leaderboard = [
  { id: 1, name: 'Nova Gold', amount: '$8,820', level: 'Top 1' },
  { id: 2, name: 'Aiden Pro', amount: '$7,460', level: 'Top 2' },
  { id: 3, name: 'Vivi Task King', amount: '$6,980', level: 'Top 3' },
  { id: 4, name: 'Jay HighPay', amount: '$6,210', level: 'Top 4' },
  { id: 5, name: 'Mia Rising', amount: '$5,860', level: 'Top 5' },
]

export const profileStats = [
  { label: 'Balance', value: '$1,286' },
  { label: 'Monthly Earnings', value: '$3,920' },
  { label: 'Withdrawable', value: '$860' },
]
