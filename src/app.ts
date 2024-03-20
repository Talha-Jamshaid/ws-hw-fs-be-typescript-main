import Koa from 'koa';
import { ApolloServer } from 'apollo-server-koa';
import 'reflect-metadata';
import { buildSchema } from 'type-graphql';
import { getConnection } from './helpers/database';
import config from './config';
import PortfolioResolver from './resolvers/PortfolioResolver';
import PageResolver from './resolvers/PageResolver';

// Define the port on which the server will listen.
// If the PORT environment variable is set, use its value; otherwise, default to port 3000.
const PORT = process.env.PORT || 3000;

// Create a new instance of Koa, a web framework for Node.js.
const app = new Koa();

// Asynchronous IIFE (Immediately Invoked Function Expression) to start the server.
(async () => {
  // Connect to the database using TypeORM.
  await getConnection(); // You should implement this function elsewhere in your codebase.

  // Construct the GraphQL schema by combining resolvers.
  // `PortfolioResolver` and `PageResolver` are resolver classes that define how to resolve GraphQL queries.
  const schema = await buildSchema({
    resolvers: [PortfolioResolver, PageResolver], // Add your resolver class here
  });

  // Create an instance of ApolloServer with the constructed GraphQL schema.
  const apolloServer = new ApolloServer({ schema });

  // Start the ApolloServer.
  await apolloServer.start();

  // Apply Apollo Server middleware to the Koa application.
  // This allows the Koa application to handle GraphQL requests.
  // `config.graphQLPath` specifies the path where GraphQL requests will be handled.
  apolloServer.applyMiddleware({ app, path: config.graphQLPath });

  // Start the Koa application, causing it to listen for incoming HTTP requests on the specified port.
  app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
  });
})();

