import http from "http";
import url from "url";
import fs from "fs";
import path from "path";

const port = 2000;
const hostname = "127.0.0.1";
// Read db.json data from the file
const getAllProducts = (res) => {
  const rawData = fs.readFileSync("db.json");
  const products = JSON.parse(rawData);
  console.log("Data from db.json:", products);

  // Send the product data as a response
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(products));
};

//add product to db.json
const addProduct = async (req, res) => {
  try {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      const newProduct = JSON.parse(body);
      // Read existing data from db.json
      const rawData = fs.readFileSync("db.json");
      const products = JSON.parse(rawData);
      // Add the new product
      products.push(newProduct);

      // Write the updated data back to db.json
      fs.writeFileSync("db.json", JSON.stringify(products));

      // Send a success response
      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({ newProduct, message: "Product added successfully" })
      );
    });
  } catch (error) {
    console.error(error);
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("Internal Server Error");
  }
};

// Update product data in db.json
const editProduct = async (req, res, taskId) => {
  try {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      const updatedProduct = JSON.parse(body);
      // Read existing data from db.json
      const rawData = fs.readFileSync("db.json");
      const products = JSON.parse(rawData);
      // Find the product to update
      const productIndex = products.findIndex(
        (product) => product.id === taskId
      );
      // Replace the product with the updated product
      //找到该位置上的整个对象並更新
      if (productIndex !== -1) {
        updatedProduct.id = taskId; // 保留原始 ID
        products[productIndex] = updatedProduct;
        // Write the updated data back to db.json
        fs.writeFileSync("db.json", JSON.stringify(products));

        // Send a success response
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            updatedProduct,
            message: "Product updated successfully",
          })
        );
      } else {
        // 如果未找到產品，回應 404 Not Found
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Product not found");
      }
    });
  } catch (error) {
    console.error(error);
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("Internal Server Error");
  }
};

//create the server
const server = http.createServer(async (req, res) => {
  const { pathname } = url.parse(req.url);
  const pathSegments = pathname.split("/");

  if (pathname == "/products" && req.method == "GET") {
    getAllProducts(res);
  } else if (pathname == "/products" && req.method == "POST") {
    await addProduct(req, res);
  } else if (pathname.startsWith("/products/") && req.method == "PUT") {
    const taskId = pathSegments[2];
    console.log(taskId);
    editProduct(req, res, taskId);
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
