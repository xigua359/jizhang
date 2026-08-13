/* Load Supabase as an ES module and expose the client factory for the ledger app. */
(() => {
  const sources = [
    'https://esm.sh/@supabase/supabase-js@2?target=es2020',
    'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'
  ];
  window.supabaseReady = (async () => {
    let lastError;
    for (const source of sources) {
      try {
        const module = await import(source);
        const client = module?.createClient ? module : (module?.default || module);
        if (client?.createClient) {
          window.supabase = client;
          window.dispatchEvent(new CustomEvent('supabase-ready'));
          return client;
        }
      } catch (error) {
        lastError = error;
        console.warn('Supabase source failed:', source, error);
      }
    }
    window.dispatchEvent(new CustomEvent('supabase-error', { detail: lastError }));
    return null;
  })();
})();
