const url = './data/ships.json'
//Стартовая инициализация
let dictionary = new Map;
let level_count = 0;
let ship_count = 0;
let ship_limit = 7;
let level_limit = 42;
let ship_name_list = [];
let ships_block = document.getElementById('ships');
let nations_select = document.querySelector('.select.nation');
let types_select = document.querySelector('.select.type');
let levels_select = document.querySelector('.select.level');
let ships_result_block = document.querySelector('div.aside_list')
let total_block = document.querySelector('div.aside_total')
let link_block = document.querySelector('.link');
let ships_for_tick = null;
let ships_for_link = null;
total_block.innerHTML = `Сумма уровней : ${ship_count}`
let host = 'localhost:63342/test-ship-app/?flot='

// Заполняем словарь
/*Словарь*/{
  dictionary
    .set('pan_america', 'Пан-Америка')
    .set('commonwealth', 'Содружество Наций')
    .set('pan_asia', 'Пан-Азия')
    .set('france', 'Франция')
    .set('uk', 'Великобритания')
    .set('germany', 'Германия')
    .set('italy', 'Италия')
    .set('usa', 'США')
    .set('ussr', 'Россия / СССР')
    .set('europe', 'Европа')
    .set('japan', 'Япония')
    .set('aircarrier', 'Авианосец')
    .set('cruiser', 'Крейсер')
    .set('battleship', 'Линкор')
    .set('destroyer', 'Эсминец')
    .set('1', 'I')
    .set('2', 'II')
    .set('3', 'III')
    .set('4', 'IV')
    .set('5', 'V')
    .set('6', 'VI')
    .set('7', 'VII')
    .set('8', 'VIII')
    .set('9', 'IX')
    .set('10', 'X')
    .set('', '')
}

//Получение данных
async function getData() {
  return await fetch(url).then( response => {
    if (response.ok) {
      return response.json();
    }
    return response.json().then(err => {
      const e =  new Error('Данные не получены, проверьте URL')
      e.data = err
      throw e
    })
  })
}

//Генерируем блок поиска
document.querySelector('.search').insertAdjacentHTML(
  "beforeend",
  `<input
          id="search"
          type="search"
          placeholder="Найти корабль.."
          autofocus
          oninput="filterItems(ships_block.querySelectorAll('div.ship_container'))"
        >`
);

//Обработка данных
getData()
  .then(ships => {
    let nations = new Set;
    let ship_types = new Set;
    let ship_levels = new Set;
    //Генерируем список кораблей
    for (const ship of ships) {
      ships_block.insertAdjacentHTML(
        'beforeend',
        `<div class="ship_container">
                  <div 
                    data-ship=${encodeURIComponent(JSON.stringify(ship))} 
                    class="ships_item  ${ship.nation} ${ship.type}"
                  >
                  </div>
                  <small>${dictionary.get(`${ship.nation}`)}</small> 
                  <img class="nation_flag" src="./data/${ship.nation}.png" alt="${ship.nation}">  <br>
                  <span>${dictionary.get(`${ship.level}`)}</span><strong>${ship.title}</strong>
                  <div class="invisible">${dictionary.get(`${ship.type}`)}</div>
                  <div class="invisible">${ship.level}</div>
              </div>`
      );
      //Заполняем служебные массивы
      nations.add(ship.nation);
      ship_types.add(ship.type);
      ship_levels.add(ship.level);
    }
    ships_for_tick = ships_block.querySelectorAll('div.ship_container')
    shipToLink();
    //Сортируем служебные массивы
    nations = Array.from(nations).sort((a,b) => a-b);
    ship_types = Array.from(ship_types).sort((a,b) => a-b);
    ship_levels = Array.from(ship_levels).sort((a,b) => a-b);

    //Генерируем селект "Нация"
    let html_nations = '';
    for (const nation of nations) {
      html_nations +=  `<option value=${nation}>${dictionary.get(`${nation}`)}</option>\n`
    }
    nations_select.insertAdjacentHTML('beforeend',
      `<select
              name="nation"
              id="nation"
              oninput="filterItems(ships_block.querySelectorAll('div.ship_container'))"
            >
              <option value="" selected="selected">Нация</option>
              ${html_nations}
            </select>`
    );
    //Генерируем селект "Класс"
    let html_types = '';
    for (const type of ship_types) {
      html_types +=  `<option value=${type}>${dictionary.get(`${type}`)}</option>\n`
    }
    types_select.insertAdjacentHTML('beforeend',
      `<select
              name="type"
              id="type"
              oninput="filterItems(ships_block.querySelectorAll('div.ship_container'))"
            >
              <option value="" selected="selected">Класс</option>
              ${html_types}
            </select>`
    );
    //Генерируем селект "Уровень"
    let html_levels = '';
    for (const level of ship_levels) {
      html_levels +=  `<option value=${level}>${dictionary.get(`${level}`)}</option>\n`
    }
    levels_select.insertAdjacentHTML('beforeend',
      `<select
              name="level"
              id="level"
              oninput="filterItems(ships_block.querySelectorAll('div.ship_container'))"
            >
              <option value="" selected="selected">Уровень</option>
              ${html_levels}
            </select>`
    );
  })

//Переносим корабль в список
const goToList = e => {
  if (e.target.parentElement.className !== 'ship_container') return;
  let ship = JSON.parse(decodeURIComponent(e.target.parentElement.firstElementChild.dataset.ship));
  let _ship = Object.entries(ship)
  let buffer = _ship[0];
  _ship[0] = _ship[3];
  _ship[3] = buffer;
  _ship = Object.fromEntries(_ship)
  if (ship_name_list.includes(ship.title)) alert(`Невозможно добавить корабль! С названием ${ship.title}`);
  if ((level_count + +ship.level) > level_limit) alert(`Невозможно добавить корабль! Сумма уровней не должна превышать ${level_limit}`);
  if ((ship_count + 1) > ship_limit) alert(`Невозможно добавить корабль! количество кораблей не должно превышать ${ship_limit}`);
  if ((level_count + +ship.level) <= level_limit && (ship_count + 1) <= ship_limit && !ship_name_list.includes(ship.title)) {
    ships_result_block.insertAdjacentHTML(
      'beforeend',
      `<div class="ship_container result-ship_container">
              <div 
                data-ship=${encodeURIComponent(JSON.stringify(_ship))} 
                class="ships_item result-ships_item ${ship.nation} ${ship.type}"
              ></div>
              <small>${dictionary.get(`${ship.nation}`)}</small> 
              <img class="nation_flag" src="./data/${ship.nation}.png" alt="${ship.nation}"> <br>
              <span>${dictionary.get(`${ship.level}`)}</span><strong>${ship.title}</strong>
              <div class="invisible">${dictionary.get(`${ship.type}`)}</div>
              <div class="invisible">${ship.level}</div>
              <div class="close"></div>
            </div>`
    );
    ships_for_link = document.querySelectorAll('div.ship_container.result-ship_container');
    let ships_data = [];
    Array.from(ships_for_link).forEach(el => {
      let ship_value = Object.values(JSON.parse(decodeURIComponent(el.firstElementChild.dataset.ship)));
      let result = ship_value.reduce((sum_string, el) => sum_string + ':' + el)
      ships_data.push(result);
    })
    ships_data = ships_data.reduce((sum_string, el) => sum_string + el + '|', `${host}`);
    link_block.innerHTML = ships_data;
    level_count += +ship.level;
    ship_count++;
    ship_name_list.push(ship.title);
    total_block.innerHTML = `Сумма уровней : ${level_count}`;
    e.target.classList.add('blur')
    e.target.insertAdjacentHTML(
      'afterend',
      `<div class="tick"></div>`
    );
  }
}

const shipToLink = () => {
  if (document.location.search === '') return
  let str = document.location.search;
  let params = new URLSearchParams(str);
  let data_str = params.get('flot')
  let data_arr = data_str.split('|')
  data_arr.pop()
  console.log(data_arr)
  data_arr.forEach(ship => {
    let ship_arr = Array.from(ship.split(':'));
    ship = {
      nation: ship_arr[0],
      level: ship_arr[1],
      type: ship_arr[2],
      title: ship_arr[3],
    }
    ships_result_block.insertAdjacentHTML(
      'beforeend',
      `<div class="ship_container result-ship_container">
              <div
                data-ship=${encodeURIComponent(JSON.stringify(ship))}
                class="ships_item result-ships_item ${ship.nation} ${ship.type}"
              ></div>
              <small>${dictionary.get(`${ship.nation}`)}</small>
              <img class="nation_flag" src="./data/${ship.nation}.png" alt="${ship.nation}"> <br>
              <span>${dictionary.get(`${ship.level}`)}</span><strong>${ship.title}</strong>
              <div class="invisible">${dictionary.get(`${ship.type}`)}</div>
              <div class="invisible">${ship.level}</div>
              <div class="close"></div>
            </div>`
    );
    Array.from(ships_for_tick).forEach(el => {
      el = el.firstElementChild;
      if (JSON.parse(decodeURIComponent(el.dataset.ship)).title === ship.title){
        level_count += +ship.level;
        ship_count++;
        ship_name_list.push(ship.title);
        total_block.innerHTML = `Сумма уровней : ${level_count}`;
        el.classList.add('blur')
        el.insertAdjacentHTML(
          'afterend',
          `<div class="tick"></div>`
        );
      }
    })
  })
}

ships_block.addEventListener('click', goToList)



//Удаляем корабль из списка
const removeFromList = e => {
  if (e.target.className !== 'close') return;
  let ship = JSON.parse(decodeURIComponent(e.target.parentElement.firstElementChild.dataset.ship));
  let ticked_ships = ships_block.querySelectorAll('div.ships_item.blur')

  Array.from(ticked_ships).forEach(el => {
    if (JSON.parse(decodeURIComponent(el.dataset.ship)).title === ship.title) {
      el.nextSibling.remove()
      el.classList.remove('blur')
    }
  });
  e.target.parentNode.parentNode.removeChild(e.target.parentNode);
  level_count -= +ship.level;
  total_block.innerHTML = `Сумма уровней : ${level_count}`;
  ship_count--;
  ship_name_list = ship_name_list.filter(el => el !== ship.title);
}

ships_result_block.addEventListener('click', removeFromList)

function filterItems(searchItems) {
  let search_str = document.querySelector('#search').value.trim().toLowerCase();
  let nation_str = dictionary.get(document.querySelector(`#nation`).value).toLowerCase();
  let type_str = dictionary.get(document.querySelector(`#type`).value).toLowerCase();
  let level_str = +document.querySelector(`#level`).value;

  if (!search_str && !nation_str && !type_str && !level_str) {
    searchItems.forEach(el => {
      el.classList.remove('hide');
    })
  }
  if (search_str && !nation_str && !type_str && !level_str) {
    searchItems.forEach(el => {
      if (el.innerText.toLowerCase().search(search_str) === -1 || '') {
        el.classList.add('hide');
      }
    })
  }
  if (!search_str && nation_str && !type_str && !level_str) {
    searchItems.forEach(el => {
      if (el.innerText.toLowerCase().search(nation_str) === -1 || '') {
        el.classList.add('hide');
      } else {
        el.classList.remove('hide');
      }
    })
  }
  if (!search_str && !nation_str && type_str && !level_str) {
    searchItems.forEach(el => {
      if (el.innerText.toLowerCase().search(type_str) === -1 || '') {
        el.classList.add('hide');
      } else {
        el.classList.remove('hide');
      }
    })
  }
  if (!search_str && !nation_str && !type_str && level_str) {
    searchItems.forEach(el => {
      if (+el.lastElementChild.innerHTML !== +level_str || '') {
        el.classList.add('hide');
      } else {
        el.classList.remove('hide');
      }
    })
  }
  if (search_str && nation_str && !type_str && !level_str) {
    searchItems.forEach(el => {
      if (el.innerText.toLowerCase().search(search_str) === -1
          || el.innerText.toLowerCase().search(nation_str) === -1
          || ''
      ) {
        el.classList.add('hide');
      } else {
        el.classList.remove('hide');
      }
    })
  }
  if (search_str && !nation_str && type_str && !level_str) {
    searchItems.forEach(el => {
      if (el.innerText.toLowerCase().search(search_str) === -1
        || el.innerText.toLowerCase().search(type_str) === -1
        || ''
      ) {
        el.classList.add('hide');
      } else {
        el.classList.remove('hide');
      }
    })
  }
  if (search_str && !nation_str && !type_str && level_str) {
    searchItems.forEach(el => {
      if (el.innerText.toLowerCase().search(search_str) === -1
        || +el.lastElementChild.innerHTML !== +level_str
        || ''
      ) {
        el.classList.add('hide');
      } else {
        el.classList.remove('hide');
      }
    })
  }
  if (!search_str && nation_str && !type_str && level_str) {
    searchItems.forEach(el => {
      if (el.innerText.toLowerCase().search(nation_str) === -1
        || +el.lastElementChild.innerHTML !== +level_str
        || ''
      ) {
        el.classList.add('hide');
      } else {
        el.classList.remove('hide');
      }
    })
  }
  if (!search_str && !nation_str && type_str && level_str) {
    searchItems.forEach(el => {
      if (el.innerText.toLowerCase().search(type_str) === -1
        || +el.lastElementChild.innerHTML !== +level_str
        || ''
      ) {
        el.classList.add('hide');
      } else {
        el.classList.remove('hide');
      }
    })
  }
  if (!search_str && nation_str && type_str && !level_str) {
    searchItems.forEach(el => {
      if (el.innerText.toLowerCase().search(type_str) === -1
        || el.innerText.toLowerCase().search(nation_str) === -1
        || ''
      ) {
        el.classList.add('hide');
      } else {
        el.classList.remove('hide');
      }
    })
  }
  if (!search_str && nation_str && type_str && level_str) {
    searchItems.forEach(el => {
      if (el.innerText.toLowerCase().search(type_str) === -1
        || el.innerText.toLowerCase().search(nation_str) === -1
        || +el.lastElementChild.innerHTML !== +level_str
        || ''
      ) {
        el.classList.add('hide');
      } else {
        el.classList.remove('hide');
      }
    })
  }
  if (search_str && nation_str && type_str && level_str) {
    searchItems.forEach(el => {
      if (el.innerText.toLowerCase().search(type_str) === -1
        || el.innerText.toLowerCase().search(search_str) === -1
        || el.innerText.toLowerCase().search(nation_str) === -1
        || +el.lastElementChild.innerHTML !== +level_str
        || ''
      ) {
        el.classList.add('hide');
      } else {
        el.classList.remove('hide');
      }
    })
  }
}


