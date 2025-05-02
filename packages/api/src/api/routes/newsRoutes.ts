import express from 'express';

const router = express.Router();

// Get recent news summaries for a user
router.get('/:userId/summaries', async (req, res, next) => {
  try {
    const userId = req.params.userId;
    // TODO: Implement getting recent summaries
    res.status(200).json({ summaries: [] });
  } catch (error) {
    next(error);
  }
});

// Manually trigger news generation
router.post('/:userId/generate', async (req, res, next) => {
  try {
    const userId = req.params.userId;
    // TODO: Implement manual news generation
    res.status(202).json({ message: 'News generation triggered' });
  } catch (error) {
    next(error);
  }
});

export default router;