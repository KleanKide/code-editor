import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ProjectsModule } from '../projects/projects.module';
import { CollaborationGateway } from './collaboration.gateway';
import { CollaborationService } from './collaboration.service';

@Module({
  imports: [
    ConfigModule,
    ProjectsModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
      }),
    }),
  ],
  providers: [CollaborationGateway, CollaborationService],
})
export class CollaborationModule {}
