import { Arg, Mutation, Query, Resolver } from 'type-graphql';
import { Service } from 'typedi';
import { getRepository } from 'typeorm';

import PortfolioEntity from '../entities/PortfolioEntity';
// import PortfolioVersionEntity from '../entities/PortfolioVersionEntity';

@Resolver()
@Service()
export default class PortfolioResolver {
  // Query to get All Portfolios ..........................

  @Query(() => [PortfolioEntity], { description: 'Get all portfolios' })
  async getAllPortfolios(): Promise<PortfolioEntity[]> {
    const portfolioRepository = getRepository(PortfolioEntity);
    const portfolios = await portfolioRepository.find();
    return portfolios;
  }

  // Mutation To Create A New Portfolio........

  @Mutation(() => PortfolioEntity, { description: 'Create a new portfolio' })
  async createPortfolio(@Arg('name') name: string, @Arg('url') url: string): Promise<PortfolioEntity> {
    const portfolioRepository = getRepository(PortfolioEntity);
    const portfolio = new PortfolioEntity();
    portfolio.name = name;
    portfolio.url = url;
    await portfolioRepository.save(portfolio);
    return portfolio;
  }
}
