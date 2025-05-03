
---

## 📘 IntersectionObserver + 무한 스크롤 관련 개념 정리

### 📌 `insertAdjacentHTML()`

```js
searchResult.insertAdjacentHTML("beforeend", makeHtml(album));
```

* `insertAdjacentHTML(position, htmlString)`은 **HTML 문자열을 지정한 위치에 추가하는 메서드**다.
* `position`은 다음 중 하나일 수 있어:

  * `"beforebegin"`: 대상 요소 **바깥 앞**
  * `"afterbegin"`: 대상 요소 **안쪽 앞**
  * `"beforeend"`: 대상 요소 **안쪽 뒤**
  * `"afterend"`: 대상 요소 **바깥 뒤**

> 위 예제에서는 `"beforeend"`를 사용하여, `searchResult` 안의 맨 **끝에 새 HTML**을 붙이고 있어.

---

### 📌 `IntersectionObserver`란?

* 브라우저에서 **요소가 화면(Viewport)에 들어오는지 감지**하는 기능.
* 주로 **무한 스크롤**, **지연 로딩(lazy loading)** 등에 활용돼.

```js
const observer = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting && !isLoading && hasMoreData) {
    fetchAlbums(currentPage);
  }
}, {
  rootMargin: "100px",
  threshold: 1.0
});
```

---

### 📌 `entries`는 뭘까?

* `entries`는 `IntersectionObserverEntry` 객체의 **배열**.
* 우리는 보통 `entries[0]`만 사용 (감시 대상이 하나일 때).

#### 주요 속성

| 속성명                  | 설명                     |
| -------------------- | ---------------------- |
| `target`             | 감시 중인 요소 (`sentinel`)  |
| `isIntersecting`     | 뷰포트에 **보이기 시작하면 true** |
| `intersectionRatio`  | 얼마나 보이는지 (0\~1)        |
| `boundingClientRect` | 대상 요소의 화면 내 위치/크기      |
| `intersectionRect`   | 실제로 보이는 부분의 크기         |
| `rootBounds`         | 관찰 기준 뷰포트의 크기          |
| `time`               | 이벤트 발생 시각 (ms)         |

---

### 📌 `isIntersecting`은 무슨 뜻?

* 감시 요소가 뷰포트 안에 **진입하면 true**
* 우리는 이 값을 이용해 “요소가 화면에 보이면 → 더 불러오기” 로직을 구현

---

### 📌 예시 흐름 (무한 스크롤):

1. 사용자가 검색하면 앨범을 10개 불러옴
2. 그 밑에 감시 대상 `<div id="sentinel">`을 붙임
3. 이 sentinel이 **화면에 보이면** → `fetchAlbums(currentPage)` 호출
4. 새 데이터를 아래에 추가 → sentinel도 같이 아래로 밀림
5. 스크롤을 계속 내리면 sentinel이 다시 보이고, 또 호출됨 → 무한 스크롤 완성!

---

---

#### 1. **API 응답 구조 예시**

* `fetchAlbums` 함수가 응답으로 받는 `Response.data` 구조를 예시로 보여주면 이해가 쉬움.

```json
{
  "results": {
    "albummatches": {
      "album": [
        {
          "name": "Album Name",
          "artist": "Artist Name",
          "url": "https://example.com/album",
          "image": [
            { "#text": "", size: "small" },
            { "#text": "https://imageurl.com", size: "medium" },
            ...
          ]
        },
        ...
      ]
    }
  }
}
```

* 이 구조를 안다면 오류 디버깅이나 커스터마이징이 쉬움.

---

#### 2. **rootMargin / threshold 차이 설명**

```js
{
  rootMargin: "100px",
  threshold: 1.0
}
```

* `rootMargin`: 뷰포트의 감지 범위를 **늘리거나 줄임**.

  * `"100px"`은 **화면 아래로 100px 남았을 때도 감지**하겠다는 뜻.
* `threshold`: **얼마나 보여야 감지할지** 비율.

  * `1.0`은 **전부 보여야** 감지됨.
  * 보통 무한 스크롤에서는 `0.1`이나 `0`을 많이 씀 → 더 부드럽게 작동함.

---

#### 3. **스크롤이 작동하지 않는 흔한 원인**

* `sentinel`이 너무 작거나, 위치가 잘못되었을 경우 감지가 안 됨.
* `observer.observe(sentinel)` 호출 타이밍이 **초기 렌더 전에** 일어나면 동작 안 함.

---

#### 4. **무한 스크롤 성능 최적화 팁**

* 데이터를 많이 불러올수록 브라우저 메모리 사용량 증가.

  * 일정 길이 넘어가면 `.removeChild()`로 이전 노드 삭제.
* `debounce` / `throttle`로 연속 호출 방지 가능.
* `axios` 실패 대비 재시도 로직, 중복 호출 방지 로직 추가하면 더 견고함.

---

#### 5. **에러 처리 고도화**

* 400 오류는 보통 잘못된 파라미터나 빠진 API 키에서 발생 → 이를 안내하는 메시지를 구체화.

```js
.catch((error) => {
  if (error.response && error.response.status === 400) {
    alert("검색어가 잘못되었거나, API 요청 형식이 잘못되었습니다.");
  } else {
    alert("알 수 없는 오류가 발생했습니다.");
  }
});
```

---
