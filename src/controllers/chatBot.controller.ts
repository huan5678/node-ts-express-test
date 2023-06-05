import {Request, Response} from 'express';
import {asyncHandler} from '../middlewares/';
import {Configuration, OpenAIApi} from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export const chatWithAi = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    // Retrieve chat message from request body
    const {message, model, temperature} = req.body;

    // TODO: Implement AI chatbot logic here
    const chatCompletion = await openai.createChatCompletion({
      model: model || 'gpt-3.5-turbo',
      temperature: temperature || 0.9,
      messages: [
        {
          role: 'system',
          content: '你是高級人工智慧, AI助手, 中文為你的預設回答語言',
        },
        {
          role: 'user',
          content: message,
        },
      ],
    });
    console.log(chatCompletion.data.choices[0].message?.content);

    // Send response back to client
    res
      .status(200)
      .json({
        message: chatCompletion.data.choices[0].message?.content,
        finish_reason: chatCompletion.data.choices[0].finish_reason,
        id: chatCompletion.data.id,
      });
  }
);