export function calculateReadingTime(text: string): number {
  // Count Chinese characters + English words
  const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
  const englishWords = text.replace(/[\u4e00-\u9fff]/g, '').trim().split(/\s+/).filter(Boolean).length;
  const totalWords = chineseChars + englishWords;
  const wordsPerMinute = 300; // ~300 Chinese chars per minute
  return Math.max(1, Math.ceil(totalWords / wordsPerMinute));
}

export function getWordCount(text: string): number {
  const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
  const englishWords = text.replace(/[\u4e00-\u9fff]/g, '').trim().split(/\s+/).filter(Boolean).length;
  return chineseChars + englishWords;
}
