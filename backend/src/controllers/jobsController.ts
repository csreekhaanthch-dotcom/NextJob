import { Request, Response } from 'express';
import { adzunaClient } from '../services/adzunaClient';
import { logger } from '../utils/logger';

export class JobsController {
  /**
   * GET /api/jobs
   * Search jobs with pagination and filtering
   */
  static async searchJobs(req: Request, res: Response) {
    try {
      const { search, location, page, limit } = req.query;
      
      logger.info('Searching jobs', { search, location, page, limit });
      
      const result = await adzunaClient.searchJobs({
        search: search as string,
        location: location as string,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined
      });
      
      logger.info('Jobs search successful', { 
        jobCount: result.jobs.length, 
        page: result.page, 
        totalPages: result.totalPages 
      });
      
      res.json(result);
    } catch (error) {
      logger.error('Error in searchJobs', { error });
      
      if (error instanceof Error) {
        if (error.message.includes('API credentials not configured')) {
          return res.status(500).json({
            error: 'API configuration error',
            message: 'The job service is not properly configured'
          });
        }
        
        if (error.message.includes('HTTP')) {
          return res.status(502).json({
            error: 'External API error',
            message: 'Failed to fetch jobs from external service'
          });
        }
      }
      
      res.status(500).json({
        error: 'Internal server error',
        message: 'An unexpected error occurred while searching for jobs'
      });
    }
  }

  /**
   * GET /api/jobs/:id
   * Get a specific job by ID
   */
  static async getJobById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // In a real implementation, we would fetch the specific job
      // For now, we'll return a not implemented response
      res.status(404).json({
        error: 'Not implemented',
        message: 'Individual job lookup is not currently supported'
      });
    } catch (error) {
      logger.error('Error in getJobById', { error });
      res.status(500).json({
        error: 'Internal server error',
        message: 'An unexpected error occurred while fetching job details'
      });
    }
  }
}