/* =====================================================
   MONEYTRACK PRO V2
   FULL JAVASCRIPT
   ===================================================== */


/* =====================================================
   STORAGE
   ===================================================== */

const STORAGE = {

  users:
    "moneytrack_pro_users",

  session:
    "moneytrack_pro_session",

  transactions:
    "moneytrack_pro_transactions",

  goals:
    "moneytrack_pro_goals",

  budget:
    "moneytrack_pro_budget",

  account:
    "moneytrack_pro_account"

};


/* =====================================================
   STATE
   ===================================================== */

let transactions = [];

let goals = [];

let budget = 0;

let selectedType = "income";

let showAllTransactions = false;


/* =====================================================
   START
   ===================================================== */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    checkSession();

    setupAuth();

    setupTransactionForm();

    setupGoalForm();

    setupFilters();

    setupNavigation();

    setupKeyboard();

    setupModalOutsideClick();

    setupChart();

  }
);


/* =====================================================
   BASIC HELPERS
   ===================================================== */

function getToday() {

  const date =
    new Date();

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      date.getDate()
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;

}


function formatRupiah(number) {

  return new Intl.NumberFormat(
    "id-ID",
    {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }
  ).format(
    Number(number) || 0
  );

}


function formatDate(date) {

  if (!date) return "-";

  const d =
    new Date(
      date + "T00:00:00"
    );

  if (
    isNaN(
      d.getTime()
    )
  ) {
    return date;
  }

  return d.toLocaleDateString(
    "id-ID",
    {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }
  );

}


function escapeHTML(value) {

  return String(
    value ?? ""
  )
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );

}


/* =====================================================
   AUTH
   ===================================================== */

function setupAuth() {

  const loginForm =
    document.getElementById(
      "loginForm"
    );

  const registerForm =
    document.getElementById(
      "registerForm"
    );


  loginForm?.addEventListener(
    "submit",
    event => {

      event.preventDefault();

      login();

    }
  );


  registerForm?.addEventListener(
    "submit",
    event => {

      event.preventDefault();

      register();

    }
  );

}


function getUsers() {

  try {

    return JSON.parse(
      localStorage.getItem(
        STORAGE.users
      )
    ) || [];

  } catch {

    return [];

  }

}


function saveUsers(users) {

  localStorage.setItem(
    STORAGE.users,
    JSON.stringify(users)
  );

}


function showRegister() {

  document
    .getElementById(
      "loginFormBox"
    )
    ?.classList.add(
      "hidden"
    );

  document
    .getElementById(
      "registerFormBox"
    )
    ?.classList.remove(
      "hidden"
    );

}


function showLogin() {

  document
    .getElementById(
      "registerFormBox"
    )
    ?.classList.add(
      "hidden"
    );

  document
    .getElementById(
      "loginFormBox"
    )
    ?.classList.remove(
      "hidden"
    );

}


function register() {

  const name =
    document
      .getElementById(
        "registerName"
      )
      .value
      .trim();

  const username =
    document
      .getElementById(
        "registerUsername"
      )
      .value
      .trim()
      .toLowerCase();

  const password =
    document
      .getElementById(
        "registerPassword"
      )
      .value;

  const confirmPassword =
    document
      .getElementById(
        "registerConfirmPassword"
      )
      .value;


  if (
    !name ||
    !username ||
    !password
  ) {

    showToast(
      "Semua data wajib diisi."
    );

    return;

  }


  if (
    password.length < 6
  ) {

    showToast(
      "Password minimal 6 karakter."
    );

    return;

  }


  if (
    password !==
    confirmPassword
  ) {

    showToast(
      "Konfirmasi password tidak cocok."
    );

    return;

  }


  const users =
    getUsers();


  const exists =
    users.some(
      user =>
        user.username ===
        username
    );


  if (exists) {

    showToast(
      "Username sudah digunakan."
    );

    return;

  }


  const user = {

    id:
      Date.now().toString(),

    name,

    username,

    password

  };


  users.push(
    user
  );

  saveUsers(
    users
  );


  showToast(
    "Akun berhasil dibuat."
  );


  document
    .getElementById(
      "registerForm"
    )
    .reset();


  setTimeout(
    () => {

      showLogin();

      document
        .getElementById(
          "loginUsername"
        )
        .value =
        username;

    },
    700
  );

}


function login() {

  const username =
    document
      .getElementById(
        "loginUsername"
      )
      .value
      .trim()
      .toLowerCase();

  const password =
    document
      .getElementById(
        "loginPassword"
      )
      .value;


  const users =
    getUsers();


  const user =
    users.find(
      item =>
        item.username ===
          username &&
        item.password ===
          password
    );


  if (!user) {

    showToast(
      "Username atau password salah."
    );

    return;

  }


  localStorage.setItem(
    STORAGE.session,
    JSON.stringify(
      user
    )
  );


  openApp(
    user
  );

}


function checkSession() {

  const session =
    localStorage.getItem(
      STORAGE.session
    );


  if (!session) {

    showAuth();

    return;

  }


  try {

    const user =
      JSON.parse(
        session
      );

    openApp(
      user
    );

  } catch {

    logout();

  }

}


function showAuth() {

  document
    .getElementById(
      "authScreen"
    )
    ?.classList.remove(
      "hidden"
    );

  document
    .getElementById(
      "app"
    )
    ?.classList.add(
      "hidden"
    );

}


function openApp(user) {

  document
    .getElementById(
      "authScreen"
    )
    ?.classList.add(
      "hidden"
    );

  document
    .getElementById(
      "app"
    )
    ?.classList.remove(
      "hidden"
    );


  loadUserData(
    user
  );


  updateProfile(
    user
  );


  setTimeout(
    () => {

      updateEverything();

    },
    50
  );

}


function updateProfile(user) {

  const userName =
    document.getElementById(
      "userName"
    );

  const avatar =
    document.getElementById(
      "avatar"
    );


  if (userName) {

    userName.textContent =
      user.name;

  }


  if (avatar) {

    avatar.textContent =
      user.name
        .charAt(0)
        .toUpperCase();

  }


  const accountName =
    document.getElementById(
      "accountName"
    );


  if (accountName) {

    accountName.value =
      user.name;

  }

}


function logout() {

  localStorage.removeItem(
    STORAGE.session
  );

  showAuth();

  document
    .getElementById(
      "loginForm"
    )
    ?.reset();

  showLogin();

}


/* =====================================================
   USER DATA
   ===================================================== */

function loadUserData(user) {

  const userId =
    user.id;


  try {

    transactions =
      JSON.parse(
        localStorage.getItem(
          `${STORAGE.transactions}_${userId}`
        )
      ) || [];


    goals =
      JSON.parse(
        localStorage.getItem(
          `${STORAGE.goals}_${userId}`
        )
      ) || [];


    budget =
      Number(
        localStorage.getItem(
          `${STORAGE.budget}_${userId}`
        )
      ) || 0;

  } catch {

    transactions = [];

    goals = [];

    budget = 0;

  }

}


function getCurrentUser() {

  try {

    return JSON.parse(
      localStorage.getItem(
        STORAGE.session
      )
    );

  } catch {

    return null;

  }

}


function saveUserData() {

  const user =
    getCurrentUser();


  if (!user) return;


  localStorage.setItem(
    `${STORAGE.transactions}_${user.id}`,
    JSON.stringify(
      transactions
    )
  );


  localStorage.setItem(
    `${STORAGE.goals}_${user.id}`,
    JSON.stringify(
      goals
    )
  );


  localStorage.setItem(
    `${STORAGE.budget}_${user.id}`,
    String(
      budget
    )
  );

}


/* =====================================================
   TRANSACTION MODAL
   ===================================================== */

function openTransactionModal(
  type = "income",
  transactionId = null
) {

  const modal =
    document.getElementById(
      "transactionModal"
    );

  const form =
    document.getElementById(
      "transactionForm"
    );


  if (!modal) return;


  form?.reset();


  document
    .getElementById(
      "transactionDate"
    )
    .value =
    getToday();


  selectedType =
    type;


  selectTransactionType(
    type
  );


  modal.dataset.editId =
    transactionId || "";


  modal
    .classList.add(
      "show"
    );


  setTimeout(
    () => {

      document
        .getElementById(
          "transactionDescription"
        )
        ?.focus();

    },
    100
  );

}


function closeTransactionModal() {

  document
    .getElementById(
      "transactionModal"
    )
    ?.classList.remove(
      "show"
    );

}


function selectTransactionType(
  type
) {

  selectedType =
    type;


  const hidden =
    document.getElementById(
      "transactionType"
    );


  if (hidden) {

    hidden.value =
      type;

  }


  document
    .querySelector(
      ".income-type"
    )
    ?.classList.toggle(
      "active",
      type === "income"
    );


  document
    .querySelector(
      ".expense-type"
    )
    ?.classList.toggle(
      "active",
      type === "expense"
    );

}


/* =====================================================
   TRANSACTION FORM
   ===================================================== */

function setupTransactionForm() {

  const form =
    document.getElementById(
      "transactionForm"
    );


  if (!form) return;


  form.addEventListener(
    "submit",
    event => {

      event.preventDefault();

      saveTransaction();

    }
  );

}


function saveTransaction() {

  const modal =
    document.getElementById(
      "transactionModal"
    );


  const description =
    document
      .getElementById(
        "transactionDescription"
      )
      .value
      .trim();


  const amount =
    Number(
      document
        .getElementById(
          "transactionAmount"
        )
        .value
    );


  const category =
    document
      .getElementById(
        "transactionCategory"
      )
      .value;


  const date =
    document
      .getElementById(
        "transactionDate"
      )
      .value;


  if (!description) {

    showToast(
      "Deskripsi wajib diisi."
    );

    return;

  }


  if (
    !amount ||
    amount <= 0
  ) {

    showToast(
      "Nominal tidak valid."
    );

    return;

  }


  if (!date) {

    showToast(
      "Tanggal wajib diisi."
    );

    return;

  }


  const editId =
    modal?.dataset.editId;


  if (editId) {

    const transaction =
      transactions.find(
        item =>
          item.id ===
          editId
      );


    if (transaction) {

      transaction.type =
        selectedType;

      transaction.description =
        description;

      transaction.amount =
        amount;

      transaction.category =
        category;

      transaction.date =
        date;

    }


    showToast(
      "Transaksi berhasil diperbarui."
    );

  } else {

    transactions.unshift({

      id:
        Date.now().toString(),

      type:
        selectedType,

      description,

      amount,

      category,

      date,

      createdAt:
        new Date().toISOString()

    });


    showToast(
      "Transaksi berhasil ditambahkan."
    );

  }


  saveUserData();

  closeTransactionModal();

  updateEverything();

}


/* =====================================================
   TRANSACTIONS
   ===================================================== */

function renderTransactions() {

  const list =
    document.getElementById(
      "transactionList"
    );

  const empty =
    document.getElementById(
      "emptyTransactions"
    );


  if (!list) return;


  const search =
    document
      .getElementById(
        "searchTransaction"
      )
      ?.value
      .toLowerCase()
      .trim() || "";


  const type =
    document
      .getElementById(
        "filterType"
      )
      ?.value ||
    "all";


  const category =
    document
      .getElementById(
        "filterCategory"
      )
      ?.value ||
    "all";


  let filtered =
    [...transactions];


  if (search) {

    filtered =
      filtered.filter(
        transaction => {

          return (
            transaction.description
              .toLowerCase()
              .includes(search) ||

            transaction.category
              .toLowerCase()
              .includes(search)
          );

        }
      );

  }


  if (type !== "all") {

    filtered =
      filtered.filter(
        transaction =>
          transaction.type ===
          type
      );

  }


  if (
    category !==
    "all"
  ) {

    filtered =
      filtered.filter(
        transaction =>
          transaction.category ===
          category
      );

  }


  filtered.sort(
    (a, b) =>
      new Date(b.date) -
      new Date(a.date)
  );


  const display =
    showAllTransactions
      ? filtered
      : filtered.slice(
          0,
          6
        );


  list.innerHTML = "";


  if (
    display.length ===
    0
  ) {

    empty.style.display =
      "block";

    return;

  }


  empty.style.display =
    "none";


  display.forEach(
    transaction => {

      const item =
        document.createElement(
          "div"
        );


      item.className =
        "transaction-item";


      const income =
        transaction.type ===
        "income";


      item.innerHTML = `

        <div class="transaction-icon ${
          income
            ? "income-icon"
            : "expense-icon"
        }">
          ${income ? "↗" : "↘"}
        </div>


        <div class="transaction-info">

          <strong>
            ${escapeHTML(
              transaction.description
            )}
          </strong>

          <span class="transaction-category">
            ${escapeHTML(
              transaction.category
            )}
          </span>

          <span class="transaction-date">
            • ${formatDate(
              transaction.date
            )}
          </span>

        </div>


        <div class="transaction-amount ${
          income
            ? "income"
            : "expense"
        }">

          ${
            income
              ? "+"
              : "-"
          }

          ${formatRupiah(
            transaction.amount
          )}

        </div>


        <button
          class="delete-transaction"
          onclick="editTransaction('${transaction.id}')"
          title="Edit"
        >
          ✎
        </button>


        <button
          class="delete-transaction"
          onclick="deleteTransaction('${transaction.id}')"
          title="Hapus"
        >
          ×
        </button>

      `;


      list.appendChild(
        item
      );

    }
  );

}


function editTransaction(id) {

  const transaction =
    transactions.find(
      item =>
        item.id === id
    );


  if (!transaction) return;


  openTransactionModal(
    transaction.type,
    transaction.id
  );


  document
    .getElementById(
      "transactionDescription"
    )
    .value =
    transaction.description;


  document
    .getElementById(
      "transactionAmount"
    )
    .value =
    transaction.amount;


  document
    .getElementById(
      "transactionCategory"
    )
    .value =
    transaction.category;


  document
    .getElementById(
      "transactionDate"
    )
    .value =
    transaction.date;

}


function deleteTransaction(id) {

  const transaction =
    transactions.find(
      item =>
        item.id === id
    );


  if (!transaction)
    return;


  const confirmed =
    confirm(
      `Hapus transaksi "${transaction.description}"?`
    );


  if (!confirmed)
    return;


  transactions =
    transactions.filter(
      item =>
        item.id !== id
    );


  saveUserData();

  updateEverything();

  showToast(
    "Transaksi berhasil dihapus."
  );

}


/* =====================================================
   FILTER
   ===================================================== */

function setupFilters() {

  document
    .getElementById(
      "searchTransaction"
    )
    ?.addEventListener(
      "input",
      () => {

        showAllTransactions =
          true;

        renderTransactions();

      }
    );


  document
    .getElementById(
      "filterType"
    )
    ?.addEventListener(
      "change",
      () => {

        showAllTransactions =
          true;

        renderTransactions();

      }
    );


  document
    .getElementById(
      "filterCategory"
    )
    ?.addEventListener(
      "change",
      () => {

        showAllTransactions =
          true;

        renderTransactions();

      }
    );

}


function updateCategoryFilter() {

  const select =
    document.getElementById(
      "filterCategory"
    );


  if (!select)
    return;


  const current =
    select.value;


  const categories =
    [
      ...new Set(
        transactions.map(
          transaction =>
            transaction.category
        )
      )
    ].sort();


  select.innerHTML =
    `<option value="all">
      Semua Kategori
    </option>`;


  categories.forEach(
    category => {

      const option =
        document.createElement(
          "option"
        );

      option.value =
        category;

      option.textContent =
        category;

      select.appendChild(
        option
      );

    }
  );


  if (
    categories.includes(
      current
    )
  ) {

    select.value =
      current;

  }

}


function showAllTransactionsHandler() {

  showAllTransactions =
    true;

  renderTransactions();

  document
    .getElementById(
      "transactions"
    )
    ?.scrollIntoView({
      behavior: "smooth"
    });

}


/* =====================================================
   DASHBOARD
   ===================================================== */

function calculateTotals() {

  let income = 0;

  let expense = 0;


  transactions.forEach(
    transaction => {

      const amount =
        Number(
          transaction.amount
        ) || 0;


      if (
        transaction.type ===
        "income"
      ) {

        income +=
          amount;

      } else {

        expense +=
          amount;

      }

    }
  );


  return {

    income,

    expense,

    balance:
      income -
      expense

  };

}


function updateDashboard() {

  const totals =
    calculateTotals();


  const balance =
    document.getElementById(
      "balance"
    );

  const income =
    document.getElementById(
      "income"
    );

  const expense =
    document.getElementById(
      "expense"
    );

  const count =
    document.getElementById(
      "transactionCount"
    );

  const saving =
    document.getElementById(
      "savingRate"
    );


  balance.textContent =
    formatRupiah(
      totals.balance
    );


  income.textContent =
    formatRupiah(
      totals.income
    );


  expense.textContent =
    formatRupiah(
      totals.expense
    );


  count.textContent =
    transactions.length;


  let savingRate =
    0;


  if (
    totals.income > 0
  ) {

    savingRate =
      (
        (
          totals.income -
          totals.expense
        ) /
        totals.income
      ) *
      100;

    savingRate =
      Math.max(
        0,
        savingRate
      );

  }


  saving.textContent =
    `${savingRate.toFixed(1)}%`;

}


/* =====================================================
   ANALYTICS
   ===================================================== */

function updateAnalytics() {

  const expenses =
    transactions.filter(
      transaction =>
        transaction.type ===
        "expense"
    );


  const top =
    document.getElementById(
      "topExpenseCategory"
    );

  const average =
    document.getElementById(
      "averageExpense"
    );

  const largest =
    document.getElementById(
      "largestExpense"
    );


  if (
    expenses.length ===
    0
  ) {

    top.textContent =
      "-";

    average.textContent =
      formatRupiah(
        0
      );

    largest.textContent =
      formatRupiah(
        0
      );

    updateCategoryFilter();

    return;

  }


  const categories =
    {};


  expenses.forEach(
    transaction => {

      const category =
        transaction.category ||
        "Lainnya";


      categories[category] =
        (
          categories[category] ||
          0
        ) +
        Number(
          transaction.amount
        );

    }
  );


  const sorted =
    Object.entries(
      categories
    ).sort(
      (a, b) =>
        b[1] - a[1]
    );


  top.textContent =
    sorted[0]?.[0] ||
    "-";


  const total =
    expenses.reduce(
      (sum, transaction) =>
        sum +
        Number(
          transaction.amount
        ),
      0
    );


  average.textContent =
    formatRupiah(
      total /
      expenses.length
    );


  const biggest =
    Math.max(
      ...expenses.map(
        transaction =>
          Number(
            transaction.amount
          )
      )
    );


  largest.textContent =
    formatRupiah(
      biggest
    );


  updateCategoryFilter();

}


/* =====================================================
   CHART
   ===================================================== */

function setupChart() {

  document
    .getElementById(
      "chartPeriod"
    )
    ?.addEventListener(
      "change",
      updateChart
    );


  window.addEventListener(
    "resize",
    updateChart
  );

}


function updateChart() {

  const canvas =
    document.getElementById(
      "cashFlowChart"
    );


  const empty =
    document.getElementById(
      "chartEmpty"
    );


  if (!canvas)
    return;


  const context =
    canvas.getContext(
      "2d"
    );


  const rect =
    canvas.getBoundingClientRect();


  const width =
    Math.max(
      300,
      Math.floor(
        rect.width
      )
    );


  const height =
    Math.max(
      180,
      Math.floor(
        rect.height
      )
    );


  const dpr =
    window.devicePixelRatio ||
    1;


  canvas.width =
    width * dpr;

  canvas.height =
    height * dpr;


  context.setTransform(
    dpr,
    0,
    0,
    dpr,
    0,
    0
  );


  context.clearRect(
    0,
    0,
    width,
    height
  );


  if (
    transactions.length ===
    0
  ) {

    empty.style.display =
      "grid";

    return;

  }


  empty.style.display =
    "none";


  const days =
    Number(
      document
        .getElementById(
          "chartPeriod"
        )
        ?.value || 30
    );


  const today =
    new Date();


  const points =
    [];


  for (
    let i =
      days - 1;

    i >= 0;

    i--
  ) {

    const date =
      new Date(
        today
      );


    date.setDate(
      today.getDate() -
      i
    );


    const key =
      `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}-${String(
        date.getDate()
      ).padStart(2, "0")}`;


    let income =
      0;

    let expense =
      0;


    transactions.forEach(
      transaction => {

        if (
          transaction.date !==
          key
        ) return;


        const amount =
          Number(
            transaction.amount
          ) || 0;


        if (
          transaction.type ===
          "income"
        ) {

          income +=
            amount;

        } else {

          expense +=
            amount;

        }

      }
    );


    points.push({

      date,

      income,

      expense

    });

  }


  const max =
    Math.max(
      1,
      ...points.map(
        point =>
          Math.max(
            point.income,
            point.expense
          )
      )
    );


  const padding = {

    top: 15,

    right: 15,

    bottom: 28,

    left: 15

  };


  const chartWidth =
    width -
    padding.left -
    padding.right;


  const chartHeight =
    height -
    padding.top -
    padding.bottom;


  /* GRID */

  context.strokeStyle =
    "#28282f";

  context.lineWidth =
    1;


  for (
    let i = 0;

    i <= 4;

    i++
  ) {

    const y =
      padding.top +
      (
        chartHeight /
        4
      ) *
      i;


    context.beginPath();

    context.moveTo(
      padding.left,
      y
    );

    context.lineTo(
      width -
        padding.right,
      y
    );

    context.stroke();

  }


  drawLine(
    context,
    points,
    "income",
    "#22c55e",
    max,
    padding,
    chartWidth,
    chartHeight
  );


  drawLine(
    context,
    points,
    "expense",
    "#ef4444",
    max,
    padding,
    chartWidth,
    chartHeight
  );

}


function drawLine(
  context,
  points,
  type,
  color,
  max,
  padding,
  chartWidth,
  chartHeight
) {

  const values =
    points.map(
      point =>
        Number(
          point[type]
        ) || 0
    );


  if (
    !values.some(
      value =>
        value > 0
    )
  ) return;


  context.beginPath();


  points.forEach(
    (point, index) => {

      const x =
        padding.left +
        (
          chartWidth /
          Math.max(
            points.length - 1,
            1
          )
        ) *
        index;


      const value =
        Number(
          point[type]
        ) || 0;


      const y =
        padding.top +
        chartHeight -
        (
          value /
          max
        ) *
        chartHeight;


      if (
        index === 0
      ) {

        context.moveTo(
          x,
          y
        );

      } else {

        context.lineTo(
          x,
          y
        );

      }

    }
  );


  context.strokeStyle =
    color;

  context.lineWidth =
    2.5;

  context.lineJoin =
    "round";

  context.lineCap =
    "round";

  context.stroke();


  points.forEach(
    (point, index) => {

      const value =
        Number(
          point[type]
        ) || 0;


      if (
        value <= 0
      ) return;


      const x =
        padding.left +
        (
          chartWidth /
          Math.max(
            points.length - 1,
            1
          )
        ) *
        index;


      const y =
        padding.top +
        chartHeight -
        (
          value /
          max
        ) *
        chartHeight;


      context.beginPath();

      context.arc(
        x,
        y,
        3,
        0,
        Math.PI * 2
      );

      context.fillStyle =
        color;

      context.fill();

    }
  );

}


/* =====================================================
   GOALS
   ===================================================== */

function setupGoalForm() {

  document
    .getElementById(
      "goalForm"
    )
    ?.addEventListener(
      "submit",
      event => {

        event.preventDefault();

        createGoal();

      }
    );

}


function openGoalModal() {

  document
    .getElementById(
      "goalForm"
    )
    ?.reset();


  document
    .getElementById(
      "goalModal"
    )
    ?.classList.add(
      "show"
    );

}


function closeGoalModal() {

  document
    .getElementById(
      "goalModal"
    )
    ?.classList.remove(
      "show"
    );

}


function createGoal() {

  const name =
    document
      .getElementById(
        "goalName"
      )
      .value
      .trim();


  const target =
    Number(
      document
        .getElementById(
          "goalAmount"
        )
        .value
    );


  if (!name) {

    showToast(
      "Nama target wajib diisi."
    );

    return;

  }


  if (
    !target ||
    target <= 0
  ) {

    showToast(
      "Target tidak valid."
    );

    return;

  }


  goals.push({

    id:
      Date.now().toString(),

    name,

    target,

    saved:
      0,

    createdAt:
      new Date().toISOString()

  });


  saveUserData();

  renderGoals();

  closeGoalModal();

  showToast(
    "Target berhasil dibuat."
  );

}


function renderGoals() {

  const container =
    document.getElementById(
      "goalsList"
    );


  if (!container)
    return;


  if (
    goals.length ===
    0
  ) {

    container.innerHTML = `

      <div class="empty-state">

        <div class="empty-icon">
          ◇
        </div>

        <h3>
          Belum ada target
        </h3>

        <p>
          Buat target tabungan pertama kamu.
        </p>

      </div>

    `;

    return;

  }


  container.innerHTML =
    "";


  goals.forEach(
    goal => {

      const target =
        Number(
          goal.target
        ) || 0;


      const saved =
        Number(
          goal.saved
        ) || 0;


      const percentage =
        target > 0
          ? Math.min(
              100,
              (
                saved /
                target
              ) *
              100
            )
          : 0;


      const remaining =
        Math.max(
          0,
          target -
          saved
        );


      const card =
        document.createElement(
          "div"
        );


      card.className =
        "goal-card";


      card.innerHTML = `

        <h3>
          ${escapeHTML(
            goal.name
          )}
        </h3>

        <p>
          ${formatRupiah(
            saved
          )}
          dari
          ${formatRupiah(
            target
          )}
        </p>


        <div class="goal-progress">

          <div
            class="goal-progress-bar"
            style="width:${percentage}%"
          ></div>

        </div>


        <div class="goal-footer">

          <span>
            ${percentage.toFixed(1)}%
          </span>

          <strong>
            ${
              remaining > 0
                ? `Sisa ${formatRupiah(
                    remaining
                  )}`
                : "Target tercapai 🎉"
            }
          </strong>

        </div>


        <div class="goal-actions">

          <button
            onclick="addGoalSaving('${goal.id}')"
          >
            + Tambah
          </button>

          <button
            class="goal-delete"
            onclick="deleteGoal('${goal.id}')"
          >
            Hapus
          </button>

        </div>

      `;


      container.appendChild(
        card
      );

    }
  );

}


function addGoalSaving(id) {

  const goal =
    goals.find(
      item =>
        item.id ===
        id
    );


  if (!goal)
    return;


  const input =
    prompt(
      `Tambahkan tabungan untuk "${goal.name}":`
    );


  if (
    input ===
    null
  ) return;


  const amount =
    Number(
      input.replace(
        /[^\d]/g,
        ""
      )
    );


  if (
    !amount ||
    amount <= 0
  ) {

    showToast(
      "Nominal tidak valid."
    );

    return;

  }


  goal.saved =
    (
      Number(
        goal.saved
      ) || 0
    ) +
    amount;


  saveUserData();

  renderGoals();

  showToast(
    `${formatRupiah(
      amount
    )} berhasil ditambahkan.`
  );

}


function deleteGoal(id) {

  const goal =
    goals.find(
      item =>
        item.id === id
    );


  if (!goal)
    return;


  if (
    !confirm(
      `Hapus target "${goal.name}"?`
    )
  ) return;


  goals =
    goals.filter(
      item =>
        item.id !== id
    );


  saveUserData();

  renderGoals();

  showToast(
    "Target berhasil dihapus."
  );

}


function scrollToGoals() {

  document
    .getElementById(
      "goals"
    )
    ?.scrollIntoView({
      behavior: "smooth"
    });

}


/* =====================================================
   BUDGET
   ===================================================== */

function setBudget() {

  const input =
    prompt(
      "Masukkan budget bulanan kamu:"
    );


  if (
    input ===
    null
  ) return;


  const value =
    Number(
      input.replace(
        /[^\d]/g,
        ""
      )
    );


  if (
    !value ||
    value <= 0
  ) {

    showToast(
      "Budget tidak valid."
    );

    return;

  }


  budget =
    value;


  saveUserData();

  updateBudget();

  showToast(
    "Budget berhasil disimpan."
  );

}


function updateBudget() {

  const budgetAmount =
    document.getElementById(
      "budgetAmount"
    );

  const usedElement =
    document.getElementById(
      "budgetUsed"
    );

  const remainingElement =
    document.getElementById(
      "budgetRemaining"
    );

  const progress =
    document.getElementById(
      "budgetProgressBar"
    );


  const now =
    new Date();


  const currentMonth =
    now.getMonth();


  const currentYear =
    now.getFullYear();


  const used =
    transactions
      .filter(
        transaction => {

          if (
            transaction.type !==
            "expense"
          ) return false;


          const date =
            new Date(
              transaction.date +
              "T00:00:00"
            );


          return (
            date.getMonth() ===
              currentMonth &&
            date.getFullYear() ===
              currentYear
          );

        }
      )
      .reduce(
        (sum, transaction) =>
          sum +
          Number(
            transaction.amount
          ),
        0
      );


  const remaining =
    Math.max(
      0,
      budget -
      used
    );


  const percentage =
    budget > 0
      ? Math.min(
          100,
          (
            used /
            budget
          ) *
          100
        )
      : 0;


  budgetAmount.textContent =
    formatRupiah(
      budget
    );


  usedElement.textContent =
    `Terpakai ${formatRupiah(
      used
    )}`;


  remainingElement.textContent =
    budget > 0
      ? `Sisa ${formatRupiah(
          remaining
        )}`
      : "Belum ada budget";


  progress.style.width =
    `${percentage}%`;

}


/* =====================================================
   EXPORT CSV
   ===================================================== */

function exportCSV() {

  if (
    transactions.length ===
    0
  ) {

    showToast(
      "Belum ada transaksi."
    );

    return;

  }


  const header = [

    "Tanggal",

    "Tipe",

    "Deskripsi",

    "Kategori",

    "Nominal"

  ];


  const rows =
    transactions.map(
      transaction => [

        transaction.date,

        transaction.type ===
        "income"
          ? "Pemasukan"
          : "Pengeluaran",

        transaction.description,

        transaction.category,

        transaction.amount

      ]
    );


  const csv =
    [
      header,
      ...rows
    ]
      .map(
        row =>
          row
            .map(
              value =>
                `"${String(
                  value ?? ""
                ).replaceAll(
                  '"',
                  '""'
                )}"`
            )
            .join(",")
      )
      .join("\n");


  const blob =
    new Blob(
      [
        "\uFEFF" +
        csv
      ],
      {
        type:
          "text/csv;charset=utf-8;"
      }
    );


  const url =
    URL.createObjectURL(
      blob
    );


  const link =
    document.createElement(
      "a"
    );


  link.href =
    url;


  link.download =
    `moneytrack-${getToday()}.csv`;


  link.click();


  URL.revokeObjectURL(
    url
  );


  showToast(
    "CSV berhasil dibuat."
  );

}


/* =====================================================
   SETTINGS
   ===================================================== */

function saveAccountName() {

  const input =
    document.getElementById(
      "accountName"
    );


  const name =
    input.value.trim();


  if (!name) {

    showToast(
      "Nama tidak boleh kosong."
    );

    return;

  }


  const user =
    getCurrentUser();


  if (!user)
    return;


  const users =
    getUsers();


  const current =
    users.find(
      item =>
        item.id ===
        user.id
    );


  if (current) {

    current.name =
      name;

  }


  saveUsers(
    users
  );


  user.name =
    name;


  localStorage.setItem(
    STORAGE.session,
    JSON.stringify(
      user
    )
  );


  updateProfile(
    user
  );


  showToast(
    "Nama berhasil diperbarui."
  );

}


function resetAllData() {

  const first =
    confirm(
      "Yakin ingin menghapus semua transaksi, goals, dan budget?"
    );


  if (!first)
    return;


  const second =
    confirm(
      "Data yang dihapus tidak bisa dikembalikan."
    );


  if (!second)
    return;


  transactions = [];

  goals = [];

  budget = 0;


  saveUserData();

  updateEverything();


  showToast(
    "Semua data berhasil direset."
  );

}


/* =====================================================
   NAVIGATION
   ===================================================== */

function setupNavigation() {

  const items =
    document.querySelectorAll(
      ".nav-item"
    );


  items.forEach(
    item => {

      item.addEventListener(
        "click",
        event => {

          event.preventDefault();


          const targetId =
            item.getAttribute(
              "href"
            );


          const target =
            document.querySelector(
              targetId
            );


          if (!target)
            return;


          items.forEach(
            nav =>
              nav.classList.remove(
                "active"
              )
          );


          item.classList.add(
            "active"
          );


          target.scrollIntoView({
            behavior:
              "smooth"
          });

        }
      );

    }
  );

}


/* =====================================================
   MODAL
   ===================================================== */

function setupModalOutsideClick() {

  document.addEventListener(
    "click",
    event => {

      const transactionModal =
        document.getElementById(
          "transactionModal"
        );


      const goalModal =
        document.getElementById(
          "goalModal"
        );


      if (
        event.target ===
        transactionModal
      ) {

        closeTransactionModal();

      }


      if (
        event.target ===
        goalModal
      ) {

        closeGoalModal();

      }

    }
  );

}


/* =====================================================
   KEYBOARD
   ===================================================== */

function setupKeyboard() {

  document.addEventListener(
    "keydown",
    event => {

      if (
        event.key ===
        "Escape"
      ) {

        closeTransactionModal();

        closeGoalModal();

      }

    }
  );

}


/* =====================================================
   TOAST
   ===================================================== */

let toastTimer;


function showToast(message) {

  let toast =
    document.getElementById(
      "moneytrackToast"
    );


  if (!toast) {

    toast =
      document.createElement(
        "div"
      );

    toast.id =
      "moneytrackToast";

    toast.className =
      "toast";

    document.body.appendChild(
      toast
    );

  }


  toast.textContent =
    message;


  toast.style.display =
    "block";


  clearTimeout(
    toastTimer
  );


  toastTimer =
    setTimeout(
      () => {

        toast.style.display =
          "none";

      },
      2500
    );

}


/* =====================================================
   UPDATE EVERYTHING
   ===================================================== */

function updateEverything() {

  updateDashboard();

  renderTransactions();

  updateCategoryFilter();

  updateAnalytics();

  renderGoals();

  updateBudget();

  updateChart();

}


/* =====================================================
   GLOBAL FUNCTIONS
   ===================================================== */

window.showRegister =
  showRegister;

window.showLogin =
  showLogin;

window.login =
  login;

window.register =
  register;

window.logout =
  logout;

window.openTransactionModal =
  openTransactionModal;

window.closeTransactionModal =
  closeTransactionModal;

window.selectTransactionType =
  selectTransactionType;

window.deleteTransaction =
  deleteTransaction;

window.editTransaction =
  editTransaction;

window.openGoalModal =
  openGoalModal;

window.closeGoalModal =
  closeGoalModal;

window.createGoal =
  createGoal;

window.addGoalSaving =
  addGoalSaving;

window.deleteGoal =
  deleteGoal;

window.scrollToGoals =
  scrollToGoals;

window.setBudget =
  setBudget;

window.exportCSV =
  exportCSV;

window.saveAccountName =
  saveAccountName;

window.resetAllData =
  resetAllData;

window.showAllTransactionsHandler =
  showAllTransactionsHandler;