if (method === 'PUT' && id) {
      const body = JSON.parse(event.body || '{}');
      const updateExp = [];
      const expAttrValues = {};

      for (const key in body) {
        updateExp.push(`#${key} = :${key}`);
        expAttrValues[`:${key}`] = body[key];
      }

      const ExpressionAttributeNames = {};
      updateExp.forEach(exp => {
        const key = exp.split('=')[0].trim().replace('#','');
        ExpressionAttributeNames[`#${key}`] = key;
      });

      await dynamo.update({
        TableName: TABLE,
        Key: { id },
        UpdateExpression: `SET ${updateExp.join(', ')}`,
        ExpressionAttributeValues: expAttrValues,
        ExpressionAttributeNames
      }).promise();

      return { statusCode: 200, body: JSON.stringify({ message: "Updated", id }) };
    }
