function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

import { tokenizer } from './tokenizer';
import { skillExtractor } from './skillExtractor';

interface AnalysisResult {
  score: number;
  strengths: string[];
  improvements: string[];
  missing_skills: string[];
  keyword_opportunities: string[];
  suggested_rewrites: RewriteSuggestion[];
}

interface RewriteSuggestion {
  original: string;
  suggestion: string;
  reason: string;
}

class ResumeAnalyzer {
  // Weak phrases that reduce resume impact
  private weakPhrases = [
    'responsible for',
    'worked on',
    'helped with',
    'participated in',
    'assisted with',
    'involved in',
    'contributed to',
    'supported',
    'handled'
  ];

  // Strong action verbs for rewriting
  private strongVerbs = [
    'Developed', 'Implemented', 'Optimized', 'Led', 'Created', 'Managed',
    'Designed', 'Built', 'Enhanced', 'Streamlined', 'Accelerated', 'Pioneered',
    'Revamped', 'Modernized', 'Innovated', 'Transformed', 'Spearheaded'
  ];

  /**
   * Analyze resume text and generate improvement suggestions
   */
  analyze(resumeText: string, matchedJobs: any[] = []): AnalysisResult {
    const normalizedText = this.normalizeText(resumeText);
    const tokens = tokenizer.tokenize(normalizedText);
    
    // Calculate ATS optimization score
    const atsScore = this.calculateATSScore(resumeText, tokens);
    
    // Detect strengths
    const strengths = this.detectStrengths(resumeText);
    
    // Identify improvements
    const improvements = this.identifyImprovements(resumeText);
    
    // Extract missing skills from matched jobs
    const missingSkills = this.extractMissingSkills(resumeText, matchedJobs);
    
    // Find keyword opportunities
    const keywordOpportunities = this.findKeywordOpportunities(resumeText, matchedJobs);
    
    // Generate rewrite suggestions
    const suggestedRewrites = this.generateRewriteSuggestions(resumeText);
    
    return {
      score: atsScore,
      strengths,
      improvements,
      missing_skills: missingSkills,
      keyword_opportunities: keywordOpportunities,
      suggested_rewrites: suggestedRewrites
    };
  }

  /**
   * Normalize text for processing
   */
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Calculate ATS optimization score
   */
  private calculateATSScore(resumeText: string, tokens: string[]): number {
    let score = 100;
    const improvements: string[] = [];
    
    // Check resume length (optimal 1-2 pages)
    const wordCount = resumeText.split(/\s+/).length;
    if (wordCount < 300) {
      score -= 15;
      improvements.push('Resume is too short (under 300 words)');
    } else if (wordCount > 800) {
      score -= 10;
      improvements.push('Resume is too long (over 800 words)');
    }
    
    // Check for measurable metrics (numbers, percentages, dollar amounts)
    const metricsRegex = /\d+(?:\.\d+)?\s*(?:%|million|billion|thousand|\$|USD|EUR|GBP|users|customers|clients|projects|years)/gi;
    const metricsCount = (resumeText.match(metricsRegex) || []).length;
    if (metricsCount < 3) {
      score -= 10;
    }
    
    // Check for skill section
    const hasSkillsSection = /skills?|technologies|expertise/i.test(resumeText);
    if (!hasSkillsSection) {
      score -= 10;
      improvements.push('Missing dedicated skills section');
    }
    
    // Check keyword density
    const uniqueTokens = new Set(tokens);
    const tokenDensity = uniqueTokens.size / tokens.length;
    if (tokenDensity < 0.3) {
      score -= 5;
      improvements.push('Low keyword diversity');
    }
    
    // Ensure score stays within bounds
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Detect resume strengths
   */
  private detectStrengths(resumeText: string): string[] {
    const strengths: string[] = [];
    
    // Check for strong metrics
    const metricsRegex = /\d+(?:\.\d+)?\s*(?:%|million|billion|thousand|\$|USD|EUR|GBP|users|customers|clients|projects|years)/gi;
    const metrics = resumeText.match(metricsRegex) || [];
    if (metrics.length >= 3) {
      strengths.push('Strong use of quantifiable metrics');
    }
    
    // Check for leadership keywords
    const leadershipKeywords = ['led', 'managed', 'supervised', 'mentored', 'directed'];
    const leadershipCount = leadershipKeywords.reduce((count, keyword) => {
      return count + (resumeText.toLowerCase().match(new RegExp(keyword, 'g')) || []).length;
    }, 0);
    
    if (leadershipCount >= 2) {
      strengths.push('Demonstrated leadership experience');
    }
    
    // Check for technical depth indicators
    const techIndicators = ['implemented', 'developed', 'engineered', 'architected', 'optimized'];
    const techCount = techIndicators.reduce((count, keyword) => {
      return count + (resumeText.toLowerCase().match(new RegExp(keyword, 'g')) || []).length;
    }, 0);
    
    if (techCount >= 3) {
      strengths.push('Strong technical implementation experience');
    }
    
    return strengths;
  }

  /**
   * Identify areas for improvement
   */
  private identifyImprovements(resumeText: string): string[] {
    const improvements: string[] = [];
    
    // Check for weak phrases
    const weakPhraseMatches = this.weakPhrases.filter(phrase => 
      resumeText.toLowerCase().includes(phrase)
    );
    
    if (weakPhraseMatches.length > 0) {
      improvements.push(`Contains ${weakPhraseMatches.length} weak phrases that reduce impact`);
    }
    
    // Check for passive language
    const passiveIndicators = ['was responsible', 'was tasked', 'was assigned', 'had a role'];
    const passiveCount = passiveIndicators.reduce((count, indicator) => {
      return count + (resumeText.toLowerCase().match(new RegExp(indicator, 'g')) || []).length;
    }, 0);
    
    if (passiveCount > 2) {
      improvements.push('Excessive use of passive language');
    }
    
    // Check for formatting issues
    const excessiveSpaces = (resumeText.match(/\s{3,}/g) || []).length;
    if (excessiveSpaces > 5) {
      improvements.push('Inconsistent spacing/formatting detected');
    }
    
    return improvements;
  }

  /**
   * Extract missing skills from matched jobs
   */
  private extractMissingSkills(resumeText: string, matchedJobs: any[]): string[] {
    if (matchedJobs.length === 0) return [];
    
    // Get top 50 matched jobs
    const topJobs = matchedJobs.slice(0, 50);
    
    // Extract all skills from job descriptions
    const jobSkills: Record<string, number> = {};
    topJobs.forEach(job => {
      if (job.skills) {
        job.skills.forEach((skill: string) => {
          jobSkills[skill] = (jobSkills[skill] || 0) + 1;
        });
      }
    });
    
    // Sort skills by frequency
    const sortedSkills = Object.entries(jobSkills)
      .sort((a, b) => b[1] - a[1])
      .map(([skill]) => skill);
    
    // Extract resume skills
    const resumeSkills = new Set(skillExtractor.extractSkills(resumeText).technical);
    
    // Find missing skills
    const missingSkills = sortedSkills.filter(skill => !resumeSkills.has(skill.toLowerCase()));
    
    // Return top 10 missing skills
    return missingSkills.slice(0, 10);
  }

  /**
   * Find keyword opportunities from matched jobs
   */
  private findKeywordOpportunities(resumeText: string, matchedJobs: any[]): string[] {
    if (matchedJobs.length === 0) return [];
    
    // Get top 50 matched jobs
    const topJobs = matchedJobs.slice(0, 50);
    
    // Extract all tokens from job titles and descriptions
    const jobTokens: Record<string, number> = {};
    topJobs.forEach(job => {
      const text = `${job.title} ${job.description || ''} ${job.skills?.join(' ') || ''}`;
      const tokens = tokenizer.tokenize(text);
      tokens.forEach(token => {
        jobTokens[token] = (jobTokens[token] || 0) + 1;
      });
    });
    
    // Sort tokens by frequency
    const sortedTokens = Object.entries(jobTokens)
      .sort((a, b) => b[1] - a[1])
      .map(([token]) => token);
    
    // Extract resume tokens
    const resumeTokens = new Set(tokenizer.tokenize(this.normalizeText(resumeText)));
    
    // Find missing high-frequency tokens
    const opportunities = sortedTokens.filter(token => !resumeTokens.has(token));
    
    // Return top 15 opportunities
    return opportunities.slice(0, 15);
  }

  /**
   * Generate rewrite suggestions for weak bullet points
   */
  private generateRewriteSuggestions(resumeText: string): RewriteSuggestion[] {
    const suggestions: RewriteSuggestion[] = [];
    const lines = resumeText.split('\n');
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;
      
      // Check for weak phrases
      const weakMatch = this.weakPhrases.find(phrase => 
        trimmedLine.toLowerCase().includes(phrase)
      );
      
      if (weakMatch) {
        // Extract context around the weak phrase
        const contextMatch = trimmedLine.match(/(?:^|\s)(.{0,30})\b(responsible for|worked on|helped with|participated in|assisted with|involved in|contributed to|supported|handled)\b(.{0,30})(?:\s|$)/i);
        
        if (contextMatch) {
          const [, before, weakPhrase, after] = contextMatch;
          const context = `${before || ''}${weakPhrase}${after || ''}`.trim();
          
          // Generate suggestion using template
          const strongVerb = this.strongVerbs[Math.floor(Math.random() * this.strongVerbs.length)];
          const suggestion = `${strongVerb} ${after.trim() || 'key responsibilities'} resulting in measurable impact`;
          
          suggestions.push({
            original: context,
            suggestion,
            reason: `Replace weak phrase "${weakPhrase}" with stronger action verb`
          });
        }
      }
    });
    
    return suggestions.slice(0, 5); // Limit to top 5 suggestions
  }
}

export const resumeAnalyzer = new ResumeAnalyzer();
