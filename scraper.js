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
      timeout: 30000
    });
    
    const $ = cheerio.load(response.data);
    let text = $('body').text();
    text = text.replace(/\s+/g, ' ').trim();
    
    laws[name] = text.substring(0, 50000);
    laws.sources.push({ name, url, status: 'ok' });
    console.log(`✅ Загружено: ${name}`);
  } catch (error) {
    console.log(`❌ Ошибка: ${name} - ${error.message}`);
    laws.sources.push({ name, url, status: 'error', error: error.message });
  }
}

async function main() {
  console.log('🚀 Начинаю загрузку законов...');
  
  await fetchLaw('https://www.arlis.am/DocumentView.aspx?DocID=1', 'constitution');
  await fetchLaw('https://www.arlis.am/DocumentView.aspx?DocID=2', 'laborCode');
  await fetchLaw('https://www.arlis.am/DocumentView.aspx?DocID=3', 'civilCode');
  
  fs.writeFileSync('laws.json', JSON.stringify(laws, null, 2));
  console.log('💾 Законы сохранены в laws.json');
  console.log('📅 Дата обновления:', laws.lastUpdated);
}

main();
