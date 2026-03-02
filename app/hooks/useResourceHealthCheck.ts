// React Hook for Resource Health Check
import { useState, useEffect } from 'react';
import { 
  getValidatedResources, 
  refreshHealthCheck,
  type ValidatedResources,
  type HealthCheckResult 
} from '../utils/resourceHealthCheck';
import { MULTILINGUAL_RESOURCES } from '../data/multilingualResources';

export function useResourceHealthCheck(autoRun: boolean = false) {
  const [isChecking, setIsChecking] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [validatedResources, setValidatedResources] = useState(MULTILINGUAL_RESOURCES);
  const [healthCheckResults, setHealthCheckResults] = useState<HealthCheckResult[]>([]);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runHealthCheck = async (forceRefresh: boolean = false) => {
    setIsChecking(true);
    setError(null);
    
    try {
      const checkFn = forceRefresh ? refreshHealthCheck : getValidatedResources;
      
      const result = await checkFn((current, total) => {
        setProgress({ current, total });
      });
      
      setValidatedResources(result.resources);
      setHealthCheckResults(result.healthCheckResults);
      setLastChecked(result.lastChecked);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Health check failed');
      console.error('Health check error:', err);
    } finally {
      setIsChecking(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  useEffect(() => {
    if (autoRun) {
      runHealthCheck(false);
    }
  }, [autoRun]);

  return {
    isChecking,
    progress,
    validatedResources,
    healthCheckResults,
    lastChecked,
    error,
    runHealthCheck
  };
}
