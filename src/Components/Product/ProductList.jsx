import { useEffect, useState } from "react";
import { ErrorToast } from "../../Helper/FormHelper";
import loadingStore from "../../Zustand/LoadingStore";
import { BaseURL } from "../../Helper/Config";
import { getToken } from "../../Helper/SessionHelper";
import axios from "axios";

const ProductsList = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(20);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const { setGlobalLoader } = loadingStore();

  // Fetch products
  const fetchProducts = async () => {
    setGlobalLoader(true);
    try {
      const res = await axios.get(
        `${BaseURL}/ProductList/${page}/${limit}/${search || 0}`,
        { headers: { token: getToken() } }
      );
      if (res.data.status === "Success") {
        setProducts(res.data.data || []);
        setTotal(res.data.total || 0);
      }
    } catch (error) {
      ErrorToast("Failed to load products");
    } finally {
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, limit, search]);

  return (
    <div className="global_sub_container">
      {/* Header + Search + Limit */}
      <div className="py-2">
        <div className="flex flex-col gap-2 lg:flex-row justify-between lg:items-center">
          <h2 className="text-xl font-semibold flex flex-col">
            Products List
            <span className="text-sm">
              Showing {products.length} of {total} products
            </span>
          </h2>

          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="global_input w-full lg:w-lg"
          />

          <select
            value={limit}
            onChange={(e) => {
              setLimit(parseInt(e.target.value));
              setPage(1);
            }}
            className="global_dropdown lg:w-fit"
          >
            {[20, 50, 100, 200].map((opt) => (
              <option key={opt} value={opt}>
                {opt} per page
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      {products.length > 0 ? (
        <div>
          <div className="overflow-x-auto">
            <table className="global_table">
              <thead className="global_thead">
                <tr>
                  <th className="global_th">No</th>
                  <th className="global_th">Name</th>
                  <th className="global_th">Brand</th>
                  <th className="global_th">Category</th>
                  <th className="global_th">Stock</th>
                  <th className="global_th">Purchase (unitCost)</th>
                  <th className="global_th">Sell Price (mrp)</th>
                  <th className="global_th">Deler Price </th>
                  <th className="global_th">Barcode</th>
                  <th className="global_th">Action</th>
                </tr>
              </thead>
              <tbody className="global_tbody">
                {products.map((product, index) => (
                  <tr className="global_tr" key={product._id}>
                    <td className="global_td">
                      {(page - 1) * limit + index + 1}
                    </td>
                    <td className="global_td">{product.name}</td>
                    <td className="global_td">
                      {product.Brands?.name || "N/A"}
                    </td>
                    <td className="global_td">
                      {product.Categories?.name || "N/A"}
                    </td>
                    <td className="global_td">
                      {parseInt(product.stock || product.qty || 0)}
                    </td>

                    {/* Purchase Price */}
                    <td className="global_td">
                      {parseFloat(product.unitCost || 0).toFixed(2)}
                    </td>

                    {/* Sell Price */}
                    <td className="global_td">
                      {parseFloat(product.mrp || 0).toFixed(2)}
                    </td>
                    {/* Deler Price */}
                    <td className="global_td">
                      {parseFloat(product.dp || 0).toFixed(2)}
                    </td>

                    <td className="global_td">{product.barcode || "N/A"}</td>

                    <td className="global_td flex gap-2">
                      <button className="px-2 py-1 bg-blue-500 text-white rounded">
                        Edit
                      </button>
                      <button className="px-2 py-1 bg-red-500 text-white rounded">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className={`px-4 py-2 rounded-r-md rounded-l-full ${
                page === 1 ? "bg-gray-200 cursor-not-allowed" : "global_button"
              }`}
            >
              Previous
            </button>
            <span className="text-sm">
              Page {page} of {Math.ceil(total / limit)}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= Math.ceil(total / limit)}
              className={`px-4 py-2 rounded-l-md rounded-r-full ${
                page >= Math.ceil(total / limit)
                  ? "bg-gray-200 cursor-not-allowed"
                  : "global_button"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products found.</p>
        </div>
      )}
    </div>
  );
};

export default ProductsList;
