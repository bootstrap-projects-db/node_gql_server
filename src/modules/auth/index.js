import { gql } from "apollo-server";
import User from "../../models/User";

const typeDefs = gql`
  #----------
  type User {
    id: ID!
    email: String!
    name: String!
    createdAt: String!
    role: Role!
  }

  enum Role {
    ADMIN
    MEMBER
    GUEST
  }
  #-------

  type AuthUser {
    token: String!
    user: User!
  }

  input RegisterInput {
    name: String!
    email: String!
    password: String!
    role: Role!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  extend type Query {
    currentUser: User!
  }

  extend type Mutation {
    register(input: RegisterInput!): AuthUser!
    login(input: LoginInput!): AuthUser!
  }
`;

const resolvers = {
  Query: {
    currentUser(_, __, { user }) {
      const { _id, role, name, email, createdAt } = user;
      return { id: _id, role, name, email, createdAt };
    },
  },
  Mutation: {
    async register(_, { input }) {
      const { name, email, password, role } = input;
      const existing = await User.findOne({ email });

      if (existing) {
        throw new Error("nope");
      }

      const user = await User.create({
        name,
        email,
        password,
        role,
      });

      const token = user.getSignedToken();

      return { token, user };
    },

    async login(_, { input }) {
      const { email, password } = input;

      const user = await User.findOne({ email }).select("+password");

      if (!user) {
        throw new Error("wrong email and password");
      }

      const passwordMatch = await user.matchPassword(password);

      if (!passwordMatch) {
        throw new Error("wrong email and password");
      }

      const token = user.getSignedToken();
      return { token, user };
    },
  },
};

export default { typeDefs, resolvers };