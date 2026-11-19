/**
 * 1vs1 Realtime Arena Matchmaker with 10-Second Bot Fallback Engine
 * Grade 1 Math Gamified E-learning Platform
 */

export interface ArenaPlayer {
  playerId: string;
  playerName: string;
  grade: number;
  avatar?: string;
}

export interface ArenaOpponent {
  playerId: string;
  playerName: string;
  grade: number;
  isBot: boolean;
  avatar: string;
}

export interface ArenaMatch {
  matchId: string;
  player: ArenaPlayer;
  opponent: ArenaOpponent;
  totalSteps: number;
  startedAt: number;
}

export interface BotSimulationOptions {
  totalSteps?: number;
  minDelayMs?: number;
  maxDelayMs?: number;
}

export const FRIENDLY_BOT_OPPONENTS: Array<{
  id: string;
  name: string;
  avatar: string;
}> = [
  { id: 'bot_panda', name: 'Bạn Gấu Trúc', avatar: '🐼' },
  { id: 'bot_rabbit', name: 'Bạn Thỏ Trắng', avatar: '🐰' },
  { id: 'bot_fox', name: 'Bạn Cáo Nhỏ', avatar: '🦊' },
  { id: 'bot_squirrel', name: 'Bạn Sóc Nâu', avatar: '🐿️' },
];

export const DEFAULT_MATCH_TIMEOUT_MS = 10_000;
export const DEFAULT_ARENA_TOTAL_STEPS = 5;

export class ArenaMatchmaker {
  private searchTimer: ReturnType<typeof setTimeout> | null = null;
  private botSimulationTimer: ReturnType<typeof setTimeout> | null = null;
  private searching = false;
  private timeoutMs: number;

  constructor(options?: { timeoutMs?: number }) {
    this.timeoutMs = options?.timeoutMs ?? DEFAULT_MATCH_TIMEOUT_MS;
  }

  /**
   * Starts searching for a 1vs1 opponent.
   * Waits up to 10 seconds (10,000ms). If no live peer connects within 10s,
   * automatically spawns a friendly Bot opponent (match.opponent.isBot === true).
   */
  startSearch(
    player: ArenaPlayer,
    onMatchFound: (match: ArenaMatch) => void
  ): void {
    this.cancelSearch();
    this.searching = true;

    this.searchTimer = setTimeout(() => {
      if (!this.searching) return;
      this.searching = false;
      this.searchTimer = null;

      const botTemplate =
        FRIENDLY_BOT_OPPONENTS[
          Math.floor(Math.random() * FRIENDLY_BOT_OPPONENTS.length)
        ] ?? FRIENDLY_BOT_OPPONENTS[0];

      const match: ArenaMatch = {
        matchId: `arena_match_${Date.now()}`,
        player,
        opponent: {
          playerId: botTemplate.id,
          playerName: botTemplate.name,
          grade: player.grade,
          isBot: true,
          avatar: botTemplate.avatar,
        },
        totalSteps: DEFAULT_ARENA_TOTAL_STEPS,
        startedAt: Date.now(),
      };

      onMatchFound(match);
    }, this.timeoutMs);
  }

  /**
   * Cancels any ongoing matchmaking search and bot simulation.
   */
  cancelSearch(): void {
    this.searching = false;
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
      this.searchTimer = null;
    }
    this.stopBotSimulation();
  }

  /**
   * Returns true if matchmaking search is currently active.
   */
  isSearching(): boolean {
    return this.searching;
  }

  /**
   * Simulates natural bot progress across questions (default 4-7 seconds per step).
   * Returns a cleanup function to stop the simulation at any time.
   */
  simulateBotProgress(
    onStepAdvance: (newStep: number) => void,
    options?: BotSimulationOptions
  ): () => void {
    this.stopBotSimulation();

    const totalSteps = options?.totalSteps ?? DEFAULT_ARENA_TOTAL_STEPS;
    const minDelayMs = options?.minDelayMs ?? 4000;
    const maxDelayMs = options?.maxDelayMs ?? 7000;

    let currentStep = 0;
    let active = true;

    const scheduleNextStep = () => {
      if (!active || currentStep >= totalSteps) {
        return;
      }

      const randomDelay =
        minDelayMs + Math.floor(Math.random() * (maxDelayMs - minDelayMs + 1));

      this.botSimulationTimer = setTimeout(() => {
        if (!active) return;
        currentStep += 1;
        onStepAdvance(currentStep);

        if (currentStep < totalSteps) {
          scheduleNextStep();
        }
      }, randomDelay);
    };

    scheduleNextStep();

    return () => {
      active = false;
      this.stopBotSimulation();
    };
  }

  /**
   * Stops any active bot progress simulation timer.
   */
  stopBotSimulation(): void {
    if (this.botSimulationTimer) {
      clearTimeout(this.botSimulationTimer);
      this.botSimulationTimer = null;
    }
  }
}
