import React from 'react';

import Question from './Question';
import questions from './questions.json';

export default class Questions extends React.Component {
  public render() {
    return (
      <>
        {questions.map((question, i) => <Question key={i} {...question} />)}
      </>
    );
  }
}
