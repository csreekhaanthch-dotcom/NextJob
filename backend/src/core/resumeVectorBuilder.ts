import { tokenizer } from './tokenizer';
import { skillExtractor } from './skillExtractor';

class ResumeVectorBuilder {
  /**
   * Build a weighted vector representation of a resume
   */
  buildVector(resumeText: string): Record<string, number> {
    // Normalize text
    const normalizedText = tokenizer.tokenize(resumeText).join(' ');
    
    // Extract skills
    const skills = skillExtractor.extractSkills(normalizedText);
    const allSkills = [...skills.technical, ...skills.soft];
    
    // Tokenize resume text
    const tokens = tokenizer.tokenize(normalizedText);
    
    // Count token frequencies
    const tokenCounts: Record<string, number> = {};
    tokens.forEach(token => {
      // Only consider tokens that are recognized skills
      if (skillExtractor.getAllSkills().includes(token)) {
        tokenCounts[token] = (tokenCounts[token] || 0) + 1;
      }
    });
    
    // Calculate weights (frequency / total skill tokens)
    const totalSkillTokens = Object.values(tokenCounts).reduce((sum, count) => sum + count, 0);
    const weights: Record<string, number> = {};
    
    if (totalSkillTokens > 0) {
      Object.keys(tokenCounts).forEach(token => {
        weights[token] = tokenCounts[token] / totalSkillTokens;
      });
    }
    
    return weights;
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  calculateSimilarity(vectorA: Record<string, number>, vectorB: Record<string, number>): number {
    // Get all unique tokens
    const allTokens = new Set([...Object.keys(vectorA), ...Object.keys(vectorB)]);
    
    // Calculate dot product and magnitudes
    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;
    
    for (const token of allTokens) {
      const a = vectorA[token] || 0;
      const b = vectorB[token] || 0;
      dotProduct += a * b;
      magnitudeA += a * a;
      magnitudeB += b * b;
    }
    
    // Calculate cosine similarity
    const magnitude = Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB);
    return magnitude === 0 ? 0 : dotProduct / magnitude;
  }
}

export const resumeVectorBuilder = new ResumeVectorBuilder();