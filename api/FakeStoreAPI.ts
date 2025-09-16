import { AuthAPI } from "./auth/AuthAPI";
import { CartsAPI } from "./carts/CartsAPI";
import { ProductsAPI } from "./products/ProductsAPI";
import { UsersAPI } from "./users/UsersAPI";

export class FakeStoreAPI {
  public products: ProductsAPI;
  public users: UsersAPI;
  public carts: CartsAPI;
  public auth: AuthAPI;

  constructor() {
    this.products = new ProductsAPI();
    this.users = new UsersAPI();
    this.carts = new CartsAPI();
    this.auth = new AuthAPI();
  }
}
