let db;
const request = indexedDB.open("budgetDb", 1);
request.onupgradeneeded = function (event) {
  const db = event.target.result;
  db.createObjectStore("pending", {autoIncrement:true});

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
  const transaction = db.transaction(["pending"], "readwrite");
  const budgetDbStore = transaction.objectStore("pending");
  budgetDbStore.add(record);
}

function checkDatabase() {
  const transaction = db.transaction(["pending"], "readwrite");
  const budgetDbStore = transaction.objectStore("pending");
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
          const transaction = db.transaction(["pending"], "readwrite");
          const budgetDbStore = transaction.objectStore("pending");
          budgetDbStore.clear();
        });
    }
  };
}

window.addEventListener('online', checkDatabase);