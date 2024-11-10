import { XRayClient, GetTraceSummariesCommand } from "@aws-sdk/client-xray";

const xray = new XRayClient({ region: 'us-east-1' });

export const handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': 'https://zwiese.com/', 
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
            },
            body: '',
        };
    }

    try {
        const traces = await getXRayData(); 

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': 'https://zwiese.com/',  
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
            },
            body: JSON.stringify({ traces }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': 'https://zwiese.com/',  
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
            },
            body: JSON.stringify({ message: 'Failed to retrieve X-Ray traces', error: error.message }),
        };
    }
};

async function getXRayData() {
    const startTime = new Date();
    startTime.setHours(startTime.getHours() - 24);  
    const endTime = new Date();  

    const params = {
        StartTime: startTime,  
        EndTime: endTime,  
    };

    try {
        const command = new GetTraceSummariesCommand(params);
        const result = await xray.send(command);
        return result.TraceSummaries;  
    } catch (error) {
        console.error('Error retrieving X-Ray data:', error);
        throw error;
    }
}
