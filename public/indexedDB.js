let db;

const request = indexedDB.open("Budget.DB", 1);

request.onupgradeneeded = function (event) {
  const db = event.target.result;
  const budgetStore = db.createObjectStore("BudgetStore", {autoIncrement: true});
};

request.onsuccess = function (event) {
  db = event.target.result;
  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = function (event) {
  console.log(event.error);
};

function saveRecord(record) {
  const db = request.result;
  const transaction = db.transaction(["BudgetStore"], "readwrite");
  const budgetStore = transaction.objectStore("BudgetStore");
  budgetStore.add({name: record.name, value: record.value, date: record.date});
}

function checkDatabase() {
    const db = request.result;
    const transaction = db.transaction(["BudgetStore"], "readonly");
    const budgetStore = transaction.objectStore("BudgetStore");
    const getAll = budgetStore.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch('/api/transaction/bulk', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then(() => {
           const transaction = db.transaction(["BudgetStore"], "readwrite");
          const budgetStore = transaction.objectStore("BudgetStore");
          const budgetStoreRequest = budgetStore.clear();
        });
    }
  };
}

window.addEventListener('online', checkDatabase);
