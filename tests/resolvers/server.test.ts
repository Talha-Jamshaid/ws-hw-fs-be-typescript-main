/* eslint-disable import/no-unresolved */
// eslint-disable-next-line import/no-extraneous-dependencies
import { ApolloServer } from 'apollo-server-express';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ApolloClient, ApolloLink, InMemoryCache } from '@apollo/client';
import { createTestClient } from 'apollo-server-testing';
import { buildSchema } from 'type-graphql';
import  PageResolver  from '../../src/resolvers/PageResolver';

describe('Apollo Server', () => {
  let apolloServer: ApolloServer;
  let testClient: ReturnType<typeof createTestClient>;

  beforeAll(async () => {
    const schema = await buildSchema({
      resolvers: [PageResolver], // Add all your resolvers here
    });

    apolloServer = new ApolloServer({ schema });
    await apolloServer.start();

    const serverUrl = apolloServer.graphqlPath;
    const link = new ApolloLink((operation, forward) => {
      operation.setContext(() => ({
        headers: {
          Authorization: 'Bearer <your-access-token>',
        },
      }));
      return forward(operation);
    });
    const cache = new InMemoryCache();
    const apolloClient = new ApolloClient({ link, cache, uri: serverUrl });
    testClient = createTestClient({ apolloServer, apolloClient });
  });

  it('should return all portfolio versions', async () => {
    const query = `
      query {
        getAllPortfolioVersions {
          id
          name
        }
      }
    `;

    const { data, errors } = await testClient.query({ query });

    expect(errors).toBeUndefined();
    expect(data?.getAllPortfolioVersions).toBeDefined();
  });

  it('should create a snapshot version', async () => {
    const mutation = `
      mutation {
        createSnapshotVersion(
          pageId: 1
          type: "snapshot"
          content: "Snapshot content"
        ) {
          id
          name
        }
      }
    `;

    const { data, errors } = await testClient.mutate({ mutation });

    expect(errors).toBeUndefined();
    expect(data?.createSnapshotVersion).toBeDefined();
  });

  // Add more test cases for other queries and mutations

  afterAll(async () => {
    await apolloServer.stop();
  });
});
