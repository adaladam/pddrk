export interface IUser {
  readonly current_question_id: number | null;
  readonly examId: string | null;
  readonly mistakens: ReadonlyArray<number>;
}
