let allPokemonList = [];
let filteredList = [];
let offset = 0;
const limit = 20;
let currentFilters = { types: [], ability: "", height: "", weight: "", minId: 1, maxId: 1025 };

// Type colors
const typeColors = {
    bug: "#A6B91A", dark: "#705746", dragon: "#6F35FC", electric: "#F7D02C",
    fairy: "#D685AD", fighting: "#C22E28", fire: "#EE8130", flying: "#A98FF3",
    ghost: "#735797", grass: "#7AC74C", ground: "#E2BF65", ice: "#96D9D6",
    normal: "#A8A77A", poison: "#A33EA1", psychic: "#F95587", rock: "#B6A136",
    steel: "#B7B7CE", water: "#6390F0"
};

// ----- INIT -----
window.onload = async function () {
    const typeContainer = document.getElementById("typeFilters");
    Object.keys(typeColors).forEach(type => {
        const btn = document.createElement("div");
        btn.className = "type-badge";
        btn.innerText = type;
        btn.style.background = typeColors[type];
        btn.onclick = () => toggleTypeFilter(type, btn);
        typeContainer.appendChild(btn);
    });

    // Load abilities list (first 200 abilities)
    const res = await fetch("https://pokeapi.co/api/v2/ability?limit=200");
    const data = await res.json();
    const abilitySelect = document.getElementById("abilityFilter");
    data.results.forEach(a => {
        const opt = document.createElement("option");
        opt.value = a.name;
        opt.innerText = a.name;
        abilitySelect.appendChild(opt);
    });

    // Load all Pokémon once
    const allRes = await fetch("https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0");
    const allData = await allRes.json();
    allPokemonList = allData.results;

    applyFilters(); // Initial render
};

// ----- FILTER BUTTONS -----
function toggleTypeFilter(type, btn) {
    if (currentFilters.types.includes(type)) {
        currentFilters.types = currentFilters.types.filter(t => t !== type);
        btn.classList.remove("active");
    } else {
        currentFilters.types.push(type);
        btn.classList.add("active");
    }
}

// ----- FILTER LOGIC -----
async function applyFilters() {
    showLoader();

    currentFilters.ability = document.getElementById("abilityFilter").value;
    currentFilters.height = document.getElementById("heightFilter").value;
    currentFilters.weight = document.getElementById("weightFilter").value;
    currentFilters.minId = parseInt(document.getElementById("minId").value);
    currentFilters.maxId = parseInt(document.getElementById("maxId").value);

    filteredList = [];

    for (const p of allPokemonList) {
        const id = extractIdFromUrl(p.url);
        if (id < currentFilters.minId || id > currentFilters.maxId) continue;

        const pokeData = await fetch(p.url).then(r => r.json());
        if (!passesFilters(pokeData)) continue;

        filteredList.push(pokeData);
    }

    offset = 0;
    renderPage();

    hideLoader();
}


function resetFilters() {
    currentFilters = { types: [], ability: "", height: "", weight: "", minId: 1, maxId: 1025 };
    document.getElementById("abilityFilter").value = "";
    document.getElementById("heightFilter").value = "";
    document.getElementById("weightFilter").value = "";
    document.getElementById("minId").value = 1;
    document.getElementById("maxId").value = 1025;
    document.querySelectorAll(".type-badge.active").forEach(b => b.classList.remove("active"));

    applyFilters();
}

function passesFilters(pokemon) {
    if (pokemon.id < currentFilters.minId || pokemon.id > currentFilters.maxId) return false;

    if (currentFilters.types.length > 0) {
        const pTypes = pokemon.types.map(t => t.type.name);
        if (!currentFilters.types.every(t => pTypes.includes(t))) return false;
    }

    if (currentFilters.ability) {
        const abilities = pokemon.abilities.map(a => a.ability.name);
        if (!abilities.includes(currentFilters.ability)) return false;
    }

    if (currentFilters.height) {
        if (currentFilters.height === "small" && pokemon.height > 10) return false;
        if (currentFilters.height === "medium" && (pokemon.height <= 10 || pokemon.height > 20)) return false;
        if (currentFilters.height === "large" && pokemon.height <= 20) return false;
    }

    if (currentFilters.weight) {
        if (currentFilters.weight === "light" && pokemon.weight > 200) return false;
        if (currentFilters.weight === "medium" && (pokemon.weight <= 200 || pokemon.weight > 800)) return false;
        if (currentFilters.weight === "heavy" && pokemon.weight <= 800) return false;
    }

    return true;
}

// ----- PAGINATION -----
function renderPage() {
    showLoader();

    const container = document.getElementById("pokemonList");
    container.innerHTML = "";

    const start = offset;
    const end = offset + limit;
    const pageItems = filteredList.slice(start, end);

    pageItems.forEach(pokeData => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
      <span class="id">#${pokeData.id.toString().padStart(4, "0")}</span>
      <h3>${pokeData.name}</h3>
      <img src="${pokeData.sprites.other['official-artwork'].front_default}" alt="${pokeData.name}">
      <div class="types">
        ${pokeData.types.map(t => `<span class="type-badge" style="background:${typeColors[t.type.name]}">${t.type.name}</span>`).join("")}
      </div>
    `;
        card.onclick = () => openModal(pokeData);
        container.appendChild(card);
    });

    document.getElementById("pageInfo").innerText =
        `Page ${offset / limit + 1} of ${Math.ceil(filteredList.length / limit)}`;

    hideLoader();
}


function nextPage() {
    if (offset + limit < filteredList.length) {
        offset += limit;
        renderPage();
    }
}

function prevPage() {
    if (offset >= limit) {
        offset -= limit;
        renderPage();
    }
}

// ----- SEARCH -----
async function searchPokemon() {
    const query = document.getElementById("searchInput").value.trim().toLowerCase();
    if (!query) return;

    try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${query}`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        openModal(data);
    } catch {
        alert("Pokémon not found!");
    }
}

// ----- MODAL -----
async function openModal(pokemon) {
    const modal = document.getElementById("pokemonModal");
    const body = document.getElementById("modalBody");

    const species = await fetch(pokemon.species.url).then(r => r.json());
    let evoChainHtml = "";

    if (species.evolution_chain) {
        const evoChain = await fetch(species.evolution_chain.url).then(r => r.json());
        evoChainHtml = await renderEvolutions(evoChain.chain); // 🔥 await here
    }


    body.innerHTML = `
    <div class="details-text">
      <h2>${pokemon.name} (#${pokemon.id})</h2>
      <p><b>Height:</b> ${pokemon.height}</p>
      <p><b>Weight:</b> ${pokemon.weight}</p>
      <p><b>Types:</b> ${pokemon.types.map(t => t.type.name).join(", ")}</p>
      <p><b>Abilities:</b> ${pokemon.abilities.map(a => a.ability.name).join(", ")}</p>

      <h3>Stats</h3>
      <div class="stats">
        <ul>
          ${pokemon.stats.map(s => `<li>${statIcon(s.stat.name)} ${s.stat.name}: ${s.base_stat}</li>`).join("")}
        </ul>
      </div>
    </div>

    <div class="thumbnail">
      <img src="${pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default}" alt="${pokemon.name}">
    </div>

    <div style="flex-basis:100%">
      <h3>Evolution Chain</h3>
      ${evoChainHtml || "<p>No evolutions available</p>"}
    </div>
  `;

    modal.classList.remove("hidden");
}

function closeModal() {
    document.getElementById("pokemonModal").classList.add("hidden");
}

// ----- STAT ICONS -----
function statIcon(statName) {
    switch (statName) {
        case "hp": return "❤️";
        case "attack": return "⚔️";
        case "defense": return "🛡️";
        case "special-attack": return "✨";
        case "special-defense": return "🛡️✨";
        case "speed": return "💨";
        default: return "";
    }
}

// ----- EVOLUTIONS -----
async function renderEvolutions(chain, stage = 1) {
    let html = `<div class="evolutions">`;

    async function traverse(node, stage) {
        if (!node) return;
        const pokeId = extractIdFromUrl(node.species.url);

        // fetch detailed Pokémon data
        const pokeData = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokeId}`).then(r => r.json());

        html += `
        <div class="evo-card" onclick="loadEvolution('${pokeData.name}')">
            <span class="stage">Stage ${stage}</span>
            <img src="${pokeData.sprites.other['official-artwork'].front_default}" alt="${pokeData.name}">
            <p class="id">#${pokeData.id.toString().padStart(4, "0")}</p>
            <p class="name">${pokeData.name}</p>
            <div class="types">
                ${pokeData.types.map(t =>
            `<span class="type-badge" style="background:${typeColors[t.type.name]}">${t.type.name}</span>`
        ).join("")}
            </div>
        </div>`;

        // go deeper into the evolution tree
        for (const evo of node.evolves_to) {
            await traverse(evo, stage + 1);
        }
    }

    await traverse(chain, stage);

    html += `</div>`;
    return html;
}


async function loadEvolution(name) {
    const data = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`).then(r => r.json());
    openModal(data);
}

function extractIdFromUrl(url) {
    const parts = url.split("/").filter(Boolean);
    return parts[parts.length - 1];
}

function toggleFilters() {
    const filters = document.getElementById("filters");
    filters.classList.toggle("hidden");
}

// Close modal when clicking outside content
document.getElementById("pokemonModal").addEventListener("click", function (e) {
    if (e.target === this) {
        closeModal();
    }
});


// Loader
function showLoader() {
    document.getElementById("loader").classList.remove("hidden");
    document.getElementById("pokemonList").classList.add("hidden");
}

function hideLoader() {
    document.getElementById("loader").classList.add("hidden");
    document.getElementById("pokemonList").classList.remove("hidden");
}
