// Screen Wake Lock API utility
// Evita que la pantalla se apague durante lectura de leyes extensas

let wakeLockSentinel: WakeLockSentinel | null = null;

export async function requestWakeLock(): Promise<boolean> {
  if (!('wakeLock' in navigator)) {
    return false;
  }

  try {
    wakeLockSentinel = await navigator.wakeLock.request('screen');
    
    // Re-request on visibility change
    const handleVisibilityChange = async () => {
      if (wakeLockSentinel?.released && document.visibilityState === 'visible') {
        try {
          wakeLockSentinel = await navigator.wakeLock.request('screen');
        } catch {
          // Ignore if not supported or denied
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Store cleanup function
    (requestWakeLock as any).cleanup = () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      releaseWakeLock();
    };

    return true;
  } catch {
    return false;
  }
}

export function releaseWakeLock(): void {
  if (wakeLockSentinel) {
    wakeLockSentinel.release().catch(() => { });
    wakeLockSentinel = null;
  }
  
  // Clean up visibility listener
  if ((requestWakeLock as any).cleanup) {
    (requestWakeLock as any).cleanup();
    (requestWakeLock as any).cleanup = null;
  }
}

export function isWakeLockActive(): boolean {
  return wakeLockSentinel !== null && !wakeLockSentinel.released;
}