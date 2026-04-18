export type AuthContext = {
  userId: string;
  email?: string | null;
  sessionId?: string | null;
  orgId?: string | null;
  getToken: () => Promise<string | null>;
};

export type ClientAuthContext = {
  isLoaded: boolean;
  isSignedIn: boolean;
  userId: string | null;
  email: string | null;
  getToken: () => Promise<string | null>;
  signOut: () => Promise<void>;
};
