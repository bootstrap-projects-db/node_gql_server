import { gql } from "apollo-server";
import User from "../../models/User";

const typeDefs = gql`
  type User {
    id: ID! @log
    email: String!
    name: String!
    createdAt: String! @formatDate
    role: Role!
  }

  enum Role {
    ADMIN
    MEMBER
    GUEST
  }

  input UpdateUserInput {
    email: String
    name: String
    role: String
    password: String
  }

  extend type Query {
    users: [User!] @auth
  }

  extend type Mutation {
    updateUser(input: UpdateUserInput!): User @auth @authorization(role: MEMBER)
  }
`;

const resolvers = {
  Query: {
    async users(_, __, { user }) {
      const users = await User.find({});
      return users;
    },
  },
  Mutation: {
    async updateUser(_, { input }, { user }, info) {
      const _user = await User.findById(user._id);

      if (_user) {
        _user.name = input.name || _user.name;
        _user.email = input.email || _user.email;
        _user.role = input.role || _user.role;
        if (input.password) {
          _user.password = input.password;
        }

        const updatedUser = await _user.save();
        const formatedUser = updatedUser.format();

        return formatedUser;
      } else {
        throw Error("user not found");
      }
    },
  },
};

const user = { typeDefs, resolvers };
export default user;
