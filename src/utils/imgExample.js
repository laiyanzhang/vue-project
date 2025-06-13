const examples = [
  'https://insight-gpt.oss-cn-shenzhen.aliyuncs.com/post/20250609/China (2).png',
  'https://insight-gpt.oss-cn-shenzhen.aliyuncs.com/post/20250609/China (1).png',
  'https://insight-gpt.oss-cn-shenzhen.aliyuncs.com/post/20250609/China (3).png',
  'https://insight-gpt.oss-cn-shenzhen.aliyuncs.com/post/20250609/high (13).png',
  'https://insight-gpt.oss-cn-shenzhen.aliyuncs.com/post/20250609/high (19).png',
  'https://insight-gpt.oss-cn-shenzhen.aliyuncs.com/post/20250609/high (16).png',
  'https://insight-gpt.oss-cn-shenzhen.aliyuncs.com/post/20250609/concise (1).jpg',
  'https://insight-gpt.oss-cn-shenzhen.aliyuncs.com/post/20250609/concise (1).png',
  'https://insight-gpt.oss-cn-shenzhen.aliyuncs.com/post/20250609/concise (2).png',
  'https://insight-gpt.oss-cn-shenzhen.aliyuncs.com/post/20250609/ins (22).png',
  'https://insight-gpt.oss-cn-shenzhen.aliyuncs.com/post/20250609/ins (23).png',
  'https://insight-gpt.oss-cn-shenzhen.aliyuncs.com/post/20250609/ins (1).png'
]

export function getImg(start, end) {
  return examples.slice(start, end)
}