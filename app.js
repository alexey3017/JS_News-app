// Функция ajax запроса
function customHttp() {
  return {
    get(url, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.addEventListener('load', () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });

        xhr.addEventListener('error', () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        xhr.send();
      } catch (error) {
        cb(error);
      }
    },
    post(url, body, headers, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', url);
        xhr.addEventListener('load', () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });

        xhr.addEventListener('error', () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        if (headers) {
          Object.entries(headers).forEach(([key, value]) => {
            xhr.setRequestHeader(key, value);
          });
        }

        xhr.send(JSON.stringify(body));
      } catch (error) {
        cb(error);
      }
    },
  };
}

// Инициализация модулей
const http = customHttp();
const newsService = (function (){
  const apiKey = '61f0e5c4c2fd41b098550a77a163b5cc'
  const apiUrl = 'http://newsapi.org/v2'

  return {
    topHeadlines(country = 'ru', category ='sports',cb){
      http.get(`${apiUrl}/top-headlines?country=${country}&category=${category}&apiKey=${apiKey}`,cb)
    },
    everything(query ,cb){
      http.get(`${apiUrl}/everything?q=${query}&apiKey=${apiKey}`,cb)
    }
  }
})()

//Элементы
const form = document.forms['newsControls']
const countySelect = form.elements['country']
const categorySelect = form.elements['category']
const searchInput = form.elements['search']

// Обработчики
form.addEventListener('submit', (e) => {
  e.preventDefault()
  loadNews()
})
document.addEventListener('DOMContentLoaded', (e) => {
  M.AutoInit();
  loadNews();
});

//Загружаем новости
function loadNews(){
  showLoader();

  const country = countySelect.value
  const category = categorySelect.value
  const searchText = searchInput.value

  if(!searchText){
    newsService.topHeadlines(country,category,onGetResponse)
  }
  else {
    newsService.everything(searchText,onGetResponse)
  }
}

//Получаем ответ сервера
function onGetResponse(err,res){
  removePreloader()
  if(err){
    showAlert(err,'error-msg')
    return
  }

  if(!res.articles.length){
    showMessage()
    return
  }

  renderNews(res.articles)
}

//Рендерим новости
function renderNews(news){
  const newsContainer = document.querySelector('.news-container .row')

  if(newsContainer.children.length){
    clearContainer(newsContainer)
  }

  let fragment = ''

  news.forEach( item =>{
   const el = newsTemplate(item)
    fragment += el
  })

  newsContainer.insertAdjacentHTML('afterbegin',fragment)
}

//Очищаем контейнер новостей
function clearContainer(container){
  let child = container.lastElementChild

  while (child){
    container.removeChild(child)
    child = container.lastElementChild
  }
}

//Создаем разметку новостей
function  newsTemplate({urlToImage,title,url,description}){
  return `
  <div class ="col s12">
   <div class="card">
    <div class="card-image">
       <img src="${urlToImage || getImg()}" alt="image">
       <span class="card-title">${title || ''}</span>
    </div>
    <div class="card-content">
       <p>${description || ''}</p>
    </div>
    <div class="card-action">
       <a href = "${url}">Подробнее</a>
    </div>
   </div>
  </div>
  `
}

//Показываем ошибки
function showAlert(msg,type = 'succes'){
  M.toast({html:msg,classes:type});
}

//Прелоадер
function showLoader(){
  document.body.insertAdjacentHTML('afterbegin',`
  <div class = "progress">
      <div class="indeterminate"></div>
  </div>
  `)
}

function removePreloader(){
  const loader = document.querySelector('.progress')

  if(loader){
    loader.remove()
  }
}

//Показываем сообщение Не найдено
function  showMessage(){
  const newsContainer = document.querySelector('.news-container .row')

  if(newsContainer.children.length){
    clearContainer(newsContainer)
  }

  let msg = 'По вашему запросу ничего не найдено'
  M.toast({html:msg});
}

//Картинка заглужка
function getImg(){
  return "http://placehold.jp/b0b0b0/c9cdd1/640x480.png?text=no%20photo"
}