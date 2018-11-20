import React from 'react';
import { Link } from 'react-router-dom';

export default class Groups extends React.Component {
  public render() {
    return (
      <div>
        <ul>
          <li><Link to={{ pathname: '/questions', search: '?group=1' }}>Вопросы 1 - 200</Link></li>
          <li><Link to={{ pathname: '/questions', search: '?group=2' }}>Вопросы 201 - 400</Link></li>
          <li><Link to={{ pathname: '/questions', search: '?group=3' }}>Вопросы 401 - 600</Link></li>
          <li><Link to={{ pathname: '/questions', search: '?group=4' }}>Вопросы 601 - 800</Link></li>
          <li><Link to={{ pathname: '/questions', search: '?group=5' }}>Вопросы 801 - 1019</Link></li>
        </ul>
      </div>
    );
  }
}
