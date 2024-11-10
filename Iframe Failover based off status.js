import { EC2Client, DescribeInstanceStatusCommand } from "@aws-sdk/client-ec2";


const ec2Client = new EC2Client({ region: 'us-east-1' }); 

export const handler = async (event) => {
  const instanceId = 'i-0a872f032b458db33'; 

  try {
    const params = {
      InstanceIds: [instanceId],
    };
    const data = await ec2Client.send(new DescribeInstanceStatusCommand(params));

   
    if (data.InstanceStatuses && data.InstanceStatuses.length > 0) {
      const instanceState = data.InstanceStatuses[0].InstanceState.Name;
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET,OPTIONS',
        },
        body: JSON.stringify({ status: instanceState, countdown: 30 }),  
      };
    } else {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET,OPTIONS',
        },
        body: JSON.stringify({ status: 'stopped', countdown: 30 }),
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET,OPTIONS',
      },
      body: JSON.stringify({ error: `Error: ${error.message}` }),
    };
  }
};
