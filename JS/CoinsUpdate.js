document.addEventListener("DOMContentLoaded", () => {
        const coins = localStorage.getItem("pomify_coins") || 0;
        document.getElementById("coins").textContent = coins;
    });