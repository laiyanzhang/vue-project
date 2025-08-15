let examples = [
  require('../assets/page1.jpeg'),
  require('../assets/page2.jpeg'),
  require('../assets/page3.jpeg'),
  require('../assets/page4.jpg'),
  require('../assets/page5.jpg'),
  require('../assets/page6.jpg'),
  require('../assets/page7.jpg'),
  require('../assets/page8.jpg'),
  require('../assets/page9.jpg'),
]

examples = examples.concat(examples)

export function getImg(start, end) {
  return examples.slice(start, end)
}