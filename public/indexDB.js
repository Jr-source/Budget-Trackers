let db;
const request = indexedDB.open("budget", 1);
request.onupgradeneeded = function (event) {
  const db = event.target.result;
  db.createObjectStore("transaction", {autoIncrement:true});

};

request.onsuccess = function (event) {
  db = event.target.result;

  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = function (event) {
  console.log("There has been an error retrieving your Data!" + request.error)
};

function saveRecord(record) {
  const transaction = db.transaction(["transaction"], "readwrite");
  const budgetDbStore = transaction.objectStore("transaction");
  budgetDbStore.add(record);
}

function checkDatabase() {
  const transaction = db.transaction(["transaction"], "readwrite");
  const budgetDbStore = transaction.objectStore("transaction");
  const getAll = budgetDbStore.getAll();

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
          const transaction = db.transaction(["transaction"], "readwrite");
          const budgetDbStore = transaction.objectStore("transaction");
          budgetDbStore.clear();
        });
    }
  };
}

window.addEventListener('online', checkDatabase);