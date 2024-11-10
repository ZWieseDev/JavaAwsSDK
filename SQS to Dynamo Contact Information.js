import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const dynamoDBClient = new DynamoDBClient({ region: 'us-east-1' });
const snsClient = new SNSClient({ region: 'us-east-1' });

export const handler = async (event) => {
    const snsTopicArn = "arn:aws:sns:us-east-1:886436928089:SQSSubmissionNotification"; 

    for (const record of event.Records) {
        const message = JSON.parse(record.body);
        const { name, email, business, message: contactMessage } = message;

        const params = {
            TableName: "ContactFormSubmissions",
            Item: {
                "Business": { S: business },
                "Email": { S: email },
                "Name": { S: name },
                "Message": { S: contactMessage }
            }
        };

        try {
            await dynamoDBClient.send(new PutItemCommand(params));

            const snsParams = {
                TopicArn: snsTopicArn,
                Message: `A new contact form submission:\n\nName: ${name}\nBusiness: ${business}\nEmail: ${email}\nMessage: ${contactMessage}`,
                Subject: "New Contact Form Submission",
            };

            await snsClient.send(new PublishCommand(snsParams));
            console.log("SNS notification sent!");

        } catch (err) {
            console.error("Error processing record:", err);
        }
    }
};
