import { S3Client, ListObjectsV2Command, DeleteObjectsCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({ region: "us-east-1" });

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': 'https://zwiese.com',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      },
      body: JSON.stringify({ message: 'Preflight OPTIONS request' })
    };
  }

  const bucketName = "resumetunerapp";

  try {
    const listParams = {
      Bucket: bucketName,
    };

    const listedObjects = await s3Client.send(new ListObjectsV2Command(listParams));

    if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': 'https://zwiese.com',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
        },
        body: JSON.stringify({ message: 'No files to delete in the bucket' })
      };
    }

    const deleteParams = {
      Bucket: bucketName,
      Delete: {
        Objects: listedObjects.Contents.map(({ Key }) => ({ Key }))
      }
    };

    await s3Client.send(new DeleteObjectsCommand(deleteParams));

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': 'https://zwiese.com',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      },
      body: JSON.stringify({ message: 'All files successfully deleted from the bucket' })
    };
  } catch (error) {
    console.error('Error deleting files from S3:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': 'https://zwiese.com',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      },
      body: JSON.stringify({ error: `Error: ${error.message}` })
    };
  }
};
