import { Injectable } from '@nestjs/common';
import { KafkaService } from './kafka/kafka.service';

@Injectable()
export class AppService {
  constructor(private readonly kafkaService: KafkaService) {}

  async kafkaSend() {
    await this.kafkaService.send('notificator', 'llego una notificacion');

    return 'Message was sent';
  }
}
