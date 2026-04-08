export interface JobPlatform {
  id: string;
  name: string;
  urlPatterns: string[];
  selectors: {
    title: string;
    company: string;
    salary: string;
    location: string;
    description: string;
    requirements: string;
  };
}

export const JOB_PLATFORMS: JobPlatform[] = [
  {
    id: 'boss',
    name: 'BOSS直聘',
    urlPatterns: ['zhipin.com', 'boss.zhipin.com'],
    selectors: {
      title: '.job-title, .position-title, h1',
      company: '.company-name, .company-text',
      salary: '.salary, .job-salary',
      location: '.location-text, .job-location',
      description: '.job-detail, .description',
      requirements: '.job-tag, .requirements'
    }
  },
  {
    id: 'zhilian',
    name: '智联招聘',
    urlPatterns: ['zhaopin.com', 'job.zhaopin.com'],
    selectors: {
      title: '.job-title, .pos-title, h1',
      company: '.company-name, .corp-name',
      salary: '.salary, .job-salary',
      location: '.city, .job-city',
      description: '.job-desc, .description',
      requirements: '._require, .tag-list'
    }
  },
  {
    id: '51job',
    name: '前程无忧',
    urlPatterns: ['51job.com', 'jobs.51job.com'],
    selectors: {
      title: '.job-title, .pos_title, h1',
      company: '.company-name, .com_name',
      salary: '.salary, .job_salary',
      location: '.location, .job_city',
      description: '.job_desc, .des',
      requirements: '.tag, .require'
    }
  },
  {
    id: 'lagou',
    name: '拉勾',
    urlPatterns: ['lagou.com', 'www.lagou.com'],
    selectors: {
      title: '.job-name, .position-title, h1',
      company: '.company-name, .company',
      salary: '.salary, .job-salary',
      location: '.city, .position-city',
      description: '.job-detail, .description',
      requirements: '.tags, .label-list'
    }
  },
  {
    id: 'liepin',
    name: '猎聘',
    urlPatterns: ['liepin.com', 'www.liepin.com'],
    selectors: {
      title: '.job-title, .position-name, h1',
      company: '.company-name, .comp-name',
      salary: '.salary, .job-salary',
      location: '.location, .city-name',
      description: '.job-desc, .description',
      requirements: '.tags, .skill-tags'
    }
  }
];

export function detectPlatform(url: string): JobPlatform | null {
  for (const platform of JOB_PLATFORMS) {
    for (const pattern of platform.urlPatterns) {
      if (url.includes(pattern)) {
        return platform;
      }
    }
  }
  return null;
}

export function getPlatformById(id: string): JobPlatform | null {
  return JOB_PLATFORMS.find(p => p.id === id) || null;
}

export function getAllPlatforms(): JobPlatform[] {
  return JOB_PLATFORMS;
}
