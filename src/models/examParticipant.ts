export interface IExamParticipant {
  readonly id: string;
  readonly isMaster: boolean;
  readonly isReady?: boolean;
  readonly stats?: {
    readonly answered: number;
    readonly correct: number;
  };
}
