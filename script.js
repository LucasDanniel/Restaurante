const menu = document.getElementById("menu");
const cartBtn = document.getElementById("cart-btn");
const cartModal = document.getElementById("cart-modal");
const cartItemsContainer = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const checkoutBtn = document.getElementById("checkout-btn");
const closeModalBtn = document.getElementById("close-modal-btn");
const cartCounter = document.getElementById("cart-count");
const addressInput = document.getElementById("address");
const addressWarn = document.getElementById("address-warn");

let cart = [];

//abrir modal do carrinho
cartBtn.addEventListener("click", function () {
  updateCartModal();
  cartModal.style.display = "flex";
});

//fechar modal quando clicar fora
cartModal.addEventListener("click", function (event) {
  if (event.target === cartModal) {
    cartModal.style.display = "none";
  }
});

//fechar modal ao clicar no botao fechar
closeModalBtn.addEventListener("click", function () {
  cartModal.style.display = "none";
});

//adicionar no carrinho
menu.addEventListener("click", function (event) {
  let parentButton = event.target.closest(".add-to-cart-btn");

  if (parentButton) {
    const name = parentButton.getAttribute("data-name");
    const price = parseFloat(parentButton.getAttribute("data-price"));
    addTocart(name, price);
  }
});

//função adicionar carrinho
function addTocart(name, price) {
  const existingItem = cart.find((item) => item.name === name);
  Toastify({
    text: "Item adicionado ao carrinho",
    duration: 3000,
    close: true,
    gravity: "top", // `top` or `bottom`
    position: "center", // `left`, `center` or `right`
    stopOnFocus: true, // Prevents dismissing of toast on hover
    style: {
      background: "#69DB67",
    },
  }).showToast();

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      name,
      price,
      quantity: 1,
    });
  }

  updateCartModal();
}

//atualiza o carrinho
function updateCartModal() {
  cartItemsContainer.innerHTML = "";
  let total = 0;

  cart.forEach((item) => {
    const cartItemElement = document.createElement("div");
    cartItemElement.classList.add(
      "flex",
      "justify-bettween",
      "mb-4",
      "flex-col"
    );

    const itemTotalPrice = item.price * item.quantity; // Calcula o preço total do item

    cartItemElement.innerHTML = `
               <div class="flex items-center justify-between">
                  <div>
                      <p class="font-medium">${item.name}</p>
                      <div>
                          <label for="quantity-${
                            item.name
                          }" class="font-medium">Quantidade:</label>
                          <input 
                              id="quantity-${item.name}" 
                              class="appearance-none quantity-input border rounded px-2 py-1 w-16" 
                              type="number" 
                              min="1" 
                              value="${item.quantity}" 
                              data-name="${item.name}"
                          />
                      </div>
                      <p class="font-medium mt-2">R$ ${itemTotalPrice.toFixed(
                        2
                      )}</p>
                  </div>
                  <div>
                      <button class="remove-cart-btn" data-name="${item.name}">
                          <i class="fa-solid fa-trash" style="color: #000000;"></i>
                      </button>
                  </div>
              </div>
          `;
    total += itemTotalPrice; // Soma o preço total do item ao total geral

    cartItemsContainer.appendChild(cartItemElement);
  });
  cartTotal.textContent = total.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  cartCounter.innerHTML = cart.length;
}

cartItemsContainer.addEventListener("click", function (event) {
  let target = event.target;

  // Verifica se clicou no ícone ou no botão
  if (target.classList.contains("fa-trash")) {
    target = target.closest(".remove-cart-btn");
  }

  if (target && target.classList.contains("remove-cart-btn")) {
    const name = target.getAttribute("data-name");
    removeItemCart(name);
  }
});

cartItemsContainer.addEventListener("input", function (event) {
  if (event.target.classList.contains("quantity-input")) {
    const name = event.target.getAttribute("data-name");
    const newQuantity = parseInt(event.target.value, 10);

    // Atualiza a quantidade no carrinho, garantindo que seja válida
    if (newQuantity > 0) {
      const item = cart.find((item) => item.name === name);
      if (item) {
        item.quantity = newQuantity;
        updateCartModal(); // Recalcula o total
      }
    }
  }
});

function removeItemCart(name) {
  const index = cart.findIndex((item) => item.name === name);

  if (index !== -1) {
    const item = cart[index];

    if (item.quantity > 1) {
      item.quantity -= 1;
      updateCartModal();
      return;
    }
    cart.splice(index, 1);
    updateCartModal();
  }
}

addressInput.addEventListener("input", function (event) {
  let inputValue = event.target.value;

  if (inputValue !== "") {
    addressInput.classList.remove("border-red-500");
    addressWarn.classList.add("hidden");
  }
});

//finalizar pedido
checkoutBtn.addEventListener("click", function () {
  const isOpen = checkRestaurantOpen();
  if (!isOpen) {
    Toastify({
      text: "A lanchonete se encontra fechada no momento",
      duration: 3000,
      close: true,
      gravity: "top", // `top` or `bottom`
      position: "center", // `left`, `center` or `right`
      stopOnFocus: true, // Prevents dismissing of toast on hover
      style: {
        background: "#ef4444",
      },
    }).showToast();
    return;
  }

  if (cart.length === 0) return;
  if (addressInput.value === "") {
    addressWarn.classList.remove("hidden");
    addressInput.classList.add("border-red-500");
    return;
  }

  //enviar pedido para o whatsapp
  const cartItems = cart
    .map((item) => {
      return `${item.name} - Quantidade: (${item.quantity}) - Preço: R$${(
        item.price * item.quantity
      ).toFixed(2)} |`;
    })
    .join("\n"); //Adiciona uma quebra de linha entre os itens

  const message = encodeURIComponent`Itens do carrinho:\n${cartItems}\n\nEndereço: ${addressInput.value}`;
  const phone = "+557998182866";

  //abre o WhatsApp com a mensagem formatada
  window.open(
    `https://wa.me/${phone}?text=${message} Endereço: ${addressInput.value}`,
    "_blank"
  );

  //Limpa o carinho e atuliza o modal
  cart = [];
  updateCartModal();
});

//verificar a hora e manipular o cart horario
function checkRestaurantOpen() {
  const data = new Date();
  const hora = data.getHours();
  return hora >= 18 && hora < 22;
}

//manipulação da cor no span de acordo com horario
const spanItem = document.getElementById("date-span");
const isOpen = checkRestaurantOpen();

if (isOpen) {
  spanItem.classList.remove("bg-red-500");
  spanItem.classList.add("bg-green-600");
} else {
  spanItem.classList.remove("bg-green-600");
  spanItem.classList.add("bg-red-500");
}
