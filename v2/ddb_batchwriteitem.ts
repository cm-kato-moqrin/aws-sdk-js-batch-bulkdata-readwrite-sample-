import * as AWS from 'aws-sdk';

const client = new AWS.DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  region: 'ap-northeast-1',
});

import dummyData from './write_v2.json';

const requestsItems = dummyData.map((item) => ({ PutRequest: { Item: item } }));

// 配列内の要素を指定した要素数毎に分割
const arrayChunk = <T>([...array], size: number = 1): T[][] => {
  return array.reduce(
    (acc, value, index) =>
      index % size ? acc : [...acc, array.slice(index, index + size)],
    []
  );
};

/* A single call to BatchWriteItem can transmit up to 16MB of data over the network,
consisting of up to 25 item put or delete operations. */
const dividedRequestsItems = arrayChunk(requestsItems, 25);
const ddbInputParams = dividedRequestsItems.map((putRequests) => ({
  RequestItems: { DemoTable: putRequests },
}));

const main1 = async () => {
  for (const ddbInputParam of ddbInputParams) {
    await client
      .batchWrite(
        ddbInputParam as AWS.DynamoDB.DocumentClient.BatchWriteItemInput
      )
      .promise()
      .catch((err) => console.log('Error', err));
  }
};

const main2 = async () => {
  await Promise.all(
    ddbInputParams.map(async (ddbInputParam) => {
      return await client
        .batchWrite(
          ddbInputParam as AWS.DynamoDB.DocumentClient.BatchWriteItemInput
        )
        .promise()
        .catch((err) => console.log('Error', err));
    })
  );
};

main1();
