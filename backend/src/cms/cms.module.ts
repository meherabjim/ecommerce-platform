import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CmsController } from './cms.controller';
import { CmsService } from './cms.service';
import { StoreSetting } from './models/store-setting.model';
import { HomepageSection } from './models/homepage-section.model';
import { ContentBlock } from './models/content-block.model';
import { CmsPage } from './models/cms-page.model';

@Module({
  imports:[SequelizeModule.forFeature([
    StoreSetting,HomepageSection,ContentBlock,CmsPage
  ])],
  controllers:[CmsController],
  providers:[CmsService],
  exports:[CmsService],
})
export class CmsModule {}
