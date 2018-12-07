import { IExamParticipant } from './examParticipant';

export interface IExam {
  readonly id: string;
  readonly state: 'created' | 'started' | 'ended';
  readonly create_date: Date;
  readonly start_date?: Date;
  readonly end_date?: Date;
  readonly questions: ReadonlyArray<number>;
  readonly participants: ReadonlyArray<IExamParticipant>;
}
