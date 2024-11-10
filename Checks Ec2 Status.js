import { EC2Client, DescribeInstanceStatusCommand } from '@aws-sdk/client-ec2';

const ec2Client = new EC2Client({ region: 'us-east-1' });

export const handler = async (event) => {
  const instanceId = 'i-0a872f032b458db33';  


  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': 'https://zwiese.com/',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      },
      body: JSON.stringify('Preflight check handled successfully'),
    };
  }

  try {
    const params = {
      InstanceIds: [instanceId],
      IncludeAllInstances: true,
    };

    const data = await ec2Client.send(new DescribeInstanceStatusCommand(params));

    if (data.InstanceStatuses.length === 0) {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': 'https://zwiese.com/',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        },
        body: JSON.stringify(`Instance ${instanceId} status is not available or it's terminated.`),
      };
    }

    const instanceState = data.InstanceStatuses[0].InstanceState.Name;

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': 'https://zwiese.com/',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      },
      body: JSON.stringify(`Instance ${instanceId} is currently ${instanceState}.`),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': 'https://zwiese.com/',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      },
      body: JSON.stringify(`Error: ${error.message}`),
    };
  }
};
