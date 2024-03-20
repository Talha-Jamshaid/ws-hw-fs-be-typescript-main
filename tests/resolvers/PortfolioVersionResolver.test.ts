import { getRepository } from 'typeorm';
import faker from 'faker';
import PageEntity from '../../src/entities/PageEntity';
import PortfolioVersionEntity from '../../src/entities/PortfolioVersionEntity';
import PortfolioVersionResolver from '../../src/resolvers/PortfolioVersionResolver';

jest.mock('typeorm', () => ({
  getRepository: jest.fn(),
}));

describe('PortfolioVersionResolver', () => {
  let portfolioVersionResolver: PortfolioVersionResolver;
  let portfolioVersionRepository: any;

  beforeEach(() => {
    portfolioVersionResolver = new PortfolioVersionResolver();
    portfolioVersionRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
    };
    (getRepository as jest.Mock).mockReturnValue(portfolioVersionRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createSnapshotVersion', () => {
    it('should create a snapshot version by cloning pages from the draft version', async () => {
      // Arrange
      const draftVersionId = 1;
      const draftVersion: PortfolioVersionEntity = {
        id: draftVersionId,
        type: 'draft',
        pages: [
          {
            id: 1,
            name: faker.name.findName(),
            url: faker.internet.url(),
          },
          {
            id: 2,
            name: faker.name.findName(),
            url: faker.internet.url(),
          },
        ],
      };
      const clonedPages: PageEntity[] = draftVersion.pages.map((page) => {
        const clonedPage = new PageEntity();
        clonedPage.name = page.name;
        clonedPage.url = page.url;
        return clonedPage;
      });
      const snapshotVersion: PortfolioVersionEntity = {
        type: 'snapshot',
        pages: clonedPages,
      };

      portfolioVersionRepository.findOne.mockResolvedValueOnce(draftVersion);
      portfolioVersionRepository.save.mockResolvedValueOnce(snapshotVersion);

      // Act
      const result = await portfolioVersionResolver.createSnapshotVersion(draftVersionId);

      // Assert
      expect(portfolioVersionRepository.findOne).toHaveBeenCalledWith(draftVersionId, { relations: ['pages'] });
      expect(portfolioVersionRepository.save).toHaveBeenCalledWith(snapshotVersion);
      expect(result).toEqual(snapshotVersion);
    });

    it('should throw an error if the draft version is not found', async () => {
      // Arrange
      const draftVersionId = 1;
      portfolioVersionRepository.findOne.mockResolvedValueOnce(undefined);

      // Act and Assert
      await expect(portfolioVersionResolver.createSnapshotVersion(draftVersionId)).rejects.toThrow(
        'Draft version not found'
      );
      expect(portfolioVersionRepository.findOne).toHaveBeenCalledWith(draftVersionId, { relations: ['pages'] });
      expect(portfolioVersionRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('getAllPortfolioVersions', () => {
    it('should return all available portfolio versions', async () => {
      // Arrange
      const portfolioVersions: PortfolioVersionEntity[] = [
        {
          id: 1,
          type: faker.random.word(),
          pages: [],
        },
        {
          id: 2,
          type: faker.random.word(),
          pages: [],
        },
      ];

      portfolioVersionRepository.find.mockResolvedValueOnce(portfolioVersions);

      // Act
      const result = await portfolioVersionResolver.getAllPortfolioVersions();

      // Assert
      expect(portfolioVersionRepository.find).toHaveBeenCalled();
      expect(result).toEqual(portfolioVersions);
    });
  });
});
