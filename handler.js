// handler.js
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const region = process.env.AWS_REGION || 'ap-south-1';
AWS.config.update({ region });
const dynamo = new AWS.DynamoDB.DocumentClient();

const TABLE = process.env.TABLE_NAME || `${process.env.SLS_SERVICE || 'serverless-dyn-api'}-${process.env.SLS_STAGE || 'dev'}-items`;

exports.main = async (event) => {
  const method = event.httpMethod;
  const id = event.pathParameters ? event.pathParameters.id : null;

  try {
    if (method === 'GET' && !id) {
      // list
      const res = await dynamo.scan({ TableName: TABLE }).promise();
      return { statusCode: 200, body: JSON.stringify(res.Items) };
    }

    if (method === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const item = { id: uuidv4(), ...body };
      await dynamo.put({ TableName: TABLE, Item: item }).promise();
      return { statusCode: 201, body: JSON.stringify(item) };
    }

    if (method === 'GET' && id) {
      const res = await dynamo.get({ TableName: TABLE, Key: { id } }).promise();
      if (!res.Item) return { statusCode: 404, body: 'Not found' };
      return { statusCode: 200, body: JSON.stringify(res.Item) };
    }

    if (method === 'DELETE' && id) {
      await dynamo.delete({ TableName: TABLE, Key: { id } }).promise();
      return { statusCode: 204, body: '' };
    }

    return { statusCode: 400, body: 'Unsupported operation' };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
