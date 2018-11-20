import React from 'react';

import { inject, observer } from 'mobx-react';

import Store from '../mobx/store';
import styles from './Question.module.scss';

interface IQuestionProps {
  readonly question: string;
  readonly picture: string;
  readonly answers: ReadonlyArray<string>;
  readonly correctAnswer: number;
}

@inject('store')
@observer
export default class Question extends React.Component<IQuestionProps & { store?: Store }> {
  public render() {
    return (
      <div className={styles.main}>
        {this.props.question}
        <button onClick={() => this.props.store!.selectQuestion(1)}>Select</button>
      </div>
    );
  }
}
