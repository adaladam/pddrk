export interface IExamParticipant {
  readonly id: string;
  readonly isMaster: boolean;
  readonly isReady?: boolean;
}
