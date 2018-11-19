import React from 'react';
import styles from './App.module.scss';

export default class App extends React.Component {
  public render() {
    return (
      <div className={styles.main}>
        Hello world!
      </div>
    );
  }
}
