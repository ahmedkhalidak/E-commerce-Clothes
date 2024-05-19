/** ----------- Slider ----ابانوب------- */
let imgs = ["img/Slider/1.jpg", "img/Slider/2.jpg", "img/Slider/3.jpg"];

const prev = document.querySelector(".prev");
const next = document.querySelector(".next");
let i = 0;
prev.addEventListener("click", function () {
  i--;
  if (i < 0) {
    i = imgs.length - 1;
  }
  setTimeout(() => {
    document.querySelector(".overlay-img").src = imgs[i];
  }, 0.25);
});

next.addEventListener("click", function () {
  i++;
  if (i > imgs.length - 1) {
    i = 0;
  }
  setTimeout(() => {
    document.querySelector(".overlay-img").src = imgs[i];
  }, 0.25);
});

let x = 0;
setInterval(() => {
  x++;
  if (x > imgs.length - 1) {
    x = 0;
  }
  document.querySelector(".overlay-img").src = imgs[x];
}, 2000);

/** --------- products ---------------- */

const pro = document.querySelectorAll(".pro-container")[0];
const filter = document.querySelectorAll(".filter-btn");

function requestAndBuild(string) {
  fetch(
    "https://json-server-brown-five.vercel.app/products?" + string + ""
  ).then((res) => {
    res.json().then((data) => {
      pro.innerHTML = "";
      data.forEach((element) => {
        let div = document.createElement("div");
        div.classList.add("pro");
        div.innerHTML = `
                      <img src="${element.img}" alt="" onclick="clicked(${element.id})">
                <div class="des">
                    <span>${element.category}</span>
                    <h5>${element.name}</h5>
                    <div class="star">
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                    </div>
                    <h4>$${element.price}</h4>
                </div>
                <a id="cart" onclick="addToCart(${element.id})"><i class="fa-solid fa-cart-shopping cart"></i></a>
      `;
        pro.appendChild(div);
      });
    });
  });
}

requestAndBuild("");

filter[0].addEventListener("click", function () {
  requestAndBuild("");
});

filter[1].addEventListener("click", function () {
  requestAndBuild("category=Jeans");
});

filter[2].addEventListener("click", function () {
  requestAndBuild("category=Sweatshirts");
});

filter[3].addEventListener("click", function () {
  requestAndBuild("category=T-shirts");
});

filter[4].addEventListener("click", function () {
  requestAndBuild("category=Jackets");
});

/** --------- product ----------- */
function clicked(id) {
  window.open("product.html?id=" + id, "_blank");
}

/** ----------- cart ----------- */
const cartIcon = document.getElementById("cart-icon");
const cartContainer = document.getElementById("cart-section");
const closeCart = document.getElementById("close-cart");
const countSpan = document.getElementById("cart-counter");
const cartContent = document.getElementById("cart-content");
let productIDs = localStorage.getItem("productIDs")
  ? localStorage.getItem("productIDs").split(",")
  : [];

document.readyState === "loading"
  ? document.addEventListener("DOMContentLoaded", start)
  : start();

function start() {
  cartIcon.onclick = () => toggleCart(true);
  closeCart.onclick = () => toggleCart(false);
  document.getElementById("checkout").onclick = handleCheckout;
  loadCartContent();
}

function toggleCart(show) {
  if (show) {
    cartContainer.classList.add("show");
  } else {
    cartContainer.classList.remove("show");
  }
}

async function loadCartContent() {
  cartContent.innerHTML = "";
  if (productIDs.length) {
    const productsData = await fetchProductsData(productIDs);
    productsData.forEach((product) => product && addItemToCartDOM(product));
  }
  updateCart();
}

async function fetchProductsData(ids) {
  const fetchProduct = async (id) => {
    try {
      const response = await fetch(
        `https://json-server-brown-five.vercel.app/products?id=${id}`
      );
      const [product] = await response.json();
      return product;
    } catch (error) {
      console.error("Error fetching product:", error);
    }
  };

  return Promise.all(ids.map((id) => fetchProduct(id)));
}

function addItemToCartDOM({ id, img, name, price }) {
  cartContent.insertAdjacentHTML(
    "beforeend",
    `
    <div class="cart-box" data-id="${id}">
      <img src="${img}" alt="${name}" class="cart-img">
      <div class="product-details">
        <h4 class="product-name">${name}</h4>
        <h5 class="product-price">$${price.toFixed(2)}</h5>
        <input type="number" class="product-quantity" value="1" min="1">
      </div>
      <i class="fa-solid fa-trash remove" onclick="handleRemoveProduct.call(this)"></i>
    </div>
  `
  );
}

function updateCart() {
  updateCartTotal();
  updateCartCounter();
}

function updateCartTotal() {
  let total = 0;
  document.querySelectorAll(".cart-box").forEach((box) => {
    const price = parseFloat(
      box.querySelector(".product-price").textContent.replace("$", "")
    );
    const quantity = parseInt(box.querySelector(".product-quantity").value);
    total += price * quantity;
  });
  document.getElementById("total-amount").textContent = `$${total.toFixed(2)}`;
}

function updateCartCounter() {
  countSpan.textContent = productIDs.length.toString();
}

function handleRemoveProduct() {
  const box = this.closest(".cart-box");
  const removedProductId = box.dataset.id;
  box.remove();
  productIDs = productIDs.filter((id) => id !== removedProductId);
  localStorage.setItem("productIDs", productIDs);
  updateCart();
}

document.addEventListener("change", (event) => {
  if (event.target.classList.contains("product-quantity")) {
    handleChangeProductQuantity.call(event.target);
  }
});

function handleChangeProductQuantity() {
  const quantity = Math.floor(this.value);
  this.value = quantity > 0 ? quantity : 1;
  updateCart();
}

async function addToCart(id) {
  if (productIDs.includes(id)) {
    Swal.fire("Oops...", "Product already added!", "error");
    return;
  }

  const productData = await fetchProductsData([id]);
  if (productData.length) {
    addItemToCartDOM(productData[0]);
    productIDs.push(id);
    localStorage.setItem("productIDs", productIDs);
    updateCart();
    Swal.fire("Your product has been added!", "", "success");
  }
}

function handleCheckout() {
  if (!productIDs.length) {
    Swal.fire("Cart is empty", "You need to add product first!", "error");
    return;
  }
  cartContent.innerHTML = "";
  productIDs = [];
  localStorage.setItem("productIDs", productIDs);
  updateCart();
  Swal.fire("Successfully Checkout!", "", "success");
}
