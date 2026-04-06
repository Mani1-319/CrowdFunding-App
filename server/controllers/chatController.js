const getChatResponse = async (req, res) => {
  const { prompt } = req.body;
  
  if (!prompt) {
    return res.status(400).json({ message: "Prompt is required" });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    // Graceful offline fail-safe
    return res.json({
      reply: "The AI assistant is securely offline because the GEMINI_API_KEY is not configured in the server environment. Please reach out to the Contact page if you need immediate assistance."
    });
  }

  try {
    const aiPrompt = `You are a helpful, professional AI assistant for the 'Donte' crowdfunding platform. Keep your answers concise, informative, and formatted well. The user's question is: ${prompt}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
    // Utilize native Fetch to prevent dependencies crashing
    const fetchRes = await globalThis.fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [{ text: aiPrompt }]
        }],
        generationConfig: {
          maxOutputTokens: 250,
          temperature: 0.7
        }
      })
    });

    const data = await fetchRes.json();

    if (!fetchRes.ok) {
      console.error("Gemini API Error:", data);
      return res.json({
        reply: "I am having trouble connecting to my AI brain right now due to a network glitch. Please try again later!"
      });
    }

    const reply = data.candidates[0].content.parts[0].text;
    res.json({ reply });

  } catch (error) {
    console.error("Chat Controller Error:", error);
    res.json({
      reply: "I encountered an unexpected internal error. Please browse the FAQs below or check back later."
    });
  }
};

module.exports = { getChatResponse };
