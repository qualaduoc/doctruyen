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
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch HTML");
    }

    const html = await response.text();
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
