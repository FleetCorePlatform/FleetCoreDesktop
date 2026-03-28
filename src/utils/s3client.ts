import { UserCredentials } from '@/screens/common/types.ts';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';

export async function getBucketImage(credentials: UserCredentials, imageKey: string) {
  const client = new S3Client({
    region: 'eu-north-1',
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      sessionToken: credentials.sessionToken,
    },
  });

  const command = new GetObjectCommand({
    Bucket: 'fleetcore-mission-bucket',
    Key: imageKey,
  });

  const response = await client.send(command);

  if (!response.Body) {
    throw new Error('Response body is empty');
  }

  const byteArray = await response.Body.transformToByteArray();
  const blob = new Blob([byteArray], { type: response.ContentType });

  return URL.createObjectURL(blob);
}