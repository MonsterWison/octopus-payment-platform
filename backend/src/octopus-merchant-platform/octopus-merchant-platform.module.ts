import { Module } from '@nestjs/common';
import { OctopusMerchantPlatformController } from './octopus-merchant-platform.controller';
import { OctopusMerchantPlatformService } from './octopus-merchant-platform.service';

@Module({
  controllers: [OctopusMerchantPlatformController],
  providers: [OctopusMerchantPlatformService],
  exports: [OctopusMerchantPlatformService],
})
export class OctopusMerchantPlatformModule {}
