import { Router, Request, Response } from 'express';
import { pool } from '../db.js';
import { analyzePlayerExposure, AnalysisResult } from '../services/exposureEngine.js';

const router = Router();

const LEAGUES = [
  { value: 'MLS_NEXT', label: 'MLS NEXT' },
  { value: 'ECNL', label: 'ECNL' },
  { value: 'Girls_Academy', label: 'Girls Academy' },
  { value: 'ECNL_RL', label: 'ECNL RL' },
  { value: 'USYS_National_League', label: 'USYS National League' },
  { value: 'USL_Academy', label: 'USL Academy' },
  { value: 'High_School', label: 'High School' },
  { value: 'Elite_Local', label: 'Elite Local' },
  { value: 'Other', label: 'Other' }
];

const POSITIONS = [
  { value: 'GK', label: 'Goalkeeper' },
  { value: 'CB', label: 'Center Back' },
  { value: 'FB', label: 'Full Back' },
  { value: 'WB', label: 'Wing Back' },
  { value: 'DM', label: 'Defensive Mid' },
  { value: 'CM', label: 'Central Mid' },
  { value: 'AM', label: 'Attacking Mid' },
  { value: 'WING', label: 'Winger' },
  { value: '9', label: 'Striker' },
  { value: 'Utility', label: 'Utility' }
];

const ROLES = [
  { value: 'Key_Starter', label: 'Key Starter' },
  { value: 'Rotation', label: 'Rotation' },
  { value: 'Bench', label: 'Bench' },
  { value: 'Injured', label: 'Injured' }
];

const EVENT_TYPES = [
  { value: 'Showcase', label: 'Showcase' },
  { value: 'ID_Camp', label: 'ID Camp' },
  { value: 'ODP', label: 'ODP / Select' },
  { value: 'HS_Playoffs', label: 'HS Playoffs' },
  { value: 'Other', label: 'Other' }
];

router.get('/evaluations/config/options', async (_req: Request, res: Response) => {
  res.json({
    success: true,
    options: {
      leagues: LEAGUES,
      positions: POSITIONS,
      roles: ROLES,
      eventTypes: EVENT_TYPES,
      gradYears: [2025, 2026, 2027, 2028, 2029, 2030],
      states: [
        'Alabama', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
        'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana',
        'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts',
        'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska',
        'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina',
        'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island',
        'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
        'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
      ]
    }
  });
});

router.get('/evaluations/all', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT id, full_name, email, position, grad_year, state_region, gpa,
              score, bucket, rating, tags, visibility_scores, created_at
       FROM player_evaluations
       ORDER BY created_at DESC
       LIMIT 500`
    );

    const evaluations = result.rows.map(row => ({
      id: row.id,
      fullName: row.full_name,
      email: row.email,
      position: row.position,
      gradYear: row.grad_year,
      stateRegion: row.state_region,
      gpa: row.gpa,
      score: row.score,
      bucket: row.bucket,
      rating: row.rating,
      tags: JSON.parse(row.tags || '[]'),
      visibilityScores: JSON.parse(row.visibility_scores || '[]'),
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

router.post('/evaluations', async (req: Request, res: Response) => {
  try {
    const data = req.body;
    
    const requiredFields = ['fullName', 'email', 'gradYear', 'position', 'stateRegion', 'gpa', 'seasons'];
    
    for (const field of requiredFields) {
      if (data[field] === undefined || data[field] === null || data[field] === '') {
        return res.status(400).json({
          success: false,
          message: `Missing required field: ${field}`
        });
      }
    }

    const seasons = Array.isArray(data.seasons) ? data.seasons : JSON.parse(data.seasons || '[]');
    const events = Array.isArray(data.events) ? data.events : JSON.parse(data.events || '[]');

    if (seasons.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one season is required'
      });
    }

    const playerProfile = {
      fullName: data.fullName,
      email: data.email,
      gradYear: parseInt(data.gradYear),
      position: data.position,
      height: data.height || undefined,
      stateRegion: data.stateRegion,
      gpa: parseFloat(data.gpa),
      testScore: data.testScore || undefined,
      seasons: seasons,
      hasVideoLink: data.hasVideoLink === true || data.hasVideoLink === 'true',
      coachesContacted: parseInt(data.coachesContacted) || 0,
      responsesReceived: parseInt(data.responsesReceived) || 0,
      events: events
    };

    let analysisResult: AnalysisResult;
    
    try {
      analysisResult = await analyzePlayerExposure(playerProfile);
    } catch (aiError) {
      console.error('AI Analysis failed, using fallback:', aiError);
      analysisResult = generateFallbackAnalysis(playerProfile);
    }

    const result = await pool.query(
      `INSERT INTO player_evaluations (
        app_id, full_name, email, grad_year, position, height, state_region,
        gpa, test_score, seasons, has_video_link, coaches_contacted, responses_received,
        events, consent_to_contact,
        visibility_scores, readiness_score, key_strengths, key_risks, action_plan, plain_language_summary,
        score, bucket, rating, tags
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25
      ) RETURNING id`,
      [
        'warubi-hub',
        data.fullName,
        data.email,
        playerProfile.gradYear,
        data.position,
        data.height || null,
        data.stateRegion,
        playerProfile.gpa,
        data.testScore || null,
        JSON.stringify(seasons),
        playerProfile.hasVideoLink,
        playerProfile.coachesContacted,
        playerProfile.responsesReceived,
        JSON.stringify(events),
        data.consentToContact !== false,
        JSON.stringify(analysisResult.visibilityScores),
        JSON.stringify(analysisResult.readinessScore),
        JSON.stringify(analysisResult.keyStrengths),
        JSON.stringify(analysisResult.keyRisks),
        JSON.stringify(analysisResult.actionPlan),
        analysisResult.plainLanguageSummary,
        analysisResult.overallScore,
        analysisResult.bucket,
        analysisResult.rating,
        JSON.stringify(analysisResult.tags)
      ]
    );

    const newId = result.rows[0].id;

    res.status(201).json({
      success: true,
      evaluation: {
        id: newId,
        ...analysisResult
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

router.get('/evaluations/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

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

    const row = result.rows[0];

    res.json({
      success: true,
      evaluation: {
        id: row.id,
        fullName: row.full_name,
        email: row.email,
        gradYear: row.grad_year,
        position: row.position,
        height: row.height,
        stateRegion: row.state_region,
        gpa: row.gpa,
        testScore: row.test_score,
        seasons: JSON.parse(row.seasons || '[]'),
        hasVideoLink: row.has_video_link,
        coachesContacted: row.coaches_contacted,
        responsesReceived: row.responses_received,
        events: JSON.parse(row.events || '[]'),
        visibilityScores: JSON.parse(row.visibility_scores || '[]'),
        readinessScore: JSON.parse(row.readiness_score || '{}'),
        keyStrengths: JSON.parse(row.key_strengths || '[]'),
        keyRisks: JSON.parse(row.key_risks || '[]'),
        actionPlan: JSON.parse(row.action_plan || '[]'),
        plainLanguageSummary: row.plain_language_summary,
        score: row.score,
        bucket: row.bucket,
        rating: row.rating,
        tags: JSON.parse(row.tags || '[]'),
        createdAt: row.created_at
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

function generateFallbackAnalysis(profile: any): AnalysisResult {
  const topSeason = profile.seasons[0] || {};
  const isTopLeague = ['MLS_NEXT', 'ECNL', 'Girls_Academy'].includes(topSeason.league);
  const isStarter = topSeason.mainRole === 'Key_Starter';
  const hasVideo = profile.hasVideoLink;
  const hasGoodGpa = profile.gpa >= 3.0;
  const hasGreatGpa = profile.gpa >= 3.5;
  
  let d1Score = 10;
  let d2Score = 20;
  let d3Score = 30;
  let naiaScore = 40;
  let jucoScore = 50;
  
  if (isTopLeague) {
    d1Score += 30;
    d2Score += 25;
    d3Score += 20;
  }
  if (isStarter) {
    d1Score += 20;
    d2Score += 15;
    d3Score += 10;
  }
  if (hasVideo) {
    d1Score += 15;
    d2Score += 15;
    d3Score += 15;
    naiaScore += 15;
    jucoScore += 15;
  }
  if (hasGreatGpa) {
    d1Score += 10;
    d3Score += 20;
  } else if (hasGoodGpa) {
    d1Score += 5;
    d3Score += 10;
  }
  if (profile.coachesContacted > 20) {
    d1Score += 10;
    d2Score += 10;
  }
  if (profile.events.length >= 2) {
    d1Score += 10;
    d2Score += 10;
  }
  
  d1Score = Math.min(85, d1Score);
  d2Score = Math.min(90, d2Score);
  d3Score = Math.min(95, d3Score);
  
  const avgScore = Math.round((d1Score + d2Score + d3Score + naiaScore + jucoScore) / 5);
  
  let bucket: string, rating: string;
  if (avgScore >= 70) { bucket = 'A'; rating = 'Elite Prospect'; }
  else if (avgScore >= 50) { bucket = 'B'; rating = 'Strong Candidate'; }
  else if (avgScore >= 30) { bucket = 'C'; rating = 'Development Track'; }
  else { bucket = 'D'; rating = 'Limited Visibility'; }
  
  const tags: string[] = [profile.position];
  if (isTopLeague) tags.push('Top-Tier League');
  if (hasVideo) tags.push('Video Available');
  if (hasGreatGpa) tags.push('Academic Fit');
  if (profile.coachesContacted > 20) tags.push('Active Recruiter');
  
  const keyRisks = [];
  if (!hasVideo) keyRisks.push({ category: 'Media', message: 'No highlight video significantly limits visibility', severity: 'High' });
  if (!isTopLeague) keyRisks.push({ category: 'League', message: 'Current league has limited D1 exposure', severity: 'Medium' });
  if (!hasGoodGpa) keyRisks.push({ category: 'Academics', message: 'GPA below 3.0 limits options significantly', severity: 'High' });
  if (profile.coachesContacted < 10) keyRisks.push({ category: 'Communication', message: 'Low coach outreach limits visibility', severity: 'Medium' });
  
  return {
    visibilityScores: [
      { level: 'D1', visibilityPercent: d1Score, notes: isTopLeague ? 'Top league gives good exposure' : 'League limits D1 visibility' },
      { level: 'D2', visibilityPercent: d2Score, notes: 'Solid D2 potential' },
      { level: 'D3', visibilityPercent: d3Score, notes: hasGreatGpa ? 'Academic schools are realistic' : 'Good fit with right academics' },
      { level: 'NAIA', visibilityPercent: naiaScore, notes: 'Strong NAIA potential' },
      { level: 'JUCO', visibilityPercent: jucoScore, notes: 'JUCO is always an option' }
    ],
    readinessScore: {
      athletic: isStarter ? 70 : 50,
      technical: isTopLeague ? 65 : 45,
      tactical: isTopLeague ? 60 : 40,
      academic: hasGreatGpa ? 85 : (hasGoodGpa ? 65 : 40),
      market: hasVideo ? 60 : 30
    },
    keyStrengths: [
      isTopLeague ? 'Playing in competitive league' : 'Active player',
      hasVideo ? 'Has highlight video for coaches' : 'Ready to create video content',
      hasGoodGpa ? 'Solid academic standing' : 'Can focus on academics'
    ],
    keyRisks: keyRisks,
    actionPlan: [
      { timeframe: 'Next_30_Days', description: hasVideo ? 'Send video to 20 target schools' : 'Create a 3-5 minute highlight video', impact: 'High' },
      { timeframe: 'Next_90_Days', description: 'Attend at least 2 ID camps or showcases', impact: 'High' },
      { timeframe: 'Next_12_Months', description: 'Build relationships with coaches through consistent follow-up', impact: 'Medium' }
    ],
    plainLanguageSummary: `Based on your profile, you have ${bucket === 'A' || bucket === 'B' ? 'solid' : 'developing'} college soccer potential. ${!hasVideo ? 'Your biggest gap is not having a highlight video - coaches cannot recruit what they cannot see. ' : ''}${!isTopLeague ? 'Your league level may limit D1 exposure, but D2/D3/NAIA remain realistic targets. ' : ''}Focus on increasing visibility through video and direct coach outreach.`,
    overallScore: avgScore,
    bucket,
    rating,
    tags
  };
}

export default router;
