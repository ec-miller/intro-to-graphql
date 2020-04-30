import { Product } from './product.model'
import { User, roles } from '../user/user.model'
import { AuthenticationError } from 'apollo-server'
import mongoose from 'mongoose'

const productsTypeMatcher = {
  GAMING_PC: 'GamingPc',
  BIKE: 'Bike',
  DRONE: 'Drone'
}

/** product */
const product = (_, args, ctx) => {
  if (ctx.user) {
    return Product.findById(args.id)
      .lean()
      .exec()
  } else {
    throw new AuthenticationError()
  }
}

const newProduct = (_, args, ctx) => {
  // use this fake ID for createdBy for now until we talk auth
  if (ctx.user && ctx.user.role === 'admin') {
    const createdBy = ctx.user._id
    return Product.create({ ...args.input, createdBy })
  } else {
    throw new AuthenticationError()
  }
}

const products = (_, args, ctx) => {
  if (ctx.user) {
    return Product.find({})
      .lean()
      .exec()
  } else {
    throw new AuthenticationError()
  }
}

const updateProduct = (_, args, ctx) => {
  if (ctx.user && ctx.user.role === roles.admin) {
    const update = args.input
    return Product.findByIdAndUpdate(args.id, update, { new: true })
      .lean()
      .exec()
  } else {
    throw new AuthenticationError()
  }
}

const removeProduct = (_, args, ctx) => {
  if (ctx.user && ctx.user.role === 'admin') {
    return Product.findByIdAndRemove(args.id)
      .lean()
      .exec()
  } else {
    throw new AuthenticationError()
  }
}

export default {
  Query: {
    products,
    product
  },
  Mutation: {
    newProduct,
    updateProduct,
    removeProduct
  },
  Product: {
    __resolveType(product) {
      return productsTypeMatcher[product.type]
    },
    createdBy(product) {
      return User.findById(product.createdBy)
        .lean()
        .exec()
    }
  }
}
