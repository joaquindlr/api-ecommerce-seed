import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import TypeOrmConfigImport from './config/TypeOrmConfig';
import { KafkaService } from './kafka/kafka.service';

@Module({
  imports: [TypeOrmConfigImport, UsersModule, AuthModule, ProductsModule],
  controllers: [AppController],
  providers: [AppService, KafkaService],
})
export class AppModule {}
