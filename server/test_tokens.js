import { GoogleGenAI } from '@google/genai'
import dotenv from 'dotenv'

dotenv.config()

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

async function run() {
  try {
    const res = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Write a long essay about space. Make it at least 5 paragraphs and very detailed.',
      config: {
        maxOutputTokens: 3000
      }
    })
    console.log("Text length:", res.text?.length)
    console.log("Finish Reason:", res.candidates[0].finishReason)
  } catch (err) {
    console.error(err)
  }
}
run()
