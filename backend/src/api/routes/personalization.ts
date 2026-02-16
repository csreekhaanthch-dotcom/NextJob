function sanitizeInput(input: string): string {
  return input.replace(/[<>]/g, "");
}
import express from 'express';
import { personalizationService } from '../../services/personalizationService';
import { userInterestEngine } from '../../core/userInterestEngine';
import { resumeParser } from '../../core/resumeParser';

const router = express.Router();

/**
 * GET /feed
 * Get personalized job feed for user
 */
router.get('/feed', async (req, res): Promise<void> => {
  try {
    const { userId, location, limit } = req.query;
    
    // Validate required parameters
    if (!userId || typeof userId !== 'string') {
      res.status(400).json({ error: 'userId is required' });
      return;
    }
    
    const startTime = Date.now();
    
    // Get user's resume text if available
    let resumeText: string | undefined;
    try {
      resumeText = await getResumeText(userId as string);
    } catch (error) {
      // Continue without resume if not available
      console.warn(`Could not retrieve resume for user ${userId}:`, error);
    }
    
    // Get personalized feed
    const feed = await personalizationService.getPersonalizedFeed(
      userId as string,
      resumeText,
      location as string | undefined,
      limit ? parseInt(limit as string, 10) : undefined
    );
    
    const duration = Date.now() - startTime;
    
    res.status(200).json({
      feed,
      performance: {
        duration_ms: duration
      }
    });
  } catch (error) {
    console.error('Personalized feed error:', error);
    res.status(500).json({ error: 'Internal server error during feed generation' });
  }
});

/**
 * POST /interaction
 * Record user interaction with a job
 */
router.post('/interaction', async (req, res): Promise<void> => {
  try {
    const { userId, jobId, interactionType } = req.body;
    
    // Validate required parameters
    if (!userId || !jobId || !interactionType) {
      res.status(400).json({ 
        error: 'userId, jobId, and interactionType are required' 
      });
      return;
    }
    
    // Validate interaction type
    const validInteractions = ['view', 'click', 'save', 'apply'];
    if (!validInteractions.includes(interactionType as string)) {
      res.status(400).json({ 
        error: `Invalid interactionType. Must be one of: ${validInteractions.join(', ')}` 
      });
      return;
    }
    
    const startTime = Date.now();
    
    // Record interaction
    await userInterestEngine.recordInteraction(userId as string, jobId as string, interactionType as string);
    
    const duration = Date.now() - startTime;
    
    res.status(200).json({
      message: 'Interaction recorded successfully',
      performance: {
        duration_ms: duration
      }
    });
  } catch (error) {
    console.error('Interaction recording error:', error);
    res.status(500).json({ error: 'Internal server error during interaction recording' });
  }
});

/**
 * GET /user-interests/:userId
 * Get user's interest vector
 */
router.get('/user-interests/:userId', async (req, res): Promise<void> => {
  try {
    const { userId } = req.params;

    const startTime = Date.now();

    // Get user's resume text if available
    let resumeText: string | undefined;
    try {
      resumeText = await getResumeText(userId);
    } catch (error) {
      // Continue without resume if not available
      console.warn(`Could not retrieve resume for user ${userId}:`, error);
    }

    // Build interest vector
    const interestVector = await userInterestEngine.buildInterestVector(userId, resumeText);

    const duration = Date.now() - startTime;

    res.status(200).json({
      interest_vector: interestVector,
      performance: {
        duration_ms: duration
      }
    });
  } catch (error) {
    console.error('User interests error:', error);
    res.status(500).json({ error: 'Internal server error during interest calculation' });
    return;
  }
});

/**
 * Helper function to get user's resume text
 */
async function getResumeText(userId: string): Promise<string | undefined> {
  // This would typically fetch from a database
  // For now, we'll return undefined to simulate no resume
  return undefined;
}

export default router;
