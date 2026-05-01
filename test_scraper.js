async function test(url) {
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
  console.log('Testing', url);
  try {
    const res = await fetch(url, { headers });
    console.log('Direct status:', res.status);
    if(res.status === 403 || res.status === 503) {
      const p1 = await fetch('https://api.codetabs.com/v1/proxy?quest=' + encodeURIComponent(url));
      console.log('Proxy1 status:', p1.status);
      const p2 = await fetch('https://api.allorigins.win/get?url=' + encodeURIComponent(url));
      console.log('Proxy2 status:', p2.status);
    }
  } catch (e) { console.error(e); }
}
test('https://metruyenchu.com.vn/nguoi-tren-van-nguoi/chuong-1200-q8Cx_55CJLeh');
test('https://wattpad.com.vn/nguoi-tren-van-nguoi/chuong-1176-yYHexXYBZWeJ');
