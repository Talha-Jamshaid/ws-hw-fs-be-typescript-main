import faker from 'faker';
import { DeepPartial, getRepository } from 'typeorm';
import PortfolioEntity from '../../src/entities/PortfolioEntity';
import PageEntity from '../../src/entities/PageEntity';
import PortfolioVersionEntity from '../../src/entities/PortfolioVersionEntity';

// Function to build a PageEntity with optional properties.
export function buildPageEntity(properties?: DeepPartial<PageEntity>) {
  // Get repositories for PageEntity, PortfolioEntity, and PortfolioVersionEntity.
  const pageRepository = getRepository(PageEntity);
  const portfolioRepository = getRepository(PortfolioEntity);
  const portfolioVersionRepository = getRepository(PortfolioVersionEntity);

  // Create a fake portfolio with random name and URL.
  const portfolio = portfolioRepository.create({
    name: faker.name.findName(), // Generate a random name.
    url: faker.internet.url(), // Generate a random URL.
  });

  // Create a fake portfolio version with a random type and associated portfolio.
  const portfolioVersion = portfolioVersionRepository.create({
    type: faker.random.word(), // Generate a random word.
    portfolio, // Associate with the created portfolio.
  });

  // Create a PageEntity with random name, URL, and associated portfolio and portfolio version.
  return pageRepository.create({
    name: faker.name.findName(), // Generate a random name.
    url: faker.internet.url(), // Generate a random URL.
    portfolio, // Associate with the created portfolio.
    portfolioVersion, // Associate with the created portfolio version.
    ...properties, // Override with provided properties if any.
  });
}

// Async function to create a PageEntity in the database with optional properties.
async function createPageEntity(properties?: DeepPartial<PageEntity>) {
  // Get the repository for PageEntity and save the built PageEntity.
  const pageRepository = getRepository(PageEntity);
  return pageRepository.save(buildPageEntity(properties));
}

// Export the createPageEntity function as default.
export default createPageEntity;
