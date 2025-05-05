
const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const { Configuration, OpenAIApi } = require('openai');
const cors = require('cors');
require('dotenv').config();

const app = express();
const upload = multer();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function analyzeResume(resumeText, jobDescription, mandatorySkills, goodToHaveSkills, requiredExperience) {
  const messages = [
    {
      role: "system",
      content: "You are a resume analyzer. Based on the job description and candidate resume, assess fit and return match percentage and justification."
    },
    {
      role: "user",
      content: `Job Description: ${jobDescription}
Mandatory Skills: ${mandatorySkills.join(', ')}
Good-to-Have Skills: ${goodToHaveSkills.join(', ')}
Required Experience: ${requiredExperience}

Resume Text: ${resumeText}

Please respond in JSON format with 'matchPercentage' and 'justification'.`
    }
  ];

  const response = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages,
    max_tokens: 300,
  });

  try {
    return JSON.parse(response.data.choices[0].message.content);
  } catch (error) {
    console.error("OpenAI response parsing error:", error);
    return { matchPercentage: 0, justification: "Error analyzing resume." };
  }
}

app.post("/analyze", async (req, res) => {
  const { jobDescription, mandatorySkills, goodToHaveSkills, requiredExperience, resumeText } = req.body;

  if (!resumeText) {
    return res.status(400).json({ matchPercentage: 0, justification: "No resume text provided." });
  }

  try {
    const analysis = await analyzeResume(
      resumeText,
      jobDescription,
      mandatorySkills,
      goodToHaveSkills,
      requiredExperience
    );
    res.json(analysis);
  } catch (err) {
    console.error("Analysis error:", err);
    res.status(500).json({ matchPercentage: 0, justification: "Error processing this resume." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
