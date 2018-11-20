import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import styles from './App.module.scss';
import Questions from './components/Questions';
import Test from './components/Test';

export default class App extends React.Component {
  public render() {
    return (
      <div className={styles.main}>
        <Switch>
          <Route path="/" exact render={() => <Redirect to="/questions" />}></Route>
          <Route path="/questions" exact component={Questions} />
          <Route path="/test" exact component={Test} />
        </Switch>
      </div>
    );
  }
}
