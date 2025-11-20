import mongoose, { Schema, Document } from 'mongoose'

export interface IMenuItem {
  id: string
  name: string
  price: number
  desc?: string
}

export interface IRestaurant extends Document {
  id: string
  name: string
  cuisine: string
  rating: number
  costForTwo: number
  deliveryTimeMin: number
  menu: IMenuItem[]
}

const MenuItemSchema = new Schema<IMenuItem>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  desc: { type: String }
}, { _id: false })

const RestaurantSchema = new Schema<IRestaurant>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  cuisine: { type: String, required: true },
  rating: { type: Number, required: true },
  costForTwo: { type: Number, required: true },
  deliveryTimeMin: { type: Number, required: true },
  menu: { type: [MenuItemSchema], default: [] }
})

const Restaurant = mongoose.models.Restaurant || mongoose.model<IRestaurant>('Restaurant', RestaurantSchema)

export default Restaurant
