import * as AWS from 'aws-sdk';
const client = new AWS.DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  region: 'ap-northeast-1',
});
import dummyIds from './read_v2.json';

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
      return await client
        .batchGet(
          ddbInputParam as AWS.DynamoDB.DocumentClient.BatchGetItemInput
        )
        .promise();
    })
  );
  const outputs = res.map(({ Responses }) => Responses!.DemoTable);
  // 多次元配列を一次元配列
  const output = outputs.reduce((acc, value) => {
    return acc.concat(value);
  });
  console.log(output);
};

main();
