import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);
  private genAI: GoogleGenerativeAI;
  private modelName: string;

  constructor(private configService: ConfigService) {
    // TODO: Set GEMINI_API_KEY in .env
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    this.modelName = this.configService.get<string>('GEMINI_MODEL', 'gemini-1.5-flash');
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    } else {
      this.logger.warn('GEMINI_API_KEY not set – LLM features disabled');
    }
  }

  private getModel() {
    if (!this.genAI) {
      throw new InternalServerErrorException('LLM service not configured. Set GEMINI_API_KEY.');
    }
    return this.genAI.getGenerativeModel({ model: this.modelName });
  }

  async identifyProduct(
    barcode?: string,
    imageBase64?: string,
  ): Promise<{
    name: string;
    brand?: string;
    category?: string;
    description?: string;
    confidence?: number;
  }> {
    const model = this.getModel();

    let prompt = `You are a product identification assistant. `;
    const parts: any[] = [];

    if (barcode) {
      prompt += `Identify the product with barcode: ${barcode}. `;
    }
    if (imageBase64) {
      prompt += `Use the provided image to identify the product. `;
      parts.push({
        inlineData: { mimeType: 'image/jpeg', data: imageBase64 },
      });
    }

    prompt += `Respond ONLY with a JSON object with keys: name, brand, category, description. Categories should be one of: dairy, fruits, vegetables, meat, bakery, beverages, snacks, cleaning, personal_care, other.`;

    parts.unshift({ text: prompt });

    try {
      const result = await model.generateContent({ contents: [{ role: 'user', parts }] });
      const text = result.response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return { name: 'Unknown Product', category: 'other' };
    } catch (error) {
      this.logger.error(`LLM product identification failed: ${error.message}`);
      return { name: 'Unknown Product', category: 'other' };
    }
  }

  async extractReceiptItems(
    imageBase64: string,
  ): Promise<Array<{ name: string; price: number; quantity?: number; category?: string }>> {
    const model = this.getModel();

    const prompt = `You are an OCR assistant for grocery receipts. Extract all line items from this receipt image.
    Respond ONLY with a JSON array of objects with keys: name (string), price (number), quantity (number, optional), category (string, optional).
    Example: [{"name":"Leche Lala","price":25.50,"quantity":2,"category":"dairy"}]`;

    try {
      const result = await model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
            ],
          },
        ],
      });
      const text = result.response.text();
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return [];
    } catch (error) {
      this.logger.error(`LLM receipt extraction failed: ${error.message}`);
      return [];
    }
  }

  async analyzeShoppingHabits(
    userId: string,
    data: any,
  ): Promise<string> {
    const model = this.getModel();

    const prompt = `You are a personal finance assistant analyzing shopping habits.
    Based on the following shopping data for a user, provide actionable insights, recommendations, and observations in Spanish.
    Keep it concise (max 3-4 bullet points).
    
    Shopping data: ${JSON.stringify(data)}
    
    Respond in Spanish with helpful tips about saving money, recurring purchases, and price trends.`;

    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      this.logger.error(`LLM habits analysis failed: ${error.message}`);
      return 'No se pudo analizar los hábitos de compra en este momento.';
    }
  }
}
