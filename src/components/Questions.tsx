import React from 'react';
import InfiniteScroll from 'react-infinite-scroller';

import Question from './Question';
import questions from './questions.json';
import styles from './Questions.module.scss';

interface IQuestionsState {
  readonly questions: Array<{
    readonly id: number;
    readonly question: string;
    readonly picture: string;
    readonly answers: ReadonlyArray<string>;
    readonly correctAnswer: number;
  }>;
  readonly hasMore: boolean;
}

export default class Questions extends React.Component {
  public state: IQuestionsState = { questions: [], hasMore: true };

  private readonly pageSize: number = 20;

  constructor(props: any) {
    super(props);

    this.loadQuestions = this.loadQuestions.bind(this);
  }

  public render() {
    const loader = <div key="loader" className={styles.loader}>Загрузка...</div>;
    return (
      <InfiniteScroll
        pageStart={0}
        loadMore={this.loadQuestions}
        hasMore={this.state.hasMore}
        loader={loader}
      >
        <div className={styles.main}>
          {this.state.questions.map((question, i) => <Question key={question.id} {...question} />)}
        </div>
      </InfiniteScroll>
    );
  }

  private loadQuestions(page: number) {
    const stateQuestions = this.state.questions;
    stateQuestions.push(...questions.slice((page - 1) * this.pageSize, page * this.pageSize));

    const hasMore = questions.length > page * this.pageSize;
    this.setState({ questions: stateQuestions, hasMore });
  }
}
