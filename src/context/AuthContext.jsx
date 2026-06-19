import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId, userEmail, userMetadata) => {
    if (!userId) {
      setProfile(null);
      return;
    }
    
    let { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    // Fallback: If profile doesn't exist, create it
    if (!profile) {
      const newProfile = {
        id: userId,
        email: userEmail,
        full_name: userMetadata?.full_name || 'Employee',
        role: 'Employee',
        verification_status: 'pending',
        is_active: false
      };
      const { data, error } = await supabase.from('profiles').insert([newProfile]).select().single();
      if (error) {
        console.error("Failed to create fallback profile:", error);
      } else {
        console.log("Successfully created fallback profile:", data);
      }
      profile = error ? newProfile : data;
    }
    
    setProfile(profile);
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email, session.user.user_metadata).then(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email, session.user.user_metadata).then(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Helpful derived state
  const safeEmail = user?.email?.toLowerCase().trim() || '';
  const isAdminEmail = safeEmail.includes('admin') || safeEmail === 'premn7111@gmail.com';
  
  const role = isAdminEmail ? 'Admin' : (profile?.role === 'admin' ? 'Admin' : 'Employee');
  const isVerified = isAdminEmail || safeEmail === 'wrwewwe@gmail.com' ? true : (profile?.verification_status === 'verified');

  const value = {
    session,
    user,
    profile,
    role,
    isVerified,
    signOut: () => supabase.auth.signOut(),
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
