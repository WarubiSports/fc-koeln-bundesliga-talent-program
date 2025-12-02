import { describe, it, expect } from 'vitest';
import { safeValidateEvaluationInput } from '../../validation/evaluationSchema.js';

describe('safeValidateEvaluationInput', () => {
  const validInput = {
    fullName: 'John Smith',
    email: 'john@example.com',
    gradYear: 2026,
    position: 'CM',
    stateRegion: 'California',
    gpa: 3.5,
    seasons: [
      {
        year: 2024,
        teamName: 'Test FC',
        league: 'ECNL',
        minutesPlayedPercent: 80,
        mainRole: 'Key_Starter',
        goals: 5,
        assists: 3,
        honors: ''
      }
    ],
    hasVideoLink: true,
    coachesContacted: 10,
    responsesReceived: 2,
    events: [],
    consentToContact: true
  };

  it('should validate correct input', () => {
    const result = safeValidateEvaluationInput(validInput);
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });

  describe('fullName validation', () => {
    it('should reject empty name', () => {
      const result = safeValidateEvaluationInput({ ...validInput, fullName: '' });
      expect(result.success).toBe(false);
      expect(result.errors).toContain('fullName: Name must be at least 2 characters');
    });

    it('should reject single character name', () => {
      const result = safeValidateEvaluationInput({ ...validInput, fullName: 'A' });
      expect(result.success).toBe(false);
    });

    it('should reject name over 100 characters', () => {
      const result = safeValidateEvaluationInput({ ...validInput, fullName: 'A'.repeat(101) });
      expect(result.success).toBe(false);
    });
  });

  describe('email validation', () => {
    it('should reject invalid email', () => {
      const result = safeValidateEvaluationInput({ ...validInput, email: 'not-an-email' });
      expect(result.success).toBe(false);
      expect(result.errors?.some(e => e.includes('email'))).toBe(true);
    });

    it('should accept valid email', () => {
      const result = safeValidateEvaluationInput({ ...validInput, email: 'valid@test.com' });
      expect(result.success).toBe(true);
    });
  });

  describe('gradYear validation', () => {
    it('should reject year before 2024', () => {
      const result = safeValidateEvaluationInput({ ...validInput, gradYear: 2020 });
      expect(result.success).toBe(false);
      expect(result.errors?.some(e => e.includes('2024'))).toBe(true);
    });

    it('should reject year after 2035', () => {
      const result = safeValidateEvaluationInput({ ...validInput, gradYear: 2040 });
      expect(result.success).toBe(false);
    });

    it('should accept valid graduation years', () => {
      for (const year of [2024, 2026, 2030, 2035]) {
        const result = safeValidateEvaluationInput({ ...validInput, gradYear: year });
        expect(result.success).toBe(true);
      }
    });
  });

  describe('position validation', () => {
    it('should accept all valid positions', () => {
      const positions = ['GK', 'CB', 'FB', 'WB', 'DM', 'CM', 'AM', 'WING', '9', 'Utility'];
      for (const position of positions) {
        const result = safeValidateEvaluationInput({ ...validInput, position });
        expect(result.success).toBe(true);
      }
    });

    it('should reject invalid position', () => {
      const result = safeValidateEvaluationInput({ ...validInput, position: 'InvalidPosition' });
      expect(result.success).toBe(false);
    });
  });

  describe('gpa validation', () => {
    it('should reject GPA below 0', () => {
      const result = safeValidateEvaluationInput({ ...validInput, gpa: -0.5 });
      expect(result.success).toBe(false);
    });

    it('should reject GPA above 5', () => {
      const result = safeValidateEvaluationInput({ ...validInput, gpa: 5.5 });
      expect(result.success).toBe(false);
    });

    it('should accept valid GPAs', () => {
      for (const gpa of [0, 2.5, 3.5, 4.0, 5.0]) {
        const result = safeValidateEvaluationInput({ ...validInput, gpa });
        expect(result.success).toBe(true);
      }
    });
  });

  describe('seasons validation', () => {
    it('should require at least one season', () => {
      const result = safeValidateEvaluationInput({ ...validInput, seasons: [] });
      expect(result.success).toBe(false);
      expect(result.errors?.some(e => e.includes('season'))).toBe(true);
    });

    it('should validate season fields', () => {
      const invalidSeason = {
        year: 2024,
        teamName: '',
        league: 'ECNL',
        minutesPlayedPercent: 80,
        mainRole: 'Key_Starter',
        goals: 5,
        assists: 3,
        honors: ''
      };
      const result = safeValidateEvaluationInput({ ...validInput, seasons: [invalidSeason] });
      expect(result.success).toBe(false);
    });

    it('should validate league values', () => {
      const validLeagues = ['MLS_NEXT', 'ECNL', 'Girls_Academy', 'ECNL_RL', 'USYS_National_League', 'USL_Academy', 'High_School', 'Elite_Local', 'Other'];
      for (const league of validLeagues) {
        const season = { ...validInput.seasons[0], league };
        const result = safeValidateEvaluationInput({ ...validInput, seasons: [season] });
        expect(result.success).toBe(true);
      }
    });

    it('should validate role values', () => {
      const validRoles = ['Key_Starter', 'Rotation', 'Bench', 'Injured'];
      for (const mainRole of validRoles) {
        const season = { ...validInput.seasons[0], mainRole };
        const result = safeValidateEvaluationInput({ ...validInput, seasons: [season] });
        expect(result.success).toBe(true);
      }
    });
  });

  describe('optional fields', () => {
    it('should accept missing height', () => {
      const result = safeValidateEvaluationInput(validInput);
      expect(result.success).toBe(true);
      expect(result.data?.height).toBeUndefined();
    });

    it('should accept height when provided', () => {
      const result = safeValidateEvaluationInput({ ...validInput, height: "5'10\"" });
      expect(result.success).toBe(true);
    });

    it('should accept missing testScore', () => {
      const result = safeValidateEvaluationInput({ ...validInput, testScore: undefined });
      expect(result.success).toBe(true);
    });

    it('should accept empty events array', () => {
      const result = safeValidateEvaluationInput({ ...validInput, events: [] });
      expect(result.success).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle completely empty input', () => {
      const result = safeValidateEvaluationInput({});
      expect(result.success).toBe(false);
      expect(result.errors?.length).toBeGreaterThan(0);
    });

    it('should handle null input', () => {
      const result = safeValidateEvaluationInput(null);
      expect(result.success).toBe(false);
    });

    it('should handle undefined input', () => {
      const result = safeValidateEvaluationInput(undefined);
      expect(result.success).toBe(false);
    });
  });
});
