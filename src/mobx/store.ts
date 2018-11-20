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
    const index = this.internalSelectedQuestions.indexOf(id);
    if (index !== -1) {
      return;
    }

    this.internalSelectedQuestions.push(id);
  }

  @action.bound
  public unselectQuestion(id: number) {
    const index = this.internalSelectedQuestions.indexOf(id);
    if (index !== -1) {
      this.internalSelectedQuestions.splice(index, 1);
      return;
    }
  }

  public isSelected(id: number) {
    return this.internalSelectedQuestions.indexOf(id) !== -1;
  }
}
