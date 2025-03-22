import { Injectable } from "@angular/core";
import * as AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class StorageService {
  private s3: AWS.S3;
  private bucketName = ""; // Replace with your actual bucket name

  constructor() {
    // Initialize AWS S3
    AWS.config.update({
      region: environment.aws.region,
      accessKeyId: environment.aws.accessKeyId,
      secretAccessKey: environment.aws.secretAccessKey,
    });

    this.s3 = new AWS.S3();
  }

  async uploadProductImage(file: File): Promise<string> {
    const fileExtension = file.name.split(".").pop();
    const fileName = `products/${uuidv4()}.${fileExtension}`;

    const params = {
      Bucket: this.bucketName,
      Key: fileName,
      Body: file,
      ACL: "public-read",
      ContentType: file.type,
    };

    try {
      const response = await this.s3.upload(params).promise();
      return response.Location; // Return the public URL of the uploaded image
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  }

  async deleteImage(imageUrl: string): Promise<void> {
    // Extract the key from the URL
    const key = imageUrl.split("/").slice(3).join("/");

    const params = {
      Bucket: this.bucketName,
      Key: key,
    };

    try {
      await this.s3.deleteObject(params).promise();
    } catch (error) {
      console.error("Error deleting file:", error);
      throw error;
    }
  }

  // Alternative method using Firebase Storage if AWS S3 setup is complex for the user
  // This can be used as a fallback or alternative to S3
  async uploadToFirebaseStorage(file: File): Promise<string> {
    // Implementation would go here if we decide to use Firebase Storage instead
    // This would require importing and configuring Firebase Storage
    return "";
  }
}
