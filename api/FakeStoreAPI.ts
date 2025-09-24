import { AuthAPI } from "./auth/AuthAPI";
import { CategoriesAPI } from "./categories/CategoriesAPI";
import { ProductsAPI } from "./products/ProductsAPI";
import { UsersAPI } from "./users/UsersAPI";

export class FakeStoreAPI {
  public products: ProductsAPI;
  public users: UsersAPI;
  public categories: CategoriesAPI;
  public auth: AuthAPI;

  constructor() {
    this.products = new ProductsAPI();
    this.users = new UsersAPI();
    this.categories = new CategoriesAPI();
    this.auth = new AuthAPI();
  }
}
