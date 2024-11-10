import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import AdmZip from 'adm-zip';
import fs from 'fs';
import fetch from 'node-fetch';
import path from 'path';

const s3Client = new S3Client({ region: 'us-east-1' });

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': 'https://zwiese.com',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      },
      body: JSON.stringify({ message: 'Preflight OPTIONS request' }),
    };
  }

  const githubRepoUrl = 'https://github.com/ZWieseDev/tuner/archive/refs/heads/main.zip';
  const localZipPath = '/tmp/tuner.zip'; 
  const extractPath = '/tmp/tuner/';     
  const bucketName = 'resumetunerapp';   

  try {
    console.log('Downloading repository from GitHub...');
    const response = await fetch(githubRepoUrl);
    if (!response.ok) {
      throw new Error(`Failed to download file. Status code: ${response.status}`);
    }
    
    const buffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(localZipPath, buffer);
    console.log(`Downloaded zip file to ${localZipPath}`);

    console.log('Extracting zip file locally...');
    const zip = new AdmZip(localZipPath);
    const zipEntries = zip.getEntries();

    console.log('Zip Entries:');
    zipEntries.forEach((entry) => {
      console.log(entry.entryName); 
    });

    zipEntries.forEach((entry) => {
      if (!entry.isDirectory) {
        const relativePath = entry.entryName.replace('Tuner-main/', ''); 
        const localFilePath = path.join(extractPath, relativePath);
        
        const dir = path.dirname(localFilePath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(localFilePath, entry.getData());
        console.log(`Extracted file: ${relativePath}`);
      }
    });

    const files = fs.readdirSync(extractPath);
    for (const file of files) {
      const localFile = path.join(extractPath, file);
      const fileStream = fs.createReadStream(localFile);
      
      console.log(`Uploading extracted file: ${file} to S3 bucket: ${bucketName}`);

      let contentType = 'application/octet-stream'; 
      if (file.endsWith('.html')) {
        contentType = 'text/html';
      } else if (file.endsWith('.js')) {
        contentType = 'application/javascript';
      } else if (file.endsWith('.css')) {
        contentType = 'text/css';
      }

      const uploadParams = {
        Bucket: bucketName,
        Key: file, 
        Body: fileStream,
        ContentType: contentType,  
      };

      await s3Client.send(new PutObjectCommand(uploadParams));
      console.log(`Uploaded ${file} to S3 with Content-Type: ${contentType}`);
    }

    fs.unlinkSync(localZipPath);  
    console.log(`Deleted the zip file from Lambda's /tmp`);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': 'https://zwiese.com', 
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      },
      body: 'Files successfully downloaded, unzipped, and uploaded to S3 with correct metadata',
    };

  } catch (error) {
    console.error('Error during S3 operation:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': 'https://zwiese.com',  
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      },
      body: JSON.stringify({ error: `Error: ${error.message}` }),  
    };
  }
};
