const cheerio = require('cheerio');

async function testExtract(url) {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
    'Cache-Control': 'max-age=0',
    'Sec-Ch-Ua': '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"Windows"',
    'Upgrade-Insecure-Requests': '1'
  };

  const res = await fetch(url, { headers });
  const html = await res.text();
  const $ = cheerio.load(html);

  $("script, style, iframe, .ads, .comment, noscript, nav, header, footer").remove();

  let contentNode = null;
  const knownSelectors = [
    '#chapter-c', '.chapter-c', '.chapter-content', '#chr-content', 
    '.reading-content', '#box-chap', '.nd-chap', 'div[itemprop="articleBody"]',
    '.txt-body'
  ];

  for (const sel of knownSelectors) {
    if ($(sel).length > 0) {
      contentNode = $(sel).first();
      console.log(`Found selector: ${sel}`);
      break;
    }
  }

  if (!contentNode) {
    let maxP = 0;
    let targetDiv = null;
    $("div, article, section").each((_, el) => {
      const pCount = $(el).find("p").length;
      if (pCount > maxP) {
        maxP = pCount;
        targetDiv = el;
      }
    });
    console.log(`Fallback found maxP=${maxP}`);
    if (targetDiv && maxP > 2) {
      contentNode = $(targetDiv);
    } else {
      contentNode = $("body");
    }
  }

  let contentTexts = [];
  contentNode.find("p").each((_, el) => {
    const text = $(el).text().trim();
    const lower = text.toLowerCase();
    if (
      text.length > 5 &&
      !lower.includes("chương trước") &&
      !lower.includes("chương tiếp") &&
      !lower.includes("đọc truyện tại")
    ) {
      contentTexts.push(text);
    }
  });

  if (contentTexts.length === 0) {
    console.log('No <p> tags, trying <br>');
    const rawHtml = contentNode.html() || "";
    rawHtml.split(/<br\s*\/?>/i).forEach((frag) => {
      const t = cheerio.load(frag).text().trim();
      const lower = t.toLowerCase();
      if (
        t.length > 5 &&
        !lower.includes("chương trước") &&
        !lower.includes("chương tiếp") &&
        !lower.includes("đọc truyện tại")
      ) {
        contentTexts.push(t);
      }
    });
  }

  const fullText = contentTexts.join("\\n\\n");
  console.log(`URL: ${url}`);
  console.log(`Extracted length: ${fullText.length}`);
  console.log(`Preview: ${fullText.substring(0, 100)}...`);
  console.log('---------------------------');
}

(async () => {
  await testExtract('https://metruyenchu.com.vn/nguoi-tren-van-nguoi/chuong-1200-q8Cx_55CJLeh');
  await testExtract('https://wattpad.com.vn/nguoi-tren-van-nguoi/chuong-1176-yYHexXYBZWeJ');
})();
