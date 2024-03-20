import { Mutation, Query, Resolver, Arg, Float, InputType, Field } from 'type-graphql';
import { Service } from 'typedi';
import { getRepository } from 'typeorm';
import PageEntity from '../entities/PageEntity';
import PortfolioVersionEntity from '../entities/PortfolioVersionEntity';
import PortfolioEntity from '../entities/PortfolioEntity';

@InputType()
class PageInput {
  @Field()
  name: string;

  @Field()
  url: string;
}

@Resolver()
@Service()
export default class PageResolver {
  // Modified Mutation to create Draft Version of Portfolio..................................

  @Mutation(() => PortfolioVersionEntity)
  async createDraftVersion(@Arg('portfolioId', () => Float) portfolioId: number): Promise<PortfolioVersionEntity> {
    // Find the portfolio by portfolioId
    const portfolioRepository = getRepository(PortfolioEntity);
    const portfolio = await portfolioRepository.findOne(portfolioId);

    if (!portfolio) {
      throw new Error(`Portfolio with ID ${portfolioId} not found`);
    }

    // Create a new draft version
    const portfolioVersionRepository = getRepository(PortfolioVersionEntity);
    const draftVersion = portfolioVersionRepository.create({
      portfolio,
      type: 'draft',
    });
    await portfolioVersionRepository.save(draftVersion);

    // Add the draft version to the portfolio's versions array
    portfolio.versions = portfolio.versions || [];
    portfolio.versions.push(draftVersion);
    await portfolioRepository.save(portfolio);

    return draftVersion;
  }

  // Mutation to make snapShotVersion from Draft Version Of Portfolio..........................

  @Mutation(() => PortfolioVersionEntity)
  async createSnapshotVersion(@Arg('portfolioId', () => Float) portfolioId: number): Promise<PortfolioVersionEntity> {
    // Find the portfolio by portfolioId
    const portfolioRepository = getRepository(PortfolioEntity);
    const portfolio = await portfolioRepository.findOne(portfolioId, { relations: ['versions', 'versions.pages'] });

    if (!portfolio) {
      throw new Error(`Portfolio with ID ${portfolioId} not found`);
    }

    // Find the draft version in the portfolio's versions array
    const draftVersion = portfolio.versions.find((version) => version.type === 'draft');

    if (!draftVersion) {
      throw new Error(`Draft version for portfolio with ID ${portfolioId} not found`);
    }

    // Create a new snapshot version based on the draft version
    const snapshotVersionRepository = getRepository(PortfolioVersionEntity);

    const newSnapshotVersion = snapshotVersionRepository.create({
      type: 'snapshot',
      pages: draftVersion.pages.map((page) => ({ ...page, id: undefined })),
    });

    newSnapshotVersion.portfolio = portfolio; // Set the portfolio for the new snapshot version
    await snapshotVersionRepository.save(newSnapshotVersion);

    // Copy the pages from the draft version to the new snapshot version
    const pageRepository = getRepository(PageEntity);
    const copiedPages = draftVersion.pages.map((page) => {
      const copiedPage = pageRepository.create({
        ...page,
        portfolio: newSnapshotVersion.portfolio,
        portfolioVersion: newSnapshotVersion,
      });
      return copiedPage;
    });
    await pageRepository.save(copiedPages);

    newSnapshotVersion.pages = copiedPages; // Set the copied pages for the new snapshot version
    await snapshotVersionRepository.save(newSnapshotVersion);

    // Add the new snapshot version to the portfolio's versions array
    portfolio.versions.push(newSnapshotVersion);
    await portfolioRepository.save(portfolio);

    return newSnapshotVersion;
  }

  // Mutation To Add Pages In Draft Version Of Portfolio................................

  @Mutation(() => PortfolioVersionEntity)
  async addPagesToDraftVersion(
    @Arg('portfolioId', () => Float) portfolioId: number,
    @Arg('pages', () => [PageInput]) pages: PageInput[]
  ): Promise<PortfolioVersionEntity> {
    // Find the draft version of the portfolio
    const portfolioVersionRepository = getRepository(PortfolioVersionEntity);
    const draftVersion = await portfolioVersionRepository
      .createQueryBuilder('version')
      .leftJoinAndSelect('version.portfolio', 'portfolio')
      .where('portfolio.portfolioId = :portfolioId', { portfolioId })
      .andWhere('version.type = :type', { type: 'draft' })
      .leftJoinAndSelect('version.pages', 'pages')
      .getOne();

    if (!draftVersion) {
      throw new Error(`Draft version for portfolio with ID ${portfolioId} not found`);
    }

    // Create page entities for the new pages
    const pageRepository = getRepository(PageEntity);
    const pageEntities = pages.map((page) => {
      const pageEntity = pageRepository.create({
        ...page,
        portfolio: draftVersion.portfolio,
        portfolioVersion: draftVersion,
        currentVersionType: 'draft', // Set the current version type as 'draft'
        currentVersionContent: 'Page Content For Draft Version Of Portfolio',
      });
      return pageEntity;
    });

    // Save the new pages
    await pageRepository.save(pageEntities);

    // Add the new pages to the draft version
    draftVersion.pages.push(...pageEntities);

    // Save the updated draft version
    await portfolioVersionRepository.save(draftVersion);

    return draftVersion;
  }

  // Mutation To Create Published Version Of Portfolio.......................................

  @Mutation(() => PortfolioVersionEntity)
  async createPublishedVersion(@Arg('portfolioId', () => Float) portfolioId: number): Promise<PortfolioVersionEntity> {
    // Find the portfolio by portfolioId
    const portfolioRepository = getRepository(PortfolioEntity);
    const portfolio = await portfolioRepository.findOne(portfolioId, { relations: ['versions', 'versions.pages'] });

    if (!portfolio) {
      throw new Error(`Portfolio with ID ${portfolioId} not found`);
    }

    // Find the draft version in the portfolio's versions array
    const draftVersion = portfolio.versions.find((version) => version.type === 'draft');

    if (!draftVersion) {
      throw new Error(`Draft version for portfolio with ID ${portfolioId} not found`);
    }

    // Create a new published version based on the draft version
    const publishedVersionRepository = getRepository(PortfolioVersionEntity);
    const newPublishedVersion = publishedVersionRepository.create({
      type: 'published',
      pages: draftVersion.pages.map((page) => ({ ...page, id: undefined })),
    });
    newPublishedVersion.portfolio = portfolio; // Set the portfolio for the new published version
    await publishedVersionRepository.save(newPublishedVersion);

    // Copy the pages from the draft version to the new published version
    const pageRepository = getRepository(PageEntity);
    const copiedPages = draftVersion.pages.map((page) => {
      const copiedPage = pageRepository.create({
        ...page,
        portfolio: newPublishedVersion.portfolio,
        portfolioVersion: newPublishedVersion,
      });
      return copiedPage;
    });
    await pageRepository.save(copiedPages);

    newPublishedVersion.pages = copiedPages; // Set the copied pages for the new published version
    await publishedVersionRepository.save(newPublishedVersion);

    // Add the new published version to the portfolio's versions array
    portfolio.versions.push(newPublishedVersion);
    await portfolioRepository.save(portfolio);

    return newPublishedVersion;
  }

  // Query to get all versions of portfolio..................................................

  @Query(() => [PortfolioVersionEntity])
  async getPortfolioVersions(@Arg('portfolioId', () => Float) portfolioId: number): Promise<PortfolioVersionEntity[]> {
    const portfolioRepository = getRepository(PortfolioEntity);
    const portfolio = await portfolioRepository.findOne(portfolioId, { relations: ['versions'] });

    if (!portfolio) {
      throw new Error(`Portfolio with ID ${portfolioId} not found`);
    }

    return portfolio.versions;
  }

  // Query to get All Pages in Versions of Portfolio.......................................................

  @Query(() => [PageEntity])
  async getPortfolioVersionPages(
    @Arg('portfolioId', () => Float) portfolioId: number,
    @Arg('versionType', () => String) versionType: string
  ): Promise<PageEntity[]> {
    const versionRepository = getRepository(PortfolioVersionEntity);
    const version = await versionRepository.findOne({
      where: { portfolio: { portfolioId }, type: versionType },
      relations: ['pages'],
    });

    if (!version) {
      throw new Error(`Portfolio version of type '${versionType}' with ID ${portfolioId} not found`);
    }

    return version.pages;
  }
}
