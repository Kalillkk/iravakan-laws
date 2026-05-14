const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const laws = {
  lastUpdated: new Date().toISOString(),
  constitution: '',
  laborCode: '',
  civilCode: '',
  sources: []
};

async function fetchLaw(url, name) {
  try {
    console.log(`Загрузка: ${name} - ${url}`);
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 60000
    });
    
    const $ = cheerio.load(response.data);
    $('script, style, nav, header, footer, .menu').remove();
    
    let text = $('.content, .article, .document-content, #content, main').text();
    if (!text) text = $('body').text();
    
    text = text.replace(/\s+/g, ' ').trim();
    laws[name] = text.substring(0, 60000);
    laws.sources.push({ name, url, status: 'ok', size: text.length });
    console.log(`✅ Загружено: ${name} (${text.length} симв.)`);
  } catch (error) {
    console.log(`❌ Ошибка: ${name} - ${error.message}`);
    laws.sources.push({ name, url, status: 'error', error: error.message });
  }
}

async function main() {
  console.log('🚀 Загрузка законов из arlis.am...');
  
  await fetchLaw('https://www.arlis.am/hy/acts/1/latest', 'constitution');
  await fetchLaw('https://www.arlis.am/hy/acts/221446/latest', 'laborCode');
  await fetchLaw('https://www.arlis.am/hy/acts/224140/latest', 'civilCode');
  
  fs.writeFileSync('laws.json', JSON.stringify(laws, null, 2));
  console.log('✅ Готово! Дата:', laws.lastUpdated);
}

main();
