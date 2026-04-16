import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { chunkText } from "@/utils/chunkText";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  // ===== 1. CÀO TEXT TỪ WEBSITE =====
  let fullText = "";
  try {
    const fetchWithFallback = async (target: string) => {
      const headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
        "Cache-Control": "max-age=0",
        "Sec-Ch-Ua": '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": '"Windows"',
        "Upgrade-Insecure-Requests": "1"
      };

      let response = await fetch(target, { headers });
      if (response.ok) return await response.text();

      if (response.status === 403 || response.status === 503) {
         console.warn(`Direct fetch failed with ${response.status}. Using Proxy 1...`);
         const proxy1 = await fetch(`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(target)}`, { headers });
         if (proxy1.ok) return await proxy1.text();

         console.warn(`Proxy 1 failed. Using allorigins...`);
         const proxy2 = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(target)}`);
         if (proxy2.ok) {
            const data = await proxy2.json();
            if (data.contents) return data.contents;
         }
      }

      throw new Error(`Failed to fetch url: ${response.status}`);
    };

    const html = await fetchWithFallback(url);
    const $ = cheerio.load(html);

    // Quét rác
    $("script, style, iframe, .ads, .comment, noscript, nav, header, footer").remove();

    let contentNode: any = null;
    const knownSelectors = [
      '#chapter-c', '.chapter-c', '.chapter-content', '#chr-content', 
      '.reading-content', '#box-chap', '.nd-chap', 'div[itemprop="articleBody"]',
      '.txt-body'
    ];
    for (const sel of knownSelectors) {
      if ($(sel).length > 0) {
        contentNode = $(sel).first();
        break;
      }
    }
    
    if (!contentNode) {
      let maxP = 0;
      let targetDiv = null;
      $("div, article, section").each((_: number, el: any) => {
        const pCount = $(el).find("p").length;
        if (pCount > maxP) {
          maxP = pCount;
          targetDiv = el;
        }
      });
      contentNode = targetDiv && maxP > 2 ? $(targetDiv) : $("body");
    }

    let contentTexts: string[] = [];
    contentNode.find("p").each((_: number, el: any) => {
      const text = $(el).text().trim();
      const lower = text.toLowerCase();
      if (text.length > 5 && !lower.includes("chương trước") && !lower.includes("chương tiếp")) {
        contentTexts.push(text);
      }
    });

    if (contentTexts.length === 0) {
      const rawHtml = contentNode.html() || "";
      rawHtml.split(/<br\s*\/?>/i).forEach((frag: string) => {
        const t = cheerio.load(frag).text().trim();
        const lower = t.toLowerCase();
        if (t.length > 5 && !lower.includes("chương trước") && !lower.includes("chương tiếp")) {
          contentTexts.push(t);
        }
      });
    }

    fullText = contentTexts.join("\n\n");
    if (!fullText || fullText.length < 50) throw new Error("Empty text chunks");
  } catch (error) {
    return NextResponse.json({ error: "Failed to scrape novel text" }, { status: 500 });
  }

  // ===== 2. BĂM CHUNKS VÀ GỌI GOOGLE TTS SONG SONG =====
  try {
    const chunks = chunkText(fullText, 200);
    
    // Tải toàn bộ Audio từ Google (Giới hạn batch để tránh block API nếu quá dài, thường 1 chương < 100 đoạn)
    const audioBuffers: Buffer[] = await Promise.all(
      chunks.map(async (chunk) => {
        const googleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=vi&client=tw-ob`;
        const res = await fetch(googleUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            "Referer": "https://translate.google.com/",
          },
        });
        if (!res.ok) throw new Error("Google API error");
        const arrayBuffer = await res.arrayBuffer();
        return Buffer.from(arrayBuffer);
      })
    );

    // Kỹ thuật nối MP3 thần thánh (Buffer Concat)
    const finalAudioBuffer = Buffer.concat(audioBuffers);

    // Đẩy trả stream MP3 hoàn chỉnh về client
    return new NextResponse(finalAudioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": finalAudioBuffer.length.toString(),
        "Accept-Ranges": "bytes", // Để HĐH hỗ trợ Tua
        "Cache-Control": "public, max-age=86400", // Cache mạnh trên Vercel Edge 24h
      },
    });

  } catch (error: any) {
    console.error("TTS Builder Error:", error);
    return NextResponse.json({ error: "Failed to build MP3" }, { status: 500 });
  }
}
