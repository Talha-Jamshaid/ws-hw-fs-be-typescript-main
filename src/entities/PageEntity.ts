import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ObjectType, Field } from 'type-graphql';
import PortfolioEntity from './PortfolioEntity';
import PortfolioVersionEntity from './PortfolioVersionEntity';

// Define the PageEntity class, representing an entity in the database.
@ObjectType() // Decorator specifying that this class represents a GraphQL object type.
@Entity() // Decorator indicating that this class represents an entity in the database.
export default class PageEntity {
  @Field() // Decorator specifying that this property should be exposed as a field in the GraphQL schema.
  @PrimaryGeneratedColumn() // Decorator specifying that this property is the primary key column and automatically generates values.
  id: number; // Property representing the unique identifier for the page entity.

  @Field() // Decorator specifying that this property should be exposed as a field in the GraphQL schema.
  @Column('varchar', { nullable: false }) // Decorator specifying the database column configuration for this property.
  name: string; // Property representing the name of the page.

  @Field() // Decorator specifying that this property should be exposed as a field in the GraphQL schema.
  @Column('varchar', { nullable: false, unique: true }) // Decorator specifying the database column configuration for this property.
  url: string; // Property representing the URL of the page. It must be unique.

  @Field(() => PortfolioEntity) // Decorator specifying that this property should be exposed as a field in the GraphQL schema, with a specified type.
  @ManyToOne(() => PortfolioEntity, { nullable: false }) // Decorator specifying a many-to-one relationship with the PortfolioEntity class.
  portfolio: PortfolioEntity; // Property representing the portfolio to which the page belongs.

  @Field(() => PortfolioVersionEntity) // Decorator specifying that this property should be exposed as a field in the GraphQL schema, with a specified type.
  @ManyToOne(() => PortfolioVersionEntity, { nullable: false }) // Decorator specifying a many-to-one relationship with the PortfolioVersionEntity class.
  portfolioVersion: PortfolioVersionEntity; // Property representing the portfolio version associated with the page.

  @Field() // Decorator specifying that this property should be exposed as a field in the GraphQL schema.
  @Column('varchar', { nullable: false }) // Decorator specifying the database column configuration for this property.
  currentVersionType: string; // Property representing the type of the current version of the page content.

  @Field() // Decorator specifying that this property should be exposed as a field in the GraphQL schema.
  @Column('text', { nullable: false }) // Decorator specifying the database column configuration for this property.
  currentVersionContent: string; // Property representing the content of the current version of the page.
}
