import { BatchGetItemCommandInput, DynamoDB } from '@aws-sdk/client-dynamodb';

const client = new DynamoDB({
  region: 'ap-northeast-1'
});

import dummyIds from './read_v3.json';

// 配列内の要素を指定した要素数毎に分割
const arrayChunk = <T>([...array], size: number = 1): T[][] => {
  return array.reduce(
    (acc, value, index) =>
      index % size ? acc : [...acc, array.slice(index, index + size)],
    []
  );
};

/* A single operation can retrieve up to 16 MB of data,
which can contain as many as 100 items */
const dividedRequestsIds = arrayChunk(dummyIds, 100);
const ddbInputParams = dividedRequestsIds.map((ids) => ({
  RequestItems: { DemoTable: { Keys: ids } },
}));

const main = async (): Promise<void> => {
  const res = await Promise.all(
    ddbInputParams.map(async (ddbInputParam) => {
      return await client.batchGetItem(
        ddbInputParam as BatchGetItemCommandInput
      );
    })
  );
  console.log(res);
  const outputs = res.map(({ Responses }) => Responses!.DemoTable);
  // 多次元配列を一次元配列
  const output = outputs.reduce((acc, value) => {
    return acc.concat(value);
  });
  console.log(output);
};

main();
