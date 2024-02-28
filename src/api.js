const password = "Valantis";
const time = new Date().toISOString().slice(0, 10).replace(/-/g, "");
const authValue = md5(`${password}_${time}`);

export const fetchID = async (offset, limit) => {
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
  export const fetchFilteredID = async (params) => {
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
  export const fetchItems = async (offset, limit, filter) => {
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
  export const fetchFieldsBrands = async () => {
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