import { Injectable } from '@nestjs/common';
import { Kafka } from 'kafkajs';
import { Topics } from './topics';

@Injectable()
export class KafkaService {
  private kafka = new Kafka({
    clientId: 'ecommerce-seed',
    brokers: ['localhost:9092'],
  });

  async send(topic: string, message: string) {
    const producer = this.kafka.producer();
    await producer.connect();
    await producer.send({
      topic,
      messages: [{ value: message }],
    });
    await producer.disconnect();
  }

  async sendRegisterUserMail(userRegisterObject: {
    email: string;
    password: string;
    username: string;
    confirmationCode?: number;
    confirmationCodeExpiration?: string;
  }) {
    const payload = {
      email: userRegisterObject.email,
      username: userRegisterObject.username,
      confirmationCode: userRegisterObject.confirmationCode,
      confirmationCodeExpiration: userRegisterObject.confirmationCodeExpiration,
    };

    this.send(Topics.NOTIFICATOR, JSON.stringify(payload));
  }
}
