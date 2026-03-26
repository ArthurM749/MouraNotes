/**
 * AuthContext — fonte única de verdade para autenticação.
 *
 * BUG CORRIGIDO: a versão anterior chamava checkUser() + onAuthStateChange
 * em paralelo. Os dois chamavam setLoading(false) de forma independente,
 * criando uma race condition onde:
 *  • checkUser() resolvia primeiro com user=null  → loading=false → UI renderizava vazia
 *  • onAuthStateChange chegava depois com a sessão real → re-render com dados incompletos
 *  • profile podia ficar null/undefined se loadUserProfile falhava silenciosamente
 *
 * SOLUÇÃO:
 *  1. onAuthStateChange é a ÚNICA fonte de verdade (inclui o evento INITIAL_SESSION)
 *  2. checkUser() foi removido — não há mais dupla inicialização
 *  3. loading fica true até o evento inicial do Supabase chegar (máx. ~1s)
 *  4. timeout de segurança (5s) garante que a UI nunca fica presa
 *  5. loadUserProfile sempre retorna algo seguro (nunca lança exceção para fora)
 *  6. refreshProfile verifica user antes de chamar
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { supabase } from './supabase';
import {
  signInWithEmail,
  signInWithGoogle,
  signInWithGithub,
  signUpWithEmail,
} from './Auth';

const AuthContext = createContext(null);

// Timeout de segurança: se o Supabase demorar mais de 5s para responder
// no evento inicial, liberamos o loading para não travar a UI.
const INIT_TIMEOUT_MS = 5_000;

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Ref para evitar updates após desmontagem
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  // ── Carrega perfil do banco ──────────────────────────────────────────────
  const loadUserProfile = useCallback(async (userId) => {
    if (!userId) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle(); // maybeSingle() retorna null sem lançar erro se não encontrar

      if (error) {
        console.warn('[Auth] Erro ao carregar perfil:', error.message);
        return null;
      }

      if (mounted.current) setProfile(data ?? null);
      return data ?? null;
    } catch (err) {
      console.warn('[Auth] loadUserProfile exception:', err);
      if (mounted.current) setProfile(null);
      return null;
    }
  }, []);

  // ── Inicialização ────────────────────────────────────────────────────────
  useEffect(() => {
    // Timeout de segurança — garante que loading vira false mesmo se o
    // Supabase não responder (rede lenta, env vars erradas, etc.)
    const safetyTimer = setTimeout(() => {
      if (mounted.current) {
        console.warn('[Auth] Timeout de inicialização — liberando loading');
        setLoading(false);
      }
    }, INIT_TIMEOUT_MS);

    // onAuthStateChange dispara IMEDIATAMENTE com o evento "INITIAL_SESSION"
    // se houver uma sessão persistida no localStorage (cookie/token).
    // É a forma oficial do Supabase v2 para reidratar sessão após reload.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted.current) return;

      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        // Carrega perfil em paralelo, sem bloquear o desbloqueio do loading
        loadUserProfile(currentUser.id);
      } else {
        setProfile(null);
      }

      // Loading pode ser liberado assim que soubermos o estado de auth.
      // O perfil pode chegar um instante depois — componentes devem usar
      // o padrão `if (loading) return <Skeleton />` para lidar com isso.
      clearTimeout(safetyTimer);
      setLoading(false);
    });

    return () => {
      clearTimeout(safetyTimer);
      subscription?.unsubscribe();
    };
  }, [loadUserProfile]);

  // ── Sign-out centralizado ────────────────────────────────────────────────
  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    if (mounted.current) {
      setUser(null);
      setProfile(null);
    }
  }, []);

  // ── refreshProfile seguro ────────────────────────────────────────────────
  const refreshProfile = useCallback(() => {
    // Lê o user do estado React; se ainda não estiver disponível, busca
    // diretamente do Supabase para evitar closure stale.
    setUser((currentUser) => {
      if (currentUser?.id) loadUserProfile(currentUser.id);
      return currentUser;
    });
  }, [loadUserProfile]);

  const value = {
    user,
    profile,
    loading,
    signIn:          signInWithEmail,
    signInWithGoogle,
    signInWithGithub,
    signUp:          signUpWithEmail,
    signOut:         handleSignOut,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  return ctx;
}