export const asyncForEach = async (arr, callback) => {
  for (let index = 0; index < arr.length; index += 1) {
    await callback(arr[index], index, arr);
  }
};

export const asyncMap = async (array = [], callback) => {
  const resultArray = [];
  for (let index = 0; index < array.length; index++) {
    const mappedValue = await callback(array[index], index, array);
    resultArray[index] = mappedValue;
  }
  return resultArray;
};
