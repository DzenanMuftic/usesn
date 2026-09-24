import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type Transaction = {
  id: string;
  direction: 'sent' | 'received';
  amount: number;
  counterparty: string;
  note?: string;
  createdAt: number;
};

type Profile = {
  userId: string;
  displayName: string;
  handle: string;
  balance: number;
};

type StoreState = {
  ready: boolean;
  profile: Profile;
  transactions: Transaction[];
  updateProfile: (patch: Partial<Pick<Profile, 'displayName' | 'handle'>>) => Promise<void>;
  sendTip: (params: { counterparty: string; amount: number; note?: string }) => Promise<void>;
  topUp: (amount: number) => Promise<void>;
};

const STORAGE_KEY = 'qr-tips:v1';

function randomId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

function defaultState(): { profile: Profile; transactions: Transaction[] } {
  const userId = randomId('usr');
  return {
    profile: {
      userId,
      displayName: 'Your Name',
      handle: userId.slice(0, 8),
      balance: 25,
    },
    transactions: [],
  };
}

const StoreContext = createContext<StoreState | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<Profile>(() => defaultState().profile);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          setProfile(parsed.profile);
          setTransactions(parsed.transactions ?? []);
        } else {
          const initial = defaultState();
          setProfile(initial.profile);
          setTransactions(initial.transactions);
        }
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const persist = useCallback(async (nextProfile: Profile, nextTransactions: Transaction[]) => {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ profile: nextProfile, transactions: nextTransactions })
    );
  }, []);

  const updateProfile: StoreState['updateProfile'] = useCallback(
    async (patch) => {
      setProfile((prev) => {
        const next = { ...prev, ...patch };
        persist(next, transactions);
        return next;
      });
    },
    [persist, transactions]
  );

  const sendTip: StoreState['sendTip'] = useCallback(
    async ({ counterparty, amount, note }) => {
      const tx: Transaction = {
        id: randomId('tx'),
        direction: 'sent',
        amount,
        counterparty,
        note,
        createdAt: Date.now(),
      };
      setProfile((prevProfile) => {
        const nextProfile = { ...prevProfile, balance: Math.round((prevProfile.balance - amount) * 100) / 100 };
        setTransactions((prevTx) => {
          const nextTx = [tx, ...prevTx];
          persist(nextProfile, nextTx);
          return nextTx;
        });
        return nextProfile;
      });
    },
    [persist]
  );

  const topUp: StoreState['topUp'] = useCallback(
    async (amount) => {
      const tx: Transaction = {
        id: randomId('tx'),
        direction: 'received',
        amount,
        counterparty: 'Top up',
        createdAt: Date.now(),
      };
      setProfile((prevProfile) => {
        const nextProfile = { ...prevProfile, balance: Math.round((prevProfile.balance + amount) * 100) / 100 };
        setTransactions((prevTx) => {
          const nextTx = [tx, ...prevTx];
          persist(nextProfile, nextTx);
          return nextTx;
        });
        return nextProfile;
      });
    },
    [persist]
  );

  const value = useMemo<StoreState>(
    () => ({ ready, profile, transactions, updateProfile, sendTip, topUp }),
    [ready, profile, transactions, updateProfile, sendTip, topUp]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
