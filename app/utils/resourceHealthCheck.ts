// Resource Health Check Utility
// Validates all direct PDF links on app initialization
//
// Implementation of health check pattern:
// for each topic in RESOURCES:
//   url = topic.direct_pdf || topic.source_page
//   HEAD url (or GET with Range header for CORS compatibility)
//   if status != 200:
//      topic.direct_pdf = null  // fallback to source_page
//
// Features:
// - Automatic validation on app init
// - 24-hour caching to minimize network requests
// - Progress tracking
// - Graceful fallback to source pages for broken links

import { MULTILINGUAL_RESOURCES, type STIResource } from '../data/multilingualResources';

export interface HealthCheckResult {
  topic: string;
  language: string;
  url: string;
  status: 'valid' | 'invalid' | 'pending';
  checkedAt?: Date;
}

export interface ValidatedResources {
  resources: Record<string, STIResource>;
  lastChecked: Date;
  healthCheckResults: HealthCheckResult[];
}

const CACHE_KEY = 'sia_resource_health_check';
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

// Check if a URL is accessible
async function checkURL(url: string): Promise<boolean> {
  try {
    // Use HEAD request for efficiency (doesn't download the full PDF)
    const response = await fetch(url, { 
      method: 'HEAD',
      mode: 'no-cors' // Allow checking cross-origin resources
    });
    
    // Note: with no-cors, we can't read the status, so we try GET with a range request
    // to minimize bandwidth while still checking if the resource exists
    const testResponse = await fetch(url, {
      method: 'GET',
      headers: { 'Range': 'bytes=0-0' } // Request only first byte
    });
    
    return testResponse.ok || testResponse.status === 206; // 200 or 206 Partial Content
  } catch (error) {
    console.warn(`Health check failed for ${url}:`, error);
    return false;
  }
}

// Perform health check on all resources
export async function performHealthCheck(
  onProgress?: (current: number, total: number) => void
): Promise<ValidatedResources> {
  const results: HealthCheckResult[] = [];
  const validatedResources: Record<string, STIResource> = {};
  
  let checkedCount = 0;
  let totalCount = 0;
  
  // Count total checks needed
  for (const [topicKey, topic] of Object.entries(MULTILINGUAL_RESOURCES)) {
    for (const language of Object.keys(topic.languages)) {
      const langData = topic.languages[language];
      if (langData.direct_pdf) {
        totalCount++;
      }
    }
  }
  
  // Check each resource
  for (const [topicKey, topic] of Object.entries(MULTILINGUAL_RESOURCES)) {
    const validatedTopic: STIResource = {
      ...topic,
      languages: {}
    };
    
    for (const [language, langData] of Object.entries(topic.languages)) {
      validatedTopic.languages[language] = { ...langData };
      
      if (langData.direct_pdf) {
        const isValid = await checkURL(langData.direct_pdf);
        checkedCount++;
        
        results.push({
          topic: topicKey,
          language,
          url: langData.direct_pdf,
          status: isValid ? 'valid' : 'invalid',
          checkedAt: new Date()
        });
        
        if (!isValid) {
          // Invalidate broken link - will fallback to source_page
          console.warn(`Invalid PDF link for ${topicKey} (${language}): ${langData.direct_pdf}`);
          validatedTopic.languages[language].direct_pdf = null;
        }
        
        onProgress?.(checkedCount, totalCount);
      }
    }
    
    validatedResources[topicKey] = validatedTopic;
  }
  
  const result: ValidatedResources = {
    resources: validatedResources,
    lastChecked: new Date(),
    healthCheckResults: results
  };
  
  // Cache results
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      ...result,
      lastChecked: result.lastChecked.toISOString()
    }));
  } catch (e) {
    console.warn('Failed to cache health check results:', e);
  }
  
  return result;
}

// Get cached health check results if still valid
export function getCachedHealthCheck(): ValidatedResources | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    const data = JSON.parse(cached);
    const lastChecked = new Date(data.lastChecked);
    const age = Date.now() - lastChecked.getTime();
    
    // Return cached data if less than 24 hours old
    if (age < CACHE_DURATION_MS) {
      return {
        ...data,
        lastChecked
      };
    }
  } catch (e) {
    console.warn('Failed to read cached health check:', e);
  }
  
  return null;
}

// Get validated resources (from cache or perform new check)
export async function getValidatedResources(
  onProgress?: (current: number, total: number) => void
): Promise<ValidatedResources> {
  // Try cache first
  const cached = getCachedHealthCheck();
  if (cached) {
    console.log('Using cached health check results from', cached.lastChecked);
    return cached;
  }
  
  // Perform new health check
  console.log('Performing health check on multilingual resources...');
  return await performHealthCheck(onProgress);
}

// Force refresh health check (bypass cache)
export async function refreshHealthCheck(
  onProgress?: (current: number, total: number) => void
): Promise<ValidatedResources> {
  localStorage.removeItem(CACHE_KEY);
  return await performHealthCheck(onProgress);
}

// Get health check summary
export function getHealthCheckSummary(results: HealthCheckResult[]): {
  total: number;
  valid: number;
  invalid: number;
  pending: number;
} {
  return {
    total: results.length,
    valid: results.filter(r => r.status === 'valid').length,
    invalid: results.filter(r => r.status === 'invalid').length,
    pending: results.filter(r => r.status === 'pending').length
  };
}