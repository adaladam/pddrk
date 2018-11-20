import React from 'react';

import { inject, observer } from 'mobx-react';
import { Link } from 'react-router-dom';

import Store from '../mobx/store';
import styles from './Question.module.scss';

interface IQuestionProps {
  readonly id: number;
  readonly question: string;
  readonly picture: string;
  readonly answers: ReadonlyArray<string>;
  readonly correctAnswer: number;
  readonly testMode?: boolean;
}

interface IQuestionState {
  readonly answerHidden: boolean;
  readonly imageLoaded: boolean;
}

const variants = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'H', 'J', 'K'];

@inject('store')
@observer
export default class Question extends React.Component<IQuestionProps & { store?: Store }, IQuestionState> {
  public state: IQuestionState = { answerHidden: true, imageLoaded: false };

  public render() {
    const hasSelected = this.props.store!.hasSelected;
    const isSelected = this.props.store!.isSelected(this.props.id);

    return (
      <div className={styles.main}>
        <img
          src={`/pictures/${this.props.picture}`}
          style={{ display: this.state.imageLoaded ? 'block' : 'none' }}
          onLoad={() => this.setState({ imageLoaded: true })}
        />
        <p>{this.props.id}. {this.props.question}</p>
        <ul>
          {this.props.answers.map((answer, i) => <li key={i}>{variants[i]}. {answer}</li>)}
        </ul>
        <div className={styles.buttons}>
          <div className={styles.answer}>
            {this.answerEl()}
          </div>
          <div className={styles.memo}>
            {this.memoEl(isSelected)}
          </div>
          <div className={styles.test}>
            {this.linkEl(hasSelected)}
          </div>
        </div>
      </div>
    );
  }

  private answerEl() {
    return this.state.answerHidden
      ? <button onClick={() => this.setState({ answerHidden: false })}>Показать Ответ</button>
      : <span>Правильный ответ: {variants[this.props.correctAnswer - 1]}</span>;
  }

  private memoEl(isSelected: boolean) {
    return !this.props.testMode
      ? (
        <button
          className={isSelected ? styles.selected : ''}
          onClick={() => this.props.store!.selectQuestion(this.props.id)}>
          Запомнила!
        </button>
      )
      : null;
  }

  private linkEl(hasSelected: boolean) {
    if (this.props.testMode) {
      return <Link to="/questions">Назад к вопросам</Link>;
    }

    return hasSelected
      ? <Link to="/test">Начать тест</Link>
      : null;
  }
}
