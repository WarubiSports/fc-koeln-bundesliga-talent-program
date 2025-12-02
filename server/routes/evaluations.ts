import { Router, Request, Response } from 'express';
import { pool } from '../db.js';
import { calculateEvaluation, EvaluationInput, LEAGUES, AGE_GROUPS, POSITIONS, MAIN_GOALS, PREFERRED_REGIONS, READINESS_TIMELINES } from '../services/evaluationScoring.js';

const router = Router();

// Get form configuration (public) - MUST come before :id route
router.get('/evaluations/config/options', async (_req: Request, res: Response) => {
  res.json({
    success: true,
    options: {
      leagues: LEAGUES,
      ageGroups: AGE_GROUPS,
      positions: POSITIONS,
      mainGoals: MAIN_GOALS,
      preferredRegions: PREFERRED_REGIONS,
      readinessTimelines: READINESS_TIMELINES,
    }
  });
});

// Get all evaluations (for admin view) - MUST come before :id route
router.get('/evaluations/all', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT id, full_name, email, current_league, age_group, state_region,
              score, bucket, rating, tags, created_at
       FROM player_evaluations
       ORDER BY created_at DESC
       LIMIT 500`
    );

    const evaluations = result.rows.map(row => ({
      id: row.id,
      fullName: row.full_name,
      email: row.email,
      currentLeague: row.current_league,
      ageGroup: row.age_group,
      stateRegion: row.state_region,
      score: row.score,
      bucket: row.bucket,
      rating: row.rating,
      tags: JSON.parse(row.tags || '[]'),
      createdAt: row.created_at
    }));

    res.json({
      success: true,
      evaluations
    });

  } catch (error) {
    console.error('Get all evaluations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get evaluations'
    });
  }
});

// Public endpoint - no authentication required
// Submit a new player evaluation
router.post('/evaluations', async (req: Request, res: Response) => {
  try {
    const data = req.body;
    
    // Validate required fields
    const requiredFields = [
      'fullName', 'email', 'yearOfBirth', 'primaryPositions', 'dominantFoot',
      'currentClub', 'currentLeague', 'ageGroup', 'stateRegion',
      'height', 'weight', 'yearsAtCurrentLevel',
      'mainGoals', 'preferredRegion', 'readinessTimeline',
      'highlightVideoUrl'
    ];
    
    for (const field of requiredFields) {
      if (!data[field]) {
        return res.status(400).json({
          success: false,
          message: `Missing required field: ${field}`
        });
      }
    }

    // Prepare evaluation input
    const evaluationInput: EvaluationInput = {
      fullName: data.fullName,
      yearOfBirth: data.yearOfBirth,
      gradYear: data.gradYear,
      primaryPositions: Array.isArray(data.primaryPositions) ? data.primaryPositions : [data.primaryPositions],
      secondaryPositions: data.secondaryPositions ? (Array.isArray(data.secondaryPositions) ? data.secondaryPositions : [data.secondaryPositions]) : [],
      dominantFoot: data.dominantFoot,
      currentClub: data.currentClub,
      currentLeague: data.currentLeague,
      ageGroup: data.ageGroup,
      stateRegion: data.stateRegion,
      height: data.height,
      weight: data.weight,
      primaryStrengths: data.primaryStrengths || [],
      areasToImprove: data.areasToImprove || [],
      yearsAtCurrentLevel: data.yearsAtCurrentLevel,
      previousClubs: data.previousClubs || [],
      seasonAppearances: data.seasonAppearances || 0,
      seasonStarts: data.seasonStarts || 0,
      seasonGoals: data.seasonGoals || 0,
      seasonAssists: data.seasonAssists || 0,
      notableAchievements: data.notableAchievements || [],
      hasNationalTeamExperience: data.hasNationalTeamExperience || false,
      hasProAcademyExperience: data.hasProAcademyExperience || false,
      mainGoals: Array.isArray(data.mainGoals) ? data.mainGoals : [data.mainGoals],
      preferredRegion: data.preferredRegion,
      readinessTimeline: data.readinessTimeline,
    };

    // Calculate evaluation score, bucket, rating, and tags
    const evaluation = calculateEvaluation(evaluationInput);

    // Insert into database
    const result = await pool.query(
      `INSERT INTO player_evaluations (
        app_id,
        full_name, email, year_of_birth, grad_year, primary_positions, secondary_positions, dominant_foot,
        current_club, current_league, other_league, age_group, state_region,
        height, weight, primary_strengths, areas_to_improve,
        years_at_current_level, previous_clubs, season_appearances, season_starts, season_goals, season_assists,
        notable_achievements, has_national_team_experience, national_team_details,
        has_pro_academy_experience, pro_academy_details,
        main_goals, preferred_region, readiness_timeline,
        highlight_video_url, full_game_links, consent_to_contact,
        score, bucket, rating, tags
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38
      ) RETURNING id, score, bucket, rating, tags`,
      [
        'warubi-hub',
        data.fullName,
        data.email,
        data.yearOfBirth,
        data.gradYear || null,
        JSON.stringify(evaluationInput.primaryPositions),
        JSON.stringify(evaluationInput.secondaryPositions),
        data.dominantFoot,
        data.currentClub,
        data.currentLeague,
        data.otherLeague || null,
        data.ageGroup,
        data.stateRegion,
        data.height,
        data.weight,
        JSON.stringify(data.primaryStrengths || []),
        JSON.stringify(data.areasToImprove || []),
        data.yearsAtCurrentLevel,
        JSON.stringify(data.previousClubs || []),
        data.seasonAppearances || 0,
        data.seasonStarts || 0,
        data.seasonGoals || 0,
        data.seasonAssists || 0,
        JSON.stringify(data.notableAchievements || []),
        data.hasNationalTeamExperience || false,
        data.nationalTeamDetails || null,
        data.hasProAcademyExperience || false,
        data.proAcademyDetails || null,
        JSON.stringify(evaluationInput.mainGoals),
        data.preferredRegion,
        data.readinessTimeline,
        data.highlightVideoUrl,
        JSON.stringify(data.fullGameLinks || []),
        data.consentToContact !== false,
        evaluation.score,
        evaluation.bucket,
        evaluation.rating,
        JSON.stringify(evaluation.tags)
      ]
    );

    const newEvaluation = result.rows[0];

    res.status(201).json({
      success: true,
      evaluation: {
        id: newEvaluation.id,
        score: newEvaluation.score,
        bucket: newEvaluation.bucket,
        rating: newEvaluation.rating,
        tags: JSON.parse(newEvaluation.tags || '[]'),
        summary: {
          fullName: data.fullName,
          position: evaluationInput.primaryPositions[0],
          league: data.currentLeague,
          ageGroup: data.ageGroup,
          club: data.currentClub,
        }
      }
    });

  } catch (error) {
    console.error('Evaluation submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit evaluation'
    });
  }
});

// Get evaluation by ID (for result page) - MUST come after static routes
router.get('/evaluations/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validate that id is a number
    if (isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid evaluation ID'
      });
    }

    const result = await pool.query(
      `SELECT * FROM player_evaluations WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Evaluation not found'
      });
    }

    const evaluation = result.rows[0];

    res.json({
      success: true,
      evaluation: {
        id: evaluation.id,
        score: evaluation.score,
        bucket: evaluation.bucket,
        rating: evaluation.rating,
        tags: JSON.parse(evaluation.tags || '[]'),
        summary: {
          fullName: evaluation.full_name,
          email: evaluation.email,
          position: JSON.parse(evaluation.primary_positions || '[]')[0],
          league: evaluation.current_league,
          ageGroup: evaluation.age_group,
          club: evaluation.current_club,
          stateRegion: evaluation.state_region,
          stats: {
            appearances: evaluation.season_appearances,
            starts: evaluation.season_starts,
            goals: evaluation.season_goals,
            assists: evaluation.season_assists,
          },
          hasNationalTeamExperience: evaluation.has_national_team_experience,
          hasProAcademyExperience: evaluation.has_pro_academy_experience,
        },
        createdAt: evaluation.created_at
      }
    });

  } catch (error) {
    console.error('Get evaluation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get evaluation'
    });
  }
});

export default router;
