import { action, computed, observable } from 'mobx';

export default class Store {
  @observable private internalSelectedQuestions: number[] = [];

  @computed
  public get hasSelected() {
    return this.internalSelectedQuestions.length > 0;
  }

  @computed
  public get selectedQuestions(): ReadonlyArray<number> {
    return this.internalSelectedQuestions;
  }

  @action.bound
  public selectQuestion(id: number) {
    if (this.internalSelectedQuestions.indexOf(id) !== -1) {
      return;
    }

    this.internalSelectedQuestions.push(id);
  }

  public isSelected(id: number) {
    return this.internalSelectedQuestions.indexOf(id) !== -1;
  }
}
