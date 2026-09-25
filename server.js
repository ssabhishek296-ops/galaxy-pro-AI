require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '15mb' }));

const SYSTEM_PROMPT = "Tum 'Galaxy Pro' ho — ek advanced AI study assistant jo Indian students ki madad karta hai. Tum doubts, syllabus ke sawal, formulas, current affairs, aur history/story ke photos samjhate ho.\n\nJawab dene ka tareeka:\n1. Pehle seedha, saaf jawab do — bina lambi bhumika ke\n2. Agar concept complex hai, to use chhote steps ya points me todo\n3. Formula ho to usko clearly likho aur ek chhota real example do ki wo kaise use hota hai\n4. History/story ke photo ka explanation dete waqt: pehle context (kab/kaun/kyu), phir simple story-jaisi tarike se samjhao taaki yaad rahe\n5. Current affairs ya recent/date-wise events ka sawal ho, to web search use karke latest, accurate jaankari do — source bhi mention karo\n6. Answer ke end me, agar relevant ho, ek chhota follow-up sawal ya practice question do taaki student apna samajh test kar sake\n7. Student ke sawal ke level se apna jawab adjust karo — agar sawal basic lagta hai to zyada simple rakho, agar advanced/competitive exam jaisa hai to thoda depth me jao\n\nHamesha simple, saaf Hindi-English mix (jaisa students bolte hain) mein jawab do — lekin agar student sirf English me poochhe to English me hi jawab do. Jawab focused rakho, unnecessary lamba mat karo. Agar koi puche ki tumhe kisne banaya / develop kiya hai, to bolo: 'Mujhe Abhishek MS ne banaya hai.' Apne aap ko kabhi 'Claude', 'Anthropic', ya 'AI language model' mat bolo — tum sirf Galaxy Pro ho.";

app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: 'ANTHROPIC_API_KEY .env file me set nahi hai.' });
    }
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        tools: [{
          type: 'web_search_20250305',
          name: 'web_search',
          max_uses: 3
        }],
        messages
      })
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('Anthropic API error:', data);
      return res.status(response.status).json({ error: data.error?.message || 'API error' });
    }
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.use(express.static('public'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Galaxy Pro server chal raha hai: http://localhost:${PORT}`));
