export const tabs = [
  { key: 'home', label: '首页', title: '首页', icon: 'home' },
  { key: 'tasks', label: '抢单', title: '任务大厅', icon: 'tasks' },
  { key: 'earnings', label: '收益', title: '收益动态', icon: 'feed' },
  { key: 'leaderboard', label: '排行', title: '收益排行', icon: 'rank' },
  { key: 'profile', label: '我的', title: '个人中心', icon: 'user' },
]

export const tickerItems = [
  '用户 A862 今日完成 8 单，收益 $120',
  '用户 M118 今日提现 $460 已到账',
  '用户 K520 抢到高佣任务，收益 $188',
  '用户 P903 连续 7 天打卡，奖励 $66',
]

export const featuredTasks = [
  {
    id: 1,
    title: '品牌门店探访',
    price: 128,
    tag: 'HOT',
    city: '上海',
    image:
      'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 2,
    title: '短视频口播体验',
    price: 86,
    tag: 'NEW',
    city: '杭州',
    image:
      'https://images.unsplash.com/photo-1494173853739-c21f58b16055?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 3,
    title: '高端餐饮拍摄',
    price: 200,
    tag: 'HOT',
    city: '深圳',
    image:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
  },
]

export const taskFilters = ['全部', '高价', '简单', '附近']

export const tasks = [
  {
    id: 101,
    title: '门店打卡拍摄',
    price: 58,
    location: '浦东新区',
    badge: 'HOT',
    image:
      'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=800&q=80',
    verified: ['已认证', '视频认证'],
    description: '到店完成指定机位拍摄与评价提交，适合新手，审核快。',
    rating: 4.8,
    commission: '$58',
    time: '25 分钟',
    city: '上海',
    type: '附近',
  },
  {
    id: 102,
    title: 'App 新人体验单',
    price: 18,
    location: '线上',
    badge: 'NEW',
    image:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
    verified: ['已认证'],
    description: '下载并完成新手引导即可结算，流程简单，适合碎片时间。',
    rating: 4.6,
    commission: '$18',
    time: '8 分钟',
    city: '全国',
    type: '简单',
  },
  {
    id: 103,
    title: '高佣探店视频',
    price: 168,
    location: '天河区',
    badge: 'HOT',
    image:
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80',
    verified: ['已认证', '视频认证'],
    description: '输出 30 秒视频素材并上传，任务佣金高，需按模板执行。',
    rating: 4.9,
    commission: '$168',
    time: '45 分钟',
    city: '广州',
    type: '高价',
  },
  {
    id: 104,
    title: '咖啡门店评价',
    price: 36,
    location: '福田区',
    badge: 'NEW',
    image:
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80',
    verified: ['已认证'],
    description: '到店消费后上传票据和体验反馈，当天可审核。',
    rating: 4.7,
    commission: '$36',
    time: '20 分钟',
    city: '深圳',
    type: '附近',
  },
  {
    id: 105,
    title: '直播间互动任务',
    price: 22,
    location: '线上',
    badge: 'HOT',
    image:
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80',
    verified: ['已认证'],
    description: '进入指定直播间完成互动和停留时长，提交截图即可。',
    rating: 4.5,
    commission: '$22',
    time: '12 分钟',
    city: '全国',
    type: '简单',
  },
  {
    id: 106,
    title: '品牌活动协拍',
    price: 120,
    location: '西湖区',
    badge: 'NEW',
    image:
      'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
    verified: ['已认证', '视频认证'],
    description: '配合品牌线下活动完成素材采集与上传，结算稳定。',
    rating: 4.9,
    commission: '$120',
    time: '50 分钟',
    city: '杭州',
    type: '高价',
  },
]

export const earningsFeed = [
  {
    id: 1,
    user: 'Luna_88',
    amount: '$300',
    text: '今天完成 3 个高佣单，状态拉满，晚上继续冲。',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    image:
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 2,
    user: 'MasonGo',
    amount: '$188',
    text: '视频认证任务审核通过，到账速度很快。',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    image:
      'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 3,
    user: 'Cici赚赚',
    amount: '$520',
    text: '连续签到 + 任务奖励一起结算，今天破纪录。',
    avatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80',
    image:
      'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=800&q=80',
  },
]

export const leaderboard = [
  { id: 1, name: 'Nova金牌', amount: '$8,820', level: 'Top 1' },
  { id: 2, name: 'Aiden Pro', amount: '$7,460', level: 'Top 2' },
  { id: 3, name: 'Vivi任务王', amount: '$6,980', level: 'Top 3' },
  { id: 4, name: 'Jay高佣', amount: '$6,210', level: 'Top 4' },
  { id: 5, name: 'Mia冲榜', amount: '$5,860', level: 'Top 5' },
]

export const profileStats = [
  { label: '账户余额', value: '$1,286' },
  { label: '本月收益', value: '$3,920' },
  { label: '可提现', value: '$860' },
]
