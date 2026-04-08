const JINA_READER_API = 'https://r.jina.ai';

export interface ScrapedJob {
  title?: string;
  company?: string;
  salary?: string;
  location?: string;
  description?: string;
  requirements?: string;
  rawText?: string;
}

export async function scrapeJobFromUrl(url: string): Promise<ScrapedJob> {
  console.log('[Scraper] Scraping URL:', url);
  
  try {
    const response = await fetch(`${JINA_READER_API}/url?url=${encodeURIComponent(url)}`, {
      headers: {
        'Accept': 'text/plain',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }
    
    const text = await response.text();
    console.log('[Scraper] Scraped text length:', text.length);
    
    const job = parseJobText(text);
    job.rawText = text;
    
    return job;
  } catch (error) {
    console.error('[Scraper] Error:', error);
    throw new Error(`Failed to scrape URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function parseJobText(text: string): ScrapedJob {
  const job: ScrapedJob = {};
  
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  
  for (const line of lines) {
    if (!job.title && (line.includes('招聘') || line.includes('工程师') || line.includes('开发') || line.includes('前端') || line.includes('后端'))) {
      if (line.length < 50) {
        job.title = line;
      }
    }
    
    if (!job.company && (line.includes('公司') || line.includes('有限') || line.includes('集团'))) {
      if (line.length < 30) {
        job.company = line;
      }
    }
    
    if (!job.salary && (line.includes('K') || line.includes('k') || line.includes('薪'))) {
      if (line.match(/\d+[Kk]/)) {
        job.salary = line;
      }
    }
    
    if (!job.location && (line.includes('市') || line.includes('区') || line.includes('省'))) {
      if (line.length < 20) {
        job.location = line;
      }
    }
  }
  
  job.description = text.slice(0, 1000);
  
  return job;
}

export function isValidJobUrl(url: string): boolean {
  const jobPatterns = [
    'zhipin.com',
    'boss.zhipin.com',
    'zhaopin.com',
    '51job.com',
    'lagou.com',
    'liepin.com',
    'zhilian.com',
  ];
  
  return jobPatterns.some(pattern => url.includes(pattern));
}
