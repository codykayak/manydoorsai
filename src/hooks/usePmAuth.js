import { useEffect, useState, useCallback } from 'react';
import {
  watchAuth, signInWithGoogle, signOutPm, resolveTenantId, isPmFirebaseConfigured,
} from '../lib/pmAuth';

export function usePmAuth() {
  const [user, setUser] = useState(null);
  const [tenantId, setTenantId] = useState(null);
  const [loading, setLoading] = useState(isPmFirebaseConfigured);

  useEffect(() => {
    if (!isPmFirebaseConfigured) {
      setLoading(false);
      return undefined;
    }
    return watchAuth(async (u) => {
      setUser(u);
      if (u) {
        const tid = await resolveTenantId();
        setTenantId(tid);
      } else {
        setTenantId(null);
      }
      setLoading(false);
    });
  }, []);

  const signIn = useCallback(async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(() => signOutPm(), []);

  return {
    configured: isPmFirebaseConfigured,
    user,
    tenantId,
    loading,
    signIn,
    signOut,
  };
}
