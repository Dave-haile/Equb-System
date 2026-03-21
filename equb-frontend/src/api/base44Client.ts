import type { EqubGroup, Member, Contribution, DrawResult, ContributionCreateData } from "@/types";

// Mock implementation of the base44 client using localStorage
const STORAGE_KEYS = {
  GROUPS: 'equb_groups',
  MEMBERS: 'equb_members',
  CONTRIBUTIONS: 'equb_contributions',
  DRAWS: 'equb_draws'
};

const getStorage = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const setStorage = <T>(key: string, data: T[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const base44 = {
  entities: {
    EqubGroup: {
      list: async (p0: string): Promise<EqubGroup[]> => {
        const groups = getStorage<EqubGroup>(STORAGE_KEYS.GROUPS);
        if (groups.length === 0) {
          // Seed some data
          const seed: EqubGroup[] = [
            {
              id: '1',
              name: 'Monthly Gold Savings',
              status: 'active',
              current_round: 2,
              total_rounds: 12,
              contribution_grams: 5,
              contribution_karat: 24,
              next_draw_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
              interval_days: 30,
              created_date: new Date().toISOString(),
              members_count: 12
            }
          ];
          setStorage(STORAGE_KEYS.GROUPS, seed);
          return seed;
        }
        return groups;
      },
      create: async (data: Partial<EqubGroup>): Promise<EqubGroup> => {
        const groups = getStorage<EqubGroup>(STORAGE_KEYS.GROUPS);
        const newGroup: EqubGroup = {
          ...data,
          id: Math.random().toString(36).substr(2, 9),
          members_count: 0,
          created_date: new Date().toISOString()
        } as EqubGroup;
        setStorage(STORAGE_KEYS.GROUPS, [...groups, newGroup]);
        return newGroup;
      }
    },
    Member: {
      filter: async (params: { group_id: string }): Promise<Member[]> => {
        const members = getStorage<Member>(STORAGE_KEYS.MEMBERS);
        if (members.length === 0) {
          const seed: Member[] = Array.from({ length: 12 }).map((_, i) => ({
            id: `m${i + 1}`,
            full_name: `Member ${i + 1}`,
            group_id: '1',
            has_won: i === 0,
            won_round: i === 0 ? 1 : undefined,
            status: 'active'
          }));
          setStorage(STORAGE_KEYS.MEMBERS, seed);
          return seed;
        }
        return members.filter(m => m.group_id === params.group_id);
      },
      create: async (data: Partial<Member>): Promise<Member> => {
        const members = getStorage<Member>(STORAGE_KEYS.MEMBERS);
        const newMember: Member = {
          ...data,
          id: Math.random().toString(36).substr(2, 9),
          has_won: false,
          status: 'active'
        } as Member;
        setStorage(STORAGE_KEYS.MEMBERS, [...members, newMember]);
        return newMember;
      },
      update: async (id: string, data: Partial<Member>): Promise<Member> => {
        const members = getStorage<Member>(STORAGE_KEYS.MEMBERS);
        const index = members.findIndex(m => m.id === id);
        if (index === -1) throw new Error("Member not found");
        const updated = { ...members[index], ...data };
        members[index] = updated;
        setStorage(STORAGE_KEYS.MEMBERS, members);
        return updated;
      }
    },
    Contribution: {
      filter: async (params: { group_id: string; }, p0: string, p1: number): Promise<Contribution[]> => {
        const contributions = getStorage<Contribution>(STORAGE_KEYS.CONTRIBUTIONS);
        return contributions.filter(c => c.group_id === params.group_id);
      },
      create: async (data: ContributionCreateData): Promise<Contribution> => {
        const contributions = getStorage<Contribution>(STORAGE_KEYS.CONTRIBUTIONS);
        const newContribution: Contribution = {
          ...data,
          id: Math.random().toString(36).substr(2, 9),
          created_date: new Date().toISOString()
        };
        setStorage(STORAGE_KEYS.CONTRIBUTIONS, [...contributions, newContribution]);
        return newContribution;
      },
      update: async (id: string, data: Partial<Contribution>): Promise<Contribution> => {
        const contributions = getStorage<Contribution>(STORAGE_KEYS.CONTRIBUTIONS);
        const index = contributions.findIndex(c => c.id === id);
        if (index === -1) throw new Error("Contribution not found");
        const updated = { ...contributions[index], ...data };
        contributions[index] = updated;
        setStorage(STORAGE_KEYS.CONTRIBUTIONS, contributions);
        return updated;
      }
    },
    DrawResult: {
      filter: async (params: { group_id: string }, sort?: string, limit?: number): Promise<DrawResult[]> => {
        const draws = getStorage<DrawResult>(STORAGE_KEYS.DRAWS);
        if (draws.length === 0) {
          const seed: DrawResult[] = [
            {
              id: 'd1',
              group_id: '1',
              round_number: 1,
              winner_member_id: 'm1',
              winner_name: 'Member 1',
              total_pool_grams: 60,
              draw_date: new Date().toISOString(),
              created_date: new Date().toISOString()
            }
          ];
          setStorage(STORAGE_KEYS.DRAWS, seed);
          return seed;
        }
        return draws.filter(d => d.group_id === params.group_id);
      },
      create: async (data: Partial<DrawResult>): Promise<DrawResult> => {
        const draws = getStorage<DrawResult>(STORAGE_KEYS.DRAWS);
        const newDraw: DrawResult = {
          ...data,
          id: Math.random().toString(36).substr(2, 9),
          created_date: new Date().toISOString()
        } as DrawResult;
        setStorage(STORAGE_KEYS.DRAWS, [...draws, newDraw]);
        return newDraw;
      }
    }
  }
};
