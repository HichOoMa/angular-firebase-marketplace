import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-env-test',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="env-test">
      <h2>Environment Variables Test</h2>
      <div class="section">
        <h3>Firebase Configuration</h3>
        <pre>{{ firebaseConfig | json }}</pre>
      </div>
      <div class="section">
        <h3>AWS Configuration</h3>
        <pre>{{ awsConfig | json }}</pre>
      </div>
    </div>
  `,
  styles: [`
    .env-test {
      padding: 20px;
      border: 1px solid #ccc;
      border-radius: 5px;
      margin: 20px;
    }
    .section {
      margin-bottom: 20px;
    }
    pre {
      background-color: #f5f5f5;
      padding: 10px;
      border-radius: 5px;
      overflow-x: auto;
    }
  `]
})
export class EnvTestComponent implements OnInit {
  firebaseConfig: any;
  awsConfig: any;

  ngOnInit(): void {
    // Mask sensitive information
    this.firebaseConfig = {
      apiKey: this.maskString(environment.firebase.apiKey),
      authDomain: environment.firebase.authDomain,
      projectId: environment.firebase.projectId,
      storageBucket: environment.firebase.storageBucket,
      messagingSenderId: environment.firebase.messagingSenderId,
      appId: this.maskString(environment.firebase.appId)
    };

    this.awsConfig = {
      region: environment.aws.region,
      accessKeyId: this.maskString(environment.aws.accessKeyId),
      secretAccessKey: this.maskString(environment.aws.secretAccessKey),
      bucketName: environment.aws.bucketName
    };
  }

  // Helper method to mask sensitive strings
  private maskString(str: string): string {
    if (!str) return '';
    if (str.length <= 8) return '*'.repeat(str.length);
    return str.substring(0, 4) + '*'.repeat(str.length - 8) + str.substring(str.length - 4);
  }
}
