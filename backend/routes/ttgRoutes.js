/**
 * TTG Integration Routes
 * Text-to-Game conversion endpoints for dashboard
 */

const express = require('express');
const router = express.Router();
const { mapTextToGameMode, validateGameMode } = require('../ttg_integration/game_mode_mapper');
const { convertToEngineSchema } = require('../ttg_integration/schema_converter');
const { buildEngineJobs, createEndGameJob } = require('../engine/engine_job_queue');

/**
 * POST /api/ttg/text-to-game
 * Convert user text to game mode
 */
router.post('/text-to-game', (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Text input is required'
      });
    }

    console.log(`📝 Text-to-Game request: "${text}"`);

    // Convert text to game mode
    const gameModeData = mapTextToGameMode(text);

    // Validate
    const validation = validateGameMode(gameModeData);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid game mode data',
        details: validation.errors
      });
    }

    // Convert to engine schema
    const engineSchema = convertToEngineSchema(gameModeData);

    // Add jobs
    engineSchema.jobs = buildEngineJobs(engineSchema).map(job => ({
      jobId: job.jobId,
      jobType: job.jobType,
      status: 'queued',
      submittedAt: Date.now(),
      payload: job.payload
    }));

    res.json({
      success: true,
      game_mode: gameModeData,
      engine_schema: engineSchema,
      message: `Successfully converted to ${gameModeData.game_mode} game`
    });

  } catch (error) {
    console.error('❌ Text-to-Game error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/ttg/build-game
 * Build game from text (dispatch to engine)
 */
router.post('/build-game', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text input is required'
      });
    }

    console.log(`🎮 Build-Game request: "${text}"`);

    // Convert text to game mode
    const gameModeData = mapTextToGameMode(text);
    const engineSchema = convertToEngineSchema(gameModeData);

    // Add jobs
    engineSchema.jobs = buildEngineJobs(engineSchema).map(job => ({
      jobId: job.jobId,
      jobType: job.jobType,
      status: 'queued',
      submittedAt: Date.now(),
      payload: job.payload
    }));

    // Create job for engine
    const job = {
      jobId: `job_${Date.now()}`,
      jobType: 'BUILD_SCENE',
      status: 'queued',
      submittedAt: Date.now(),
      payload: engineSchema
    };

    // TODO: Dispatch to engine via engine_adapter
    // const engineAdapter = require('../engine/engine_adapter');
    // await engineAdapter.dispatchJob(job);

    res.json({
      success: true,
      job: job,
      game_mode: gameModeData.game_mode,
      message: 'Game build job queued successfully'
    });

  } catch (error) {
    console.error('❌ Build-Game error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/ttg/start-game
 * Start game from text (full pipeline)
 */
router.post('/start-game', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text input is required'
      });
    }

    console.log(`🚀 Start-Game request: "${text}"`);

    const gameModeData = mapTextToGameMode(text);
    
    const validation = validateGameMode(gameModeData);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid game mode data',
        details: validation.errors
      });
    }
    
    const engineSchema = convertToEngineSchema(gameModeData);

    const allJobs = buildEngineJobs(engineSchema, {
      game_mode: gameModeData.game_mode,
      params: gameModeData.params
    });

    // Dispatch jobs to engine
    const jobQueue = require('../jobQueue');
    const io = req.app.get('io');
    
    for (const job of allJobs) {
      jobQueue.addJob(
        {
          jobId: job.jobId,
          jobType: job.jobType,
          status: 'queued',
          submittedAt: Date.now(),
          payload: job.payload,
          userId: 'system'
        },
        (jobObj, status, error) => {
          // Broadcast job status to all clients
          io.emit('job_status', {
            jobId: jobObj.jobId,
            jobType: jobObj.jobType,
            payload: jobObj.payload,
            status,
            error,
            submittedAt: jobObj.submittedAt,
            userId: jobObj.userId,
            queuedAt: jobObj.queuedAt,
            dispatchedAt: jobObj.dispatchedAt,
            startedAt: jobObj.startedAt,
            completedAt: jobObj.completedAt,
            duration: jobObj.duration,
            retryCount: jobObj.retryCount || 0
          });
        },
        engineSchema
      );
    }

    console.log(`✅ Dispatched ${allJobs.length} jobs to engine`);

    res.json({
      success: true,
      jobs: allJobs,
      game_mode: gameModeData.game_mode,
      message: 'Game started successfully'
    });

  } catch (error) {
    console.error('❌ Start-Game error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/ttg/test
 * Test endpoint
 */
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'TTG Integration is working!',
    endpoints: [
      'POST /api/ttg/text-to-game',
      'POST /api/ttg/build-game',
      'POST /api/ttg/start-game'
    ]
  });
});

module.exports = router;
