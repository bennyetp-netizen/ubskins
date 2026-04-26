import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

export interface SteamProfile {
  user_id: string;
  steam_id: string | null;
  display_name: string | null;
  avatar_url: string | null;
  profile_url: string | null;
  trade_url: string | null;
}

export const useAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<SteamProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up listener FIRST
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user) {
        // Defer profile fetch to avoid deadlocks
        setTimeout(() => loadProfile(sess.user.id), 0);
      } else {
        setProfile(null);
      }
    });

    // Then check existing session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) loadProfile(data.session.user.id);
      setLoading(false);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (data) setProfile(data as SteamProfile);
  };

  const signInWithSteam = async () => {
    const realm = window.location.origin;
    const returnTo = `${realm}/auth/callback`;
    let popup: Window | null = null;

    try {
      if (window.top && window.top !== window.self) {
        popup = window.open("about:blank", "_blank");
        if (popup) popup.opener = null;
      }
    } catch {
      popup = window.open("about:blank", "_blank");
      if (popup) popup.opener = null;
    }

    const projectUrl = import.meta.env.VITE_SUPABASE_URL;
    const initRes = await fetch(
      `${projectUrl}/functions/v1/steam-auth-init?return_to=${encodeURIComponent(
        returnTo
      )}&realm=${encodeURIComponent(realm)}`,
      {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
      }
    );
    const initData = await initRes.json();
    if (initData?.url) {
      if (popup) {
        popup.location.href = initData.url;
        return;
      }
      // If we're inside the Lovable preview iframe, break out so Steam
      // can actually navigate (iframes block top-level OpenID redirects).
      try {
        if (window.top && window.top !== window.self) {
          window.top.location.href = initData.url;
          return;
        }
      } catch {
        // Cross-origin top — fall through to opening in a new tab
        window.open(initData.url, "_blank", "noopener");
        return;
      }
      window.location.href = initData.url;
    } else {
      popup?.close();
      throw new Error(initData?.error ?? "Cannot start Steam login");
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateTradeUrl = async (tradeUrl: string) => {
    if (!user) return { error: new Error("Not signed in") };
    const { error } = await supabase
      .from("profiles")
      .update({ trade_url: tradeUrl })
      .eq("user_id", user.id);
    if (!error) await loadProfile(user.id);
    return { error };
  };

  return { session, user, profile, loading, signInWithSteam, signOut, updateTradeUrl };
};
