import { useState, useEffect } from "react";
import md5 from "md5";
import "./App.css";

function App() {
  const password = "Valantis";
  const time = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const authValue = md5(`${password}_${time}`);
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [brands, setBrands] = useState([]);
  const [nameFilter, setNameFilter] = useState("");
  const [priceFilter, setPriceFilter] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchID = async (offset, limit) => {
    try {
      const response = await fetch("https://api.valantis.store:41000/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Auth": authValue,
        },
        body: JSON.stringify({
          action: "get_ids",
          params: { offset: offset, limit: limit },
        }),
      });
      if (!response.ok) {
        throw new Error("Ошибка загрузки данных");
      }
      const data = await response.json();
      return data.result;
    } catch (e) {
      console.error(e);
      fetchID(offset, limit);
    }
  };
  const fetchFilteredID = async (params) => {
    try {
      const response = await fetch("https://api.valantis.store:41000/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Auth": authValue,
        },
        body: JSON.stringify({
          action: "filter",
          params: params,
        }),
      });
      const data = await response.json();
      console.log(data.result);
      return data.result;
    } catch (e) {
      console.log(e);
      fetchFilteredID(params);
    }
  };
  const fetchItems = async (offset, limit, filter) => {
    try {
      setIsLoading(true);
      let itemsID;
      !filter
        ? (itemsID = await fetchID(offset, limit))
        : (itemsID = await fetchFilteredID(filter));
      const response = await fetch("https://api.valantis.store:41000/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Auth": authValue,
        },
        body: JSON.stringify({
          action: "get_items",
          params: { ids: itemsID },
        }),
      });

      if (!response.ok) {
        throw new Error(`Ошибка запроса: ${response.status}`);
      }

      const data = await response.json();

      const products = {};
      data.result.forEach((item) => {
        if (!products[item.id]) {
          products[item.id] = item;
        }
      });

      const productsArray = Object.values(products);

      setProducts(productsArray);
    } catch (e) {
      console.error(e);
      fetchItems(offset, limit);
    } finally {
      setIsLoading(false);
    }
  };
  const fetchFieldsBrands = async () => {
    try {
      const response = await fetch("https://api.valantis.store:41000/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Auth": authValue,
        },
        body: JSON.stringify({
          action: "get_fields",
          params: { field: "brand", offset: 0, limit: 500 },
        }),
      });
      const data = await response.json();
      const filteredResult = [
        ...new Set(data.result.filter((value) => value !== null)),
      ];
      setBrands(filteredResult);
    } catch (e) {
      console.error("Ошибка:", e);
    }
  };

  const filterSubmit = () => {
    const filterObject = {};
    if (nameFilter !== "") {
      filterObject["product"] = nameFilter;
    }
    if (priceFilter !== "") {
      filterObject["price"] = parseFloat(priceFilter);
    }
    if (selectedBrand !== "") {
      filterObject["brand"] = selectedBrand;
    }

    setCurrentPage(1);
    fetchItems(0, 50, filterObject);
  };
  const nextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const prevPage = () => {
    setCurrentPage((prevPage) => prevPage - 1);
  };

  const resetFilters = () => {
    setNameFilter("");
    setPriceFilter("");
    setSelectedBrand("");
    setCurrentPage(1);
    fetchItems(0, 50);
  };

  useEffect(() => {
    fetchItems((currentPage - 1) * 50, 50);
  }, [currentPage]);

  useEffect(() => {
    fetchFieldsBrands();
  }, []);

  return (
    <div>
      <div>
        <input
          type="text"
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
          placeholder="Название"
          disabled={priceFilter !== "" || selectedBrand !== ""}
        />
        <input
          type="number"
          value={priceFilter}
          onChange={(e) => setPriceFilter(e.target.value)}
          placeholder="Цена"
          disabled={nameFilter !== "" || selectedBrand !== ""}
        />
        <select
          value={selectedBrand}
          disabled={nameFilter !== "" || priceFilter !== ""}
          onChange={(e) => setSelectedBrand(e.target.value)}
        >
          <option value="">Выберите бренд</option>
          {brands.map((brand, index) => (
            <option key={index} value={brand}>
              {brand}
            </option>
          ))}
        </select>
        <button
          onClick={filterSubmit}
          disabled={
            (!nameFilter && !priceFilter && !selectedBrand) || isLoading
          }
        >
          {!isLoading ? "Применить фильтр" : "Загрузка..."}
        </button>
        <button onClick={resetFilters} disabled={isLoading}>
          {!isLoading ? "Сбросить фильтр" : "Загрузка..."}
        </button>
      </div>
      <button onClick={prevPage} disabled={isLoading || currentPage <= 1}>
        Предыдущая страница
      </button>
      <span>{currentPage}</span>
      <button onClick={nextPage} disabled={isLoading}>
        Следующая страница
      </button>
      <a href="https://github.com/chernyshovdmitrydev">
        by chernyshovdmitrydev
      </a>
      <ul>
        {!isLoading ? (
          products.length > 0 ? (
            products.map((item) => (
              <li key={item.id}>
                <h3>{item.product}</h3>
                <div>{item.price} руб.</div>
                <div>{item.id}</div>
                {!item.brand ? <div>Без бренда</div> : <div>{item.brand}</div>}
              </li>
            ))
          ) : (
            <div>Список продуктов пуст</div>
          )
        ) : (
          <div className="loading">
            <span>C</span>
          </div>
        )}
      </ul>
    </div>
  );
}

export default App;
