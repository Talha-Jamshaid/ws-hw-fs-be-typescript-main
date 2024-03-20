import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn} from 'typeorm';
import { Field, ObjectType,ID  } from 'type-graphql';
import PageEntity from './PageEntity';
import PortfolioEntity from './PortfolioEntity';

// Define the PortfolioVersionEntity class, representing an entity in the database.
@Entity() // Decorator indicating that this class represents an entity in the database.
@ObjectType() // Decorator specifying that this class represents a GraphQL object type.
export default class PortfolioVersionEntity {
  @PrimaryGeneratedColumn() // Decorator specifying that this property is the primary key column and automatically generates values.
  @Field(() => ID) // Decorator specifying that this property should be exposed as a field in the GraphQL schema, with a specified type.
  id: number; // Property representing the unique identifier for the portfolio version entity.

  @Column('varchar', { nullable: false }) // Decorator specifying the database column configuration for this property.
  @Field() // Decorator specifying that this property should be exposed as a field in the GraphQL schema.
  type: string; // Property representing the type of the portfolio version (e.g., draft, snapshot, published).

  @Field(() => PortfolioEntity) // Decorator specifying that this property should be exposed as a field in the GraphQL schema, with a specified type.
  @ManyToOne(() => PortfolioEntity, { nullable: false }) // Decorator specifying a many-to-one relationship with the PortfolioEntity class.
  portfolio: PortfolioEntity; // Property representing the portfolio to which the portfolio version belongs.

  @Field(() => [PageEntity]) // Decorator specifying that this property should be exposed as a field in the GraphQL schema, with a specified type.
  @OneToMany(() => PageEntity, (page) => page.portfolioVersion) // Decorator specifying a one-to-many relationship with the PageEntity class.
  pages: PageEntity[]; // Property representing an array of pages associated with the portfolio version.
}
