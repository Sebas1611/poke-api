document.addEventListener('DOMContentLoaded', () => {
    cargarListaPokemons('pokemon1');
    cargarListaPokemons('pokemon2');
});

// Diccionario para traducir los tipos de Pokémon al español
const tipoTraducciones = {
    normal: 'Normal',
    fire: 'Fuego',
    water: 'Agua',
    grass: 'Planta',
    electric: 'Eléctrico',
    ice: 'Hielo',
    fighting: 'Lucha',
    poison: 'Veneno',
    ground: 'Tierra',
    flying: 'Volador',
    psychic: 'Psíquico',
    bug: 'Bicho',
    rock: 'Roca',
    ghost: 'Fantasma',
    dragon: 'Dragón',
    dark: 'Siniestro',
    steel: 'Acero',
    fairy: 'Hada'
};

function cargarListaPokemons(selectId) {
    const selectElement = document.getElementById(selectId);
    fetch('https://pokeapi.co/api/v2/pokemon?limit=1000')
        .then(response => response.json())
        .then(data => {
            data.results.forEach(pokemon => {
                const option = document.createElement('option');
                option.value = pokemon.url;
                option.textContent = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1); // Nombres en inglés
                selectElement.appendChild(option);
            });
        })
        .catch(error => console.error('Error cargando la lista de Pokémon:', error));
}

function cargarPokemon(selectId) {
    const selectElement = document.getElementById(selectId);
    const pokemonUrl = selectElement.value;
    const infoElement = document.getElementById(`info-${selectId}`);

    if (!pokemonUrl) {
        infoElement.innerHTML = '';
        return;
    }

    fetch(pokemonUrl)
        .then(response => response.json())
        .then(pokemon => {
            // Mantener el nombre del Pokémon en inglés
            const pokemonName = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);

            // Obtener los primeros 5 movimientos (ataques comunes)
            const moveUrls = pokemon.moves.map(move => move.move.url); // Obtener todos los movimientos

            // Fetch para obtener el nombre de los ataques en español
            Promise.all(moveUrls.map(url => fetch(url).then(res => res.json())))
                .then(movimientos => {
                    // Obtener nombres de los ataques en español
                    const attackNames = movimientos.map(move =>
                        move.names.find(name => name.language.name === 'es')?.name || 'Desconocido'
                    );

                    const attack1 = attackNames[0] || 'Desconocido';
                    const attack2 = attackNames[1] || 'Desconocido';

                    // Buscar un ataque especial entre todos los movimientos usando la clase de daño
                    const specialAttack = movimientos.find(move => move.damage_class.name === 'special')?.names.find(name => name.language.name === 'es')?.name || 'Desconocido';

                    // Obtener tipos del Pokémon en español
                    const types = pokemon.types.map(typeInfo => tipoTraducciones[typeInfo.type.name] || typeInfo.type.name).join(', ');

                    console.log('Ataques comunes:', attackNames); // 
                    console.log('Ataque especial:', specialAttack); //

                    // Obtener ventaja (los tipos de Pokémon a los que tiene ventaja) y traducir los tipos
                    return fetch(`https://pokeapi.co/api/v2/type/${pokemon.types[0].type.name}`)
                        .then(response => response.json())
                        .then(typeData => {
                            const advantages = typeData.damage_relations.double_damage_to
                                .map(type => tipoTraducciones[type.name] || type.name) // Traducir los tipos
                                .join(', ');

                            const pokemonCard = `
                                <div class="pokemon-card">
                                    <img src="${pokemon.sprites.front_default}" alt="${pokemonName}">
                                    <h2>${pokemonName}</h2> <!-- Nombres en inglés -->
                                    <p><strong>Tipo:</strong> ${types}</p>
                                    <p><strong>Ataque 1:</strong> ${attack1}</p>
                                    <p><strong>Ataque 2:</strong> ${attack2}</p>
                                    <p><strong>Ataque especial:</strong> ${specialAttack}</p>
                                    <p><strong>Ventaja contra:</strong> ${advantages}</p>
                                </div>
                            `;
                            infoElement.innerHTML = pokemonCard;
                        })
                        .catch(error => console.error('Error cargando las ventajas del tipo:', error));
                })
                .catch(error => console.error('Error cargando los datos de los movimientos:', error));
        })
        .catch(error => console.error('Error cargando los datos del Pokémon:', error));
}
