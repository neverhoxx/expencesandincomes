let expenses = [];

async function loadExpenses() {
    const response = await fetch('https://kool.krister.ee/chat/ykExspenses');
    expenses = await response.json();
    renderExpenses();
}

function renderExpenses() {
    const container = document.getElementById('expenses-list');
    container.innerHTML = '';

    const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));

    sortedExpenses.forEach(expense => {
        const item = document.createElement('div');
        item.className = `expense-item ${expense.type}`;
        item.innerHTML = `
      <span class="amount">${expense.amount} €</span>
      <span class="description">${expense.description}</span>
      <span class="date">${formatDate(expense.date)}</span>
      <button onclick="deleteExpense(${expense.id})">Delete</button>
    `;
        container.appendChild(item);
    });

    updateBalance();
}

function formatDate(dateString) {
    const options = { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('et-ET', options);
}

function updateBalance() {
    const balance = expenses.reduce((sum, exp) => {
        return exp.type === 'income' ? sum + exp.amount : sum - exp.amount;
    }, 0);

    document.getElementById('balance').textContent = `Balance: ${balance.toFixed(2)}€`;
}

function addExpense(amount, description, type) {
    const newExpense = {
        id: Date.now(),
        amount: parseFloat(amount),
        description,
        type,
        date: new Date().toISOString()
    };

    expenses.push(newExpense);
    renderExpenses();

    fetch("https://kool.krister.ee/chat/ykExspenses", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(newExpense)
    });
}

function deleteExpense(id) {
    expenses = expenses.filter(exp => exp.id !== id);
    renderExpenses();
}

document.addEventListener('DOMContentLoaded', () => {
    loadExpenses();

    document.getElementById('expense-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const amount = e.target.amount.value;
        const description = e.target.description.value;
        const type = e.target.type.value;

        if (amount && description) {
            addExpense(amount, description, type);
            e.target.reset();
        }
    });
});