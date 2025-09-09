/************* CONFIG *************/
const rarities = {
    free: { chance: 100, color: "#4caf50", sellRange: [3, 7] },
    common: { chance: 60, color: "#9e9e9e", sellRange: [15, 25] },
    rare: { chance: 25, color: "#2196f3", sellRange: [40, 60] },
    epic: { chance: 10, color: "#9c27b0", sellRange: [120, 180] },
    legendary: { chance: 5, color: "#ff9800", sellRange: [450, 600] },
    mythical: { chance: 2, color: "#e91e63", sellRange: [700, 900] },
    ultrabeast: { chance: 2, color: "#00bcd4", sellRange: [500, 700] },
    secret: { chance: 0.5, color: "#ffd700", sellRange: [1500, 2000] }
};

const packConfigs = {
    free: { cost: 0, distribution: { common: 70, rare: 25, epic: 5 } },
    common: { cost: 50, distribution: { common: 80, rare: 15, epic: 5 } },
    rare: { cost: 150, distribution: { rare: 60, epic: 35, legendary: 5 } },
    epic: { cost: 400, distribution: { epic: 60, legendary: 40 } },
    legendary: { cost: 1000, distribution: { legendary: 100 } },
    mythical: { cost: 2000, distribution: { mythical: 100 } },
    ultrabeast: { cost: 1500, distribution: { ultrabeast: 100 } },
    secret: { cost: 5000, distribution: { secret: 100 } }
};

const pools = {
    legendary: [
        "mewtwo", "lugia", "ho-oh", "kyogre", "groudon", "rayquaza",
        "dialga", "palkia", "giratina", "reshiram", "zekrom", "xerneas",
        "yveltal", "zacian", "zamazenta", "eternatus"
    ],
    mythical: [
        "mew", "celebi", "jirachi", "manaphy", "victini", "genesect",
        "meloetta", "hoopa", "volcanion", "magearna", "marshadow", "zeraora"
    ],
    ultrabeast: [
        "nihilego", "buzzwole", "pheromosa", "xurkitree", "kartana",
        "celesteela", "guzzlord", "poipole", "naganadel", "stakataka", "blacephalon"
    ],
    secret: [
        "arceus", "dialga", "palkia", "giratina", "rayquaza", "zygarde", "necrozma", "eternatus"
    ]
};

/************* STATE *************/
let coins = 100000000;  // starting currency
let inventory = [];
let unopenedPacks = {}; // { type: count }
let isOpening = false;

/************* NAVIGATION *************/
function showSection(id) {
    document.querySelectorAll("section").forEach(s => s.classList.add("hidden"));
    document.getElementById(id).classList.remove("hidden");

    if (id === "spin") renderUnopenedPacks();
    if (id === "indexPage") renderRarityIndex();
}

/************* STORE HELPERS *************/
function buyPackFromUI(type) {
    const qtyInput = document.getElementById(`qty-${type}`);
    const qty = Math.max(1, parseInt(qtyInput?.value || "1", 10));
    buyPack(type, qty);
}

function buyPack(type, amount = 1) {
    const pack = packConfigs[type];
    if (!pack) return;

    const totalCost = pack.cost * amount;
    if (coins < totalCost) {
        showToast("❌ Not enough coins!");
        return;
    }

    coins -= totalCost;
    unopenedPacks[type] = (unopenedPacks[type] || 0) + amount;
    updateCoins();
    showToast(`🎁 ${amount}× ${type.toUpperCase()} pack(s) added!`);
}

/************* OPENING *************/
async function openPack(type) {
    if (isOpening) { showToast("⚠️ Already opening a pack!"); return; }
    if (!unopenedPacks[type] || unopenedPacks[type] <= 0) {
        showToast("❌ No packs of this type left!");
        return;
    }

    unopenedPacks[type]--;
    renderUnopenedPacks();

    isOpening = true;
    const animDiv = document.getElementById("spin-animation");
    const resultDiv = document.getElementById("result");

    // preload while animation plays
    const pokemonPromise = rollPokemon(type);

    // show pokéball shake
    animDiv.innerHTML = `
      <div class="pokeball-anim"></div>
      <div class="pokeball-shadow"></div>
    `;
    resultDiv.innerHTML = "";

    setTimeout(async () => {
        animDiv.innerHTML = `<div class="flash"></div>`;
        setTimeout(async () => {
            animDiv.innerHTML = "";
            const pokemon = await pokemonPromise;
            inventory.push(pokemon);
            renderInventory();
            showSpinResult(pokemon);
            isOpening = false;
        }, 500);
    }, 2200);
}

/************* DATA *************/
async function rollPokemon(packType) {
    const distribution = packConfigs[packType].distribution;
    const rarity = pickFromDistribution(distribution);

    // If this rarity has a defined pool, pick from there
    let nameOrId;
    if (pools[rarity]) {
        const pool = pools[rarity];
        nameOrId = pool[Math.floor(Math.random() * pool.length)];
    } else {
        // fallback: pick random id from 1–898
        nameOrId = Math.floor(Math.random() * 898) + 1;
    }

    const poke = await safeFetchPokemon(nameOrId);
    if (!poke) return rollPokemon(packType); // retry if not found

    return {
        id: poke.id,
        name: poke.name,
        sprite: poke.sprites?.other?.["official-artwork"]?.front_default || poke.sprites?.front_default,
        rarity,
        sellValue: getRandomSellValue(rarity)
    };
}


function pickFromDistribution(dist) {
    const roll = Math.random() * 100;
    let sum = 0;
    for (const [rarity, chance] of Object.entries(dist)) {
        sum += chance;
        if (roll <= sum) return rarity;
    }
    return "common";
}

/************* RENDER *************/
function renderUnopenedPacks() {
    const container = document.getElementById("unopened-packs");
    const order = Object.keys(packConfigs);
    const entries = order.filter(t => unopenedPacks[t] > 0).map(t => [t, unopenedPacks[t]]);

    if (!entries.length) {
        container.innerHTML = "<p>No unopened packs. Go to the store! 🛒</p>";
        return;
    }

    container.innerHTML = entries.map(([type, count]) => `
      <div class="pack-card" onclick="openPack('${type}')">
        <div class="foil"></div>
        <div class="pack-title">${type.toUpperCase()} Pack</div>
        <div class="pack-divider"></div>
        <p class="pack-sub">Click to open 🎁</p>
        ${count > 1 ? `<span class="badge">x${count}</span>` : ""}
      </div>
    `).join("");
}

function showSpinResult(pokemon) {
    const result = document.getElementById("result");
    const glowClass = getGlowClass(pokemon.rarity);
    const color = rarities[pokemon.rarity].color;

    result.innerHTML = `
      <div class="result-card ${glowClass}" style="border-color:${color}">
        <img src="${pokemon.sprite}" alt="${pokemon.name}">
        <h3>#${pokemon.id} ${pokemon.name}</h3>
        <p style="color:${color}">⭐ ${pokemon.rarity.toUpperCase()}</p>
        <p>Sell Value: ${pokemon.sellValue} 🪙</p>
      </div>
    `;
}

function renderInventory() {
    const invDiv = document.getElementById("inventoryGrid");
    if (!inventory.length) {
        invDiv.innerHTML = "<p>No Pokémon yet. Spin some packs! 🎰</p>";
        return;
    }

    invDiv.innerHTML = inventory.map((p, i) => `
      <div class="inv-card ${getGlowClass(p.rarity)}" style="border-color:${rarities[p.rarity].color}">
        <img src="${p.sprite}" alt="${p.name}">
        <p>#${p.id} ${p.name}</p>
        <span style="color:${rarities[p.rarity].color}">⭐ ${p.rarity}</span><br>
        <button onclick="sellPokemon(${i})">💸 Sell (${p.sellValue} 🪙)</button>
      </div>
    `).join("");
}

function renderRarityIndex() {
    const container = document.getElementById("rarity-index");
    container.innerHTML = Object.keys(packConfigs).map(pack => {
        const dist = packConfigs[pack].distribution;
        const list = Object.entries(dist)
            .map(([r, c]) => `<li>${r.toUpperCase()}: ${c}% (sell ${rarities[r].sellRange[0]}–${rarities[r].sellRange[1]} 🪙)</li>`)
            .join("");
        return `
          <div class="rarity-box" style="border-left:6px solid ${rarities[pack]?.color || '#ccc'}">
            <h3>${pack.toUpperCase()} Pack</h3>
            <ul>${list}</ul>
          </div>
        `;
    }).join("");
}

/************* COINS & SELLING *************/
function sellPokemon(index) {
    coins += inventory[index].sellValue;
    inventory.splice(index, 1);
    updateCoins();
    renderInventory();
}
function updateCoins() {
    document.getElementById("coins").innerText = coins;
}

/************* HELPERS *************/
function getRandomSellValue(rarity) {
    const [min, max] = rarities[rarity].sellRange;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function getGlowClass(rarity) {
    if (rarity === "rare") return "glow-rare";
    if (rarity === "epic") return "glow-epic";
    if (rarity === "legendary") return "glow-legendary";
    if (rarity === "mythical") return "glow-mythical";
    if (rarity === "ultrabeast") return "glow-ultrabeast";
    if (rarity === "secret") return "glow-secret";
    return "";
}

async function safeFetchPokemon(nameOrId) {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${nameOrId}`);
    if (!res.ok) {
        console.warn(`⚠️ Pokémon not found: ${nameOrId}`);
        return null;
    }
    return res.json();
}


/************* TOAST *************/
function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add("show"), 10);
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 280);
    }, 1800);
}

/************* INIT *************/
document.addEventListener("DOMContentLoaded", () => {
    unopenedPacks.free = 2;
    updateCoins();
    renderUnopenedPacks();
    renderInventory();
    showSection("store");
});
