import { EC2Client, StartInstancesCommand, StopInstancesCommand } from '@aws-sdk/client-ec2';

const ec2Client = new EC2Client({ region: 'us-east-1' });

export const handler = async (event) => {
  let action;

  if (event.body) {
    const body = JSON.parse(event.body);
    action = body.action;  
  } else {
    action = event.action;  
  }

  
  if (action !== 'start' && action !== 'stop') {
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': 'https://zwiese.com',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      },
      body: JSON.stringify('Invalid input: Please provide a valid action (start/stop).'),
    };
  }

  try {
    if (action === 'start') {
      const startParams = { InstanceIds: ['i-0a872f032b458db33'] };
      await ec2Client.send(new StartInstancesCommand(startParams));
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': 'https://zwiese.com',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        },
        body: JSON.stringify('Instance started successfully.'),
      };
    } else if (action === 'stop') {
      const stopParams = { InstanceIds: ['i-0a872f032b458db33'] };
      await ec2Client.send(new StopInstancesCommand(stopParams));
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': 'https://zwiese.com',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        },
        body: JSON.stringify('Instance stopped successfully.'),
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': 'https://zwiese.com',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      },
      body: JSON.stringify(`Error: ${error.message}`),
    };
  }
};
