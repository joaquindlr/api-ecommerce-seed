import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';

const TypeOrmConfigImport = TypeOrmModule.forRoot({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'admin',
  database: 'ecommerce_seed',
  entities: [User],
  synchronize: true,
  autoLoadEntities: true,
});

export default TypeOrmConfigImport;
