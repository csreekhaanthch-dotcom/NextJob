import { Job } from './types';

class Tokenizer {
  private stopWords: Set<string>;

  constructor() {
    // Common English stop words
    this.stopWords = new Set([
      'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
      'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
      'to', 'was', 'will', 'with', 'the', 'this', 'but', 'they', 'have',
      'had', 'what', 'said', 'each', 'which', 'their', 'time', 'word',
      'were', 'all', 'also', 'been', 'when', 'where', 'who', 'could',
      'should', 'there', 'would', 'up', 'out', 'if', 'about', 'into',
      'than', 'other', 'over', 'new', 'work', 'job', 'position', 'role'
    ]);
  }

  /**
   * Tokenize text into normalized tokens
   */
  tokenize(text: string): string[] {
    if (!text) return [];
    
    // Convert to lowercase and remove special characters
    const cleaned = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
    
    // Split into words and filter out empty strings and stop words
    return cleaned
      .split(/\s+/)
      .filter(word => word.length > 2)
      .filter(word => !this.stopWords.has(word));
  }

  /**
   * Calculate term frequency for tokens
   */
  calculateTokenWeights(tokens: string[]): Record<string, number> {
    const weights: Record<string, number> = {};
    const totalTokens = tokens.length;
    
    tokens.forEach(token => {
      weights[token] = (weights[token] || 0) + 1;
    });
    
    // Normalize weights
    Object.keys(weights).forEach(token => {
      weights[token] = weights[token] / totalTokens;
    });
    
    return weights;
  }

  /**
   * Tokenize job and generate weighted tokens
   */
  tokenizeJob(job: Job): Record<string, number> {
    const combinedText = `${job.title} ${job.company} ${job.description || ''} ${job.tags?.join(' ') || ''}`;
    const tokens = this.tokenize(combinedText);
    return this.calculateTokenWeights(tokens);
  }
}

export const tokenizer = new Tokenizer();