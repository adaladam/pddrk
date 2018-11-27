export function getGroupByCurrentQuestion(currentQuestion: number): number {
  let group = 1;
  if (currentQuestion >= 1 && currentQuestion <= 200) {
    group = 1;
  } else if (currentQuestion >= 201 && currentQuestion <= 400) {
    group = 2;
  } else if (currentQuestion >= 401 && currentQuestion <= 600) {
    group = 3;
  } else if (currentQuestion >= 601 && currentQuestion <= 800) {
    group = 4;
  } else if (currentQuestion >= 801) {
    group = 5;
  }

  return group;
}
