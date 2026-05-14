const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const laws = {
  lastUpdated: new Date().toISOString(),
  constitution: '',
  laborCode: '',
  civilProcedureCode: '',
  sources: []
};

async function fetchLaw(url, name) {
  try {
    console.log(`Загрузка: ${name} - ${url}`);
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      timeout: 60000
    });
    
    const $ = cheerio.load(response.data);
    
    $('script, style, nav, header, footer, .menu, .navigation').remove();
    
    let text = '';
    const contentDiv = $('.content, .article, .document-content, #content, main');
    if (contentDiv.length) {
      text = contentDiv.text();
    } else {
      text = $('body').text();
    }
    
    text = text.replace(/\s+/g, ' ').trim();
    
    laws[name] = text.substring(0, 60000);
    laws.sources.push({ name, url, status: 'ok', size: text.length });
    console.log(`✅ Загружено: ${name} (${text.length} символов)`);
    
  } catch (error) {
    console.log(`❌ Ошибка: ${name} - ${error.message}`);
    laws.sources.push({ name, url, status: 'error', error: error.message });
    laws[name] = `Ошибка загрузки: ${error.message}`;
  }
}

async function main() {
  console.log('🚀 Начинаю загрузку законов из arlis.am...');
  console.log('📅 Дата и время:', new Date().toLocaleString());
  console.log('---');
  
  await fetchLaw('https://www.arlis.am/hy/acts/1/latest', 'constitution');
  await fetchLaw('https://www.arlis.am/hy/acts/221446/latest', 'laborCode');
  await fetchLaw('https://www.arlis.am/hy/acts/224140/latest', 'civilProcedureCode');
  
  console.log('---');
  console.log('💾 Сохраняем законы в laws.json');
  fs.writeFileSync('laws.json', JSON.stringify(laws, null, 2));
  console.log('✅ Готово!');
  console.log('📅 Дата последнего обновления:', laws.lastUpdated);
  console.log('📊 Статистика:');
  laws.sources.forEach(s => {
    console.log(`   - ${s.name}: ${s.status === 'ok' ? 'OK (' + (s.size || '?') + ' симв.)' : 'ОШИБКА: ' + s.error}`);
  });
}

main();
