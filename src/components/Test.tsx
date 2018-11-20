import React from 'react';

import { inject, observer } from 'mobx-react';
import { Redirect } from 'react-router';

import Store from '../mobx/store';
import Question from './Question';
import questions from './questions.json';
import styles from './Questions.module.scss';

@inject('store')
@observer
export default class Test extends React.Component<{ store: Store }> {
  public render() {
    const { selectedQuestions } = this.props.store;
    const filteredQuestions = questions.filter(question => selectedQuestions.indexOf(question.id) !== -1);

    if (filteredQuestions.length === 0) {
      return <Redirect to="/" />;
    }

    return (
      <div className={styles.main}>
        {filteredQuestions.map(question => <Question key={question.id} {...question} testMode={true} />)}
      </div>
    );
  }
}
