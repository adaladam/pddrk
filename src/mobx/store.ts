import { action, autorun, computed, IReactionDisposer, observable } from 'mobx';

import ApplicationService from '../firebase';
import { IExam, IUser } from '../models';

export default class Store {
  private disposer: IReactionDisposer | null = null;

  @observable private exam: IExam | null = null;
  @observable private current: number | null = null;
  @observable private mistakens: number[] = [];

  @computed
  public get hasMistaken() {
    return this.mistakens.length > 0;
  }

  @computed
  public get currentQuestion(): number | null {
    return this.current;
  }

  @computed
  public get mistakenQuestions(): ReadonlyArray<number> {
    return this.mistakens;
  }

  @computed
  public get currentExam(): IExam | null {
    return this.exam;
  }

  @action.bound
  public loadData(user: IUser) {
    if (this.disposer != null) {
      this.disposer();
    }

    this.current = user.current_question_id;
    this.mistakens = [...user.mistakens];
    this.disposer = autorun(() => {
      const service = new ApplicationService();
      service.updateUser({
        current_question_id: this.current,
        examId: this.exam == null ? null : this.exam.id,
        mistakens: this.mistakens,
      });
    });
  }

  @action.bound
  public mistaken(id: number) {
    const index = this.mistakens.indexOf(id);
    if (index !== -1) {
      return;
    }

    this.mistakens.push(id);
  }

  @action.bound
  public unmistake(id: number) {
    const index = this.mistakens.indexOf(id);
    if (index !== -1) {
      this.mistakens.splice(index, 1);
      return;
    }
  }

  @action.bound
  public questionAnswered(id: number) {
    this.current = id;
  }

  @action.bound
  public setCurrentExam(exam: IExam): void {
    this.exam = exam;
  }

  public isMistaken(id: number) {
    return this.mistakens.indexOf(id) !== -1;
  }
}
