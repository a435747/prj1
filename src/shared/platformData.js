import {
  earningsFeed,
  leaderboard,
  profileStats,
  tasks,
  tickerItems,
} from '../data/mock.js'

export const initialPlatformData = {
  homeStats: [
    { label: '今日收益', value: '$286', sub: '+12.8%' },
    { label: '在线人数', value: '18,426', sub: '实时在线' },
  ],
  tickerItems,
  featuredTasks: tasks.slice(0, 3).map((task) => ({
    id: task.id,
    title: task.title,
    price: task.price,
    tag: task.badge,
    city: task.city,
    image: task.image,
  })),
  quickStats: profileStats.map((item, index) => ({
    label: ['Balance', 'Completed', 'Withdrawable'][index] ?? item.label,
    value: index === 1 ? '128' : item.value,
  })),
  taskFilters: ['全部', '高价', '简单', '附近'],
  tasks,
  earningsFeed,
  leaderboard,
  profile: {
    name: '高级会员 · Aurora',
    subtitle: '已连续活跃 29 天',
    stats: profileStats,
    menus: ['提现记录', '任务明细', '实名认证', '安全中心'],
  },
}
