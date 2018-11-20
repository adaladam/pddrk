import { action, observable } from 'mobx';

export default class Store {
  @observable private selectedQuestions: number[] = [];

  @action.bound
  public selectQuestion(index: number) {
    this.selectedQuestions.push(index);
  }
}
