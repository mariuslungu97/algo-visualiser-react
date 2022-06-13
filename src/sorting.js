function swap(arr, idx1, idx2) {
  const temp = arr[idx1];
  arr[idx1] = arr[idx2];
  arr[idx2] = temp;
}

/**
 * generates visualisation steps using the bubble sort algo
 * @param {Array} values to sort
 * @param {Array} ids of associated shapes
 * @returns {Array} steps [{highlightIds: [], cmpIds: [], swapped: boolean}, {}, ... {}]
 */
export function bubbleSort(values, ids) {
  let steps = [];
  for (let i = 0; i < values.length - 1; i++) {
    let swapped = false;
    for (let j = 0; j < values.length - 1 - i; j++) {
      let step = {
        highlighted: ids.slice(0, values.length - 1 - i),
        compared: [ids[j], ids[j + 1]],
        swapped: false,
      };
      if (values[j] > values[j + 1]) {
        swapped = true;
        swap(values, j, j + 1);
        swap(ids, j, j + 1);
        step.swapped = true;
      }
      steps.push(step);
    }
    if (!swapped) break;
  }
  return steps;
}

/**
 * generates visualisation steps using the insertion sort algo
 * @param {*} values to sort
 * @param {*} ids of associated shapes
 * @returns {Array} steps [{highlightIds: String[], keyId: String, swapIds: String[]}]
 */
export function insertionSort(values, ids) {
  let steps = [];
  for (let i = 1; i < values.length; i++) {
    let key = values[i];
    let keyId = ids[i];
    let j = i - 1;
    while (j >= 0) {
      let step = {
        highlighted: ids.slice(0, i + 1),
        compared: [keyId, ids[j]],
        swapped: false,
      };
      if (values[j] <= key) {
        steps.push(step);
        break;
      }

      step.swapped = true;
      steps.push(step);
      values[j + 1] = values[j];
      ids[j + 1] = ids[j];
      j--;
    }
    values[j + 1] = key;
    ids[j + 1] = keyId;
  }
  return steps;
}

function merge(values, ids, steps, left, mid, right) {
  let step = {
    highlighted: ids.slice(left, right + 1),
    compared: ids.slice(left, right + 1),
  };
  const subArrayOne = values.slice(left, mid + 1);
  const subArrayTwo = values.slice(mid + 1, right + 1);

  const subArrayIdsOne = ids.slice(left, mid + 1);
  const subArrayIdsTwo = ids.slice(mid + 1, right + 1);

  let indexOfMergedArray = left,
    indexOfSubArrayOne = 0,
    indexOfSubArrayTwo = 0;
  while (
    indexOfSubArrayOne < subArrayOne.length &&
    indexOfSubArrayTwo < subArrayTwo.length
  ) {
    if (subArrayOne[indexOfSubArrayOne] <= subArrayTwo[indexOfSubArrayTwo]) {
      values[indexOfMergedArray] = subArrayOne[indexOfSubArrayOne];
      ids[indexOfMergedArray] = subArrayIdsOne[indexOfSubArrayOne];
      indexOfSubArrayOne++;
    } else {
      values[indexOfMergedArray] = subArrayTwo[indexOfSubArrayTwo];
      ids[indexOfMergedArray] = subArrayIdsTwo[indexOfSubArrayTwo];
      indexOfSubArrayTwo++;
    }
    indexOfMergedArray++;
  }

  while (indexOfSubArrayOne < subArrayOne.length) {
    values[indexOfMergedArray] = subArrayOne[indexOfSubArrayOne];
    ids[indexOfMergedArray] = subArrayIdsOne[indexOfSubArrayOne];
    indexOfSubArrayOne++;
    indexOfMergedArray++;
  }

  while (indexOfSubArrayTwo < subArrayTwo.length) {
    values[indexOfMergedArray] = subArrayTwo[indexOfSubArrayTwo];
    ids[indexOfMergedArray] = subArrayIdsTwo[indexOfSubArrayTwo];
    indexOfSubArrayTwo++;
    indexOfMergedArray++;
  }
  step.merged = ids.slice(left, right + 1);
  steps.push(step);
}

export function mergeSort(values, ids, steps, begin, end) {
  if (begin >= end) return;

  const mid = begin + Math.floor((end - begin) / 2);
  steps.push({ highlighted: ids.slice(begin, mid + 1), compared: [] });
  mergeSort(values, ids, steps, begin, mid);
  steps.push({ highlighted: ids.slice(mid + 1, end + 1), compared: [] });
  mergeSort(values, ids, steps, mid + 1, end);
  merge(values, ids, steps, begin, mid, end);
}

function partition(values, ids, steps, start, end) {
  let step = {
    highlighted: ids.slice(start, end + 1),
    compared: ids.slice(start, end + 1),
  };
  const pivot = values[end];
  let j = start - 1;

  for (let i = start; i <= end - 1; i++) {
    if (values[i] < pivot) {
      j++;
      swap(values, j, i);
      swap(ids, j, i);
    }
  }

  swap(values, j + 1, end);
  swap(ids, j + 1, end);
  step.merged = ids.slice(start, end + 1);
  steps.push(step);
  return j + 1;
}

export function quickSort(values, ids, steps, low, high) {
  if (low < high) {
    const pi = partition(values, ids, steps, low, high);
    steps.push({ highlighted: ids.slice(low, pi), compared: [] });
    quickSort(values, ids, steps, low, pi - 1);
    steps.push({ highlighted: ids.slice(pi + 1, high + 1), compared: [] });
    quickSort(values, ids, steps, pi + 1, high);
  }
}
