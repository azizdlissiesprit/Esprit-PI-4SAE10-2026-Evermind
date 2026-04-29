import { environment } from '../../environments/environment';

/**
 * Base URL for the Cognitive Assessment REST API (Spring Boot backend).
 * Change in production via environment or deployment config.
 */
export const COGNITIVE_ASSESSMENT_API_BASE = `${environment.apiUrl}/api/cognitive-assessments`;
export const AUTONOMY_ASSESSMENT_API_BASE = `${environment.apiUrl}/api/autonomy-assessments`;
