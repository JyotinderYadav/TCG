import { GoogleGenAI } from '@google/genai'
import dotenv from 'dotenv'

dotenv.config({ path: '/Users/jyotinderyadav/alokrepo/Automatic_Testcase_Generator/server/.env' })

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

async function run() {
  try {
    for await (const model of await ai.models.list()) {
      if (model.name.includes('flash')) console.log(model.name);
    }
  } catch (err) {
    console.error(err);
  }
}
run()
