import trie from 'trie-prefix-tree';

import questions from './questions.json';

export interface IIndexValue {
  readonly id: number;
  readonly question: string;
  readonly picture: string;
  readonly answers: ReadonlyArray<string>;
  readonly correctAnswer: number;
}

interface IIndex {
  [key: string]: IIndexValue[];
}

const index: IIndex = {};
const wfls: string[] = [];

const symbols = ['«', '(', '-', ':', '“', ',', '.', '`'];
for (const question of questions) {
  const wfl = question.question
    .split(' ')
    .map(w => w.trim().toLowerCase())
    .filter(w => w)
    .map(w => symbols.indexOf(w[0]) > -1 ? w[1] : w[0])
    .filter(w => symbols.indexOf(w) === -1)
    .join('')
    .toLowerCase();

  if (index[wfl] == null) {
    index[wfl] = [];
  }

  index[wfl].push(question);
  wfls.push(wfl);
}

const tree = trie(wfls);

export function search(wfl: string): IIndexValue[] {
  let result: IIndexValue[] = [];

  const prefixes = tree.getPrefix(wfl);
  if (prefixes.length === 0) {
    return [];
  }

  for (const prefix of prefixes.map((p: string) => p.toLowerCase())) {
    result = [...result, ...index[prefix]];
  }

  return result;
}
