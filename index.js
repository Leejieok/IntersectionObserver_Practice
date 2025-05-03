const inputTag = document.querySelector(".search-box__input");
const searchResult = document.querySelector(".search-result");
const searchBtn = document.querySelector(".search-box__button");
const sentinel = document.createElement("div"); // 감시 대상
sentinel.id = "sentinel";
searchResult.appendChild(sentinel);

const API_URL = "http://ws.audioscrobbler.com/2.0/";
const API_KEY = "0222b230143d82f99a931ff36d86654e";

let currentPage = 1;
let isLoading = false;
let hasMoreData = true;
let currentKeyword = "";

const makeHtml = function (album) {
  const artist = album.artist;
  const albumName = album.name;
  const imageUrl = album.image[1]["#text"];
  const loader = `
    <a href="${album.url}" style="text-decoration: none; color: inherit;">
      <div class="search-result__card">
        <img src="${imageUrl}" alt="${albumName}">
        <div class="search-result__text">
          <h2>${artist}</h2>
          <p>${albumName}</p>
        </div>
      </div>
    </a>
  `;
  return loader;
};

const fetchAlbums = function (page = 1, limit = 10) {
  // if (!keyword || isLoading || !hasMoreData) return;

  isLoading = true;

  return axios
    .get(API_URL, {
      params: {
        method: "album.search",
        api_key: API_KEY,
        album: currentKeyword,
        format: "json",
        limit: limit,
        page: page,
      },
    })
    .then((Response) => {
      const albums = Response.data.results.albummatches.album;

      if (albums.length === 0 && page === 1) {
        searchResult.innerHTML = "<p>검색 결과가 없습니다.</p>";
        hasMoreData = false;
        return;
      }

      // 첫 페이지면 기존 결과 제거
      if (page === 1) {
        searchResult.innerHTML = "";
        searchResult.appendChild(sentinel); // sentinel 다시 붙이기
      }

      // .insertAdjacentHTML()은 HTML 문자열을 DOM에 삽입하는 메서드
      // "beforeend" -> element 안쪽 가장 뒤에 삽입 (자식 요소로)
      albums.forEach((album) => {
        // searchResult 가장 뒤쪽에 makeHtml이 삽입
        searchResult.insertAdjacentHTML("beforeend", makeHtml(album));
      });

      // sentinel을 항상 맨 아래에 위치시키기
      searchResult.appendChild(sentinel);

      // 다음 페이지에 데이터가 없을 수도 있음
      if (albums.length < limit) {
        hasMoreData = false; // 다음 페이지 없음
        observer.unobserve(sentinel); // 더 이상 감지 안 함
      }

      currentPage++;
    })
    .catch((error) => {
      alert("잠시 후 다시 시도해주세요.");
      console.log(error);
    })
    .finally(() => {
      isLoading = false;
    });
};

// 검색 버튼 클릭 시
searchBtn.addEventListener("click", () => {
  const keyword = inputTag.value.trim();
  if (!keyword) return;

  currentKeyword = keyword;
  currentPage = 1;
  hasMoreData = true;
  isLoading = false;

  fetchAlbums(currentPage);
  observer.observe(sentinel);
});

// Intersertion Observer로 sentinel 감시
const observer = new IntersectionObserver(
  (entries) => {
    if (entries[0].isIntersecting && !isLoading && hasMoreData) {
      console.log(entries);
      fetchAlbums(currentPage);
    }
  },
  {
    rootMargin: "100px",
    threshold: 1.0,
  }
);
