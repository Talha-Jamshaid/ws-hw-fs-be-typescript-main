
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ObjectType, Field, ID } from 'type-graphql';
import PortfolioVersionEntity from './PortfolioVersionEntity';
// Define the PortfolioEntity class, representing an entity in the database.
@Entity() // Decorator indicating that this class represents an entity in the database.
@ObjectType() // Decorator specifying that this class represents a GraphQL object type.
export default class PortfolioEntity {
  @PrimaryGeneratedColumn() // Decorator specifying that this property is the primary key column and automatically generates values.
  @Field(() => ID) // Decorator specifying that this property should be exposed as a field in the GraphQL schema, with a specified type.
  portfolioId: number; // Property representing the unique identifier for the portfolio entity.

  @Column('varchar', { nullable: false }) // Decorator specifying the database column configuration for this property.
  @Field() // Decorator specifying that this property should be exposed as a field in the GraphQL schema.
  name: string; // Property representing the name of the portfolio.

  @Column('varchar', { nullable: false, unique: true }) // Decorator specifying the database column configuration for this property.
  @Field() // Decorator specifying that this property should be exposed as a field in the GraphQL schema.
  url: string; // Property representing the URL of the portfolio. It must be unique.

  @OneToMany(() => PortfolioVersionEntity, (version) => version.portfolio, { eager: true }) // Decorator specifying a one-to-many relationship with the PortfolioVersionEntity class.
  @Field(() => [PortfolioVersionEntity]) // Decorator specifying that this property should be exposed as a field in the GraphQL schema, with a specified type.
  versions: PortfolioVersionEntity[]; // Property representing an array of portfolio versions associated with the portfolio.
}
