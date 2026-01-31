export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { image, mimeType } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  // Mock response for fallback or video (since inline video is limited/complex for this demo)
  const mockResponse = {
    title: "Amazing Moment Captured",
    description: "Check out this incredible view! 🌟 The colors are absolutely stunning and the vibe is unmatched. Perfect for a weekend getaway. 📸✨",
    hashtags: "#vibes #travel #photography #moments #lifeisgood"
  };

  if (mimeType && mimeType.startsWith('video')) {
    // For video, real analysis requires uploading to Google File API first.
    // For this prototype, we will return the mock response with a video-specific tweak.
    return res.status(200).json({
      title: "Epic Video Highlight",
      description: "Watch this amazing moment unfold! 🎥✨ Truly an unforgettable experience captured on camera.",
      hashtags: "#video #viral #trending #mustwatch #epic"
    });
  }

  if (!apiKey) {
    console.log("No GEMINI_API_KEY found, using mock response.");
    return res.status(200).json(mockResponse);
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              text: "Analyze this image and provide a catchy title, a detailed description suitable for social media (Facebook/Instagram) that is engaging, and 5-10 relevant hashtags. Return ONLY a valid JSON object with keys: 'title', 'description', 'hashtags'. Do not use Markdown formatting in the response."
            },
            {
              inline_data: {
                mime_type: mimeType || 'image/jpeg',
                data: image
              }
            }
          ]
        }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'API request failed');
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      throw new Error('No text generated');
    }

    // Attempt to parse JSON from the text
    // API might return ```json ... ``` or just the json
    let jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    let result;
    try {
      result = JSON.parse(jsonStr);
    } catch (e) {
      // If not valid JSON, just return the text as description
      result = {
        title: "AI Analysis Result",
        description: text,
        hashtags: "#ai #generated"
      };
    }

    return res.status(200).json(result);

  } catch (error) {
    console.error('Gemini API Error:', error);
    // Fallback to mock if API fails
    return res.status(200).json(mockResponse);
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};
