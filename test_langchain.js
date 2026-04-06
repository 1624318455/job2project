const { ChatOpenAI } = require('@langchain/openai');

async function test() {
  const llm = new ChatOpenAI({
    apiKey: '8ec0739d534540b4ad4e36ed1f5d1cb6.KLyPOylmIPZOPj9D',
    model: 'glm-4-flash',
    configuration: {
      baseURL: 'https://open.bigmodel.cn/api/paas/v4',
    },
    temperature: 0.7,
    maxTokens: 100,
  });

  try {
    const res = await llm.invoke('你好，请回复OK');
    console.log('SUCCESS:', res.content);
  } catch (e) {
    console.error('ERROR:', e.message);
  }
}

test();
