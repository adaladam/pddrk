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
  readonly chosenAnswer?: number;
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
          {this.answersEl()}
        </ul>
        <div className={styles.buttons}>
          <div className={styles.answer}>
            {this.answerEl()}
          </div>
          <div className={styles.test}>
            {this.testEl(hasSelected)}
          </div>
          <div className={styles.back}>
            <Link to="/groups">Назад к выбору группы</Link>
          </div>
        </div>
      </div>
    );
  }

  private answersEl() {
    if (this.state.chosenAnswer != null) {
      return this.props.answers.map((answer, i) => {
        let className = '';
        const status = this.answerStatus(i);
        if (status === 'correct') {
          className = styles.correct;
        } else if (status === 'incorrect') {
          className = styles.incorrect;
        } else if (i === this.props.correctAnswer - 1) {
          className = styles.correct;
        }

        return <li key={i} className={className}>{variants[i]}. {answer}</li>;
      });
    }

    return this.props.answers.map(
      (answer, i) => (
        <li key={i} onClick={() => this.onAnswerChosen(i)}>{variants[i]}. {answer}</li>
      ),
    );
  }

  private answerEl() {
    return this.state.answerHidden
      ? <button onClick={() => this.setState({ answerHidden: false })}>Показать Ответ</button>
      : <span>Правильный ответ: {variants[this.props.correctAnswer - 1]}</span>;
  }

  private testEl(hasSelected: boolean) {
    if (this.props.testMode) {
      return <Link to="/questions">Назад к вопросам</Link>;
    }

    return hasSelected
      ? <Link to="/test">Работа над ошибками</Link>
      : null;
  }

  private onAnswerChosen(index: number) {
    this.setState({ chosenAnswer: index });
    if (this.props.correctAnswer - 1 !== index) {
      this.props.store!.selectQuestion(this.props.id);
    } else if (this.props.testMode) {
      setTimeout(() => this.props.store!.unselectQuestion(this.props.id), 3000);
    }
  }

  private answerStatus(index: number): 'correct' | 'incorrect' | null {
    if (this.state.chosenAnswer !== index) {
      return null;
    }

    if (this.props.correctAnswer - 1 === this.state.chosenAnswer) {
      return 'correct';
    }

    return 'incorrect';
  }
}
