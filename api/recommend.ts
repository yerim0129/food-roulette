import type { VercelRequest, VercelResponse } from '@vercel/node'

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string
      }>
    }
  }>
  error?: {
    message: string
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS 설정
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { foodName, category } = req.body

  if (!foodName) {
    return res.status(400).json({ error: 'foodName is required' })
  }

  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    // API 키 없으면 기본 메시지 반환
    return res.status(200).json({
      message: getDefaultMessage(foodName),
      isAI: false,
    })
  }

  try {
    const prompt = `당신은 음식 추천 도우미입니다.
사용자가 "${foodName}"${category ? ` (${category})` : ''}을(를) 선택했습니다.
이 음식에 대해 재미있고 긍정적인 한줄 추천 멘트를 작성해주세요.
- 20-40자 내외로 짧게
- 이모지 1-2개 포함
- 친근하고 유쾌한 톤
- 음식의 특징이나 어울리는 상황 언급

예시: "추운 날씨에 딱! 뜨끈한 국물로 몸도 마음도 따뜻하게 🔥"

멘트만 출력하세요:`

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 100,
        },
      }),
    })

    const data: GeminiResponse = await response.json()

    if (data.error) {
      console.error('Gemini API Error:', data.error.message)
      return res.status(200).json({
        message: getDefaultMessage(foodName),
        isAI: false,
      })
    }

    const aiMessage = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()

    if (!aiMessage) {
      return res.status(200).json({
        message: getDefaultMessage(foodName),
        isAI: false,
      })
    }

    return res.status(200).json({
      message: aiMessage,
      isAI: true,
    })
  } catch (error) {
    console.error('AI recommendation error:', error)
    return res.status(200).json({
      message: getDefaultMessage(foodName),
      isAI: false,
    })
  }
}

// API 키 없거나 에러 시 기본 메시지
function getDefaultMessage(foodName: string): string {
  const messages = [
    `오늘의 선택 ${foodName}! 맛있게 드세요 😋`,
    `${foodName} 어떠세요? 좋은 선택이에요! 👍`,
    `${foodName}(으)로 결정! 든든한 한 끼 되세요 🍽️`,
    `오늘은 ${foodName}! 맛있는 식사 되세요 ✨`,
  ]
  return messages[Math.floor(Math.random() * messages.length)] as string
}
