export function chunkText(text: string, maxLength: number = 200): string[] {
  if (!text) return [];

  // Loại bỏ các ký tự đặc biệt, khoảng trắng thừa
  const cleanText = text
    .replace(/\s+/g, " ")
    .replace(/[""]/g, '"')
    .trim();

  // Tách văn bản theo các dấu câu cơ bản: ., ?, !, ; hoặc (\n)
  // Biểu thức chính quy này sẽ giữ lại dấu câu ở cuối câu.
  const sentences = cleanText.match(/[^.?!;\n]+[.?!;\n]*/g) || [cleanText];

  const chunks: string[] = [];
  let currentChunk = "";

  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();
    if (!trimmedSentence) continue;

    // Nếu một câu đơn độc đã vượt quá ký tự cho phép, buộc phải chẻ nhỏ nó theo dấu phẩy hoặc dấu cách.
    if (trimmedSentence.length > maxLength) {
      // Trước tiên nhồi cái currentChunk vào chunks đi đã
      if (currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = "";
      }

      // Xử lý câu siêu dài
      let remaining = trimmedSentence;
      while (remaining.length > 0) {
        if (remaining.length <= maxLength) {
          chunks.push(remaining.trim());
          break;
        }

        // Tìm một dấu phẩy hoặc khoảng trắng gần nhất dưới ngưỡng maxLength
        let splitPoint = remaining.lastIndexOf(",", maxLength);
        if (splitPoint === -1) {
          splitPoint = remaining.lastIndexOf(" ", maxLength);
        }

        // Nếu không có cả dấu phẩy lẫn khoảng trắng, đành cắt cứng
        if (splitPoint === -1) {
          splitPoint = maxLength;
        } else {
          splitPoint += 1; // Bao gồm cả dấu phẩy/khoảng trắng
        }

        chunks.push(remaining.substring(0, splitPoint).trim());
        remaining = remaining.substring(splitPoint).trim();
      }
    } else {
      // Câu này độ dài an toàn
      if ((currentChunk + " " + trimmedSentence).length > maxLength) {
        chunks.push(currentChunk.trim());
        currentChunk = trimmedSentence;
      } else {
        currentChunk = currentChunk ? currentChunk + " " + trimmedSentence : trimmedSentence;
      }
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}
