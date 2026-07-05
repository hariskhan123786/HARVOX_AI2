// Using native global fetch

async function test() {
  try {
    console.log("Fetching YouTube search results...");
    const res = await fetch('https://www.youtube.com/results?search_query=lofi+hip+hop');
    const html = await res.text();
    console.log("HTML length:", html.length);
    
    // Look for videoId in JSON
    const match = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
    if (match) {
      console.log('FOUND VIDEO ID:', match[1]);
      console.log('PLAY URL:', `https://www.youtube.com/watch?v=${match[1]}`);
    } else {
      console.log('NOT FOUND');
      // Save 1000 chars of HTML to inspect
      console.log(html.substring(0, 500));
    }
  } catch (e) {
    console.error(e);
  }
}

test();
