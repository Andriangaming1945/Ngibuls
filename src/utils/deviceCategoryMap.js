const RULES = [
  { category: 'Pendingin', keywords: ['ac', 'kipas', 'kulkas', 'freezer'] },
  { category: 'Dapur', keywords: ['rice cooker', 'magic com', 'oven', 'microwave', 'kompor listrik', 'blender'] },
  { category: 'Peralatan Air', keywords: ['dispenser', 'pompa air', 'water heater', 'pemanas air'] },
  { category: 'Elektronik', keywords: ['laptop', 'tv', 'komputer', 'pc', 'charger', 'router', 'playstation', 'ps4', 'ps5', 'setrika'] },
  { category: 'Pencahayaan', keywords: ['lampu', 'led'] },
]

export function getCategoryForDevice(name = '') {
  const n = name.toLowerCase()
  for (const rule of RULES) {
    if (rule.keywords.some((kw) => n.includes(kw))) return rule.category
  }
  return 'Lainnya'
}