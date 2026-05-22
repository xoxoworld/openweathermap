<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>초단기 예보</title>
    <link
      href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css"
      rel="stylesheet"
      integrity="sha384-sRIl4kxILFvY47J16cr9ZwB07vP4J8+LH7qKQnuqkuIAvNWLzeN8tE5YBujZqJLB"
      crossorigin="anonymous"
    />
    <link rel="stylesheet" href="css/datepicker.material.css" />
    <script src="datepicker.js"></script>
    <style>
      .alert {
        display: none;
      }
      .alert.active {
        display: block;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>초단기 예보</h1>
      <form action="" id="dateForm">
        <input type="text" id="datepicker" />
        <button>조회</button>
      </form>
      <table class="table table-hover">
        <thead>
          <tr>
            <th scope="col">발표일자</th>
            <th scope="col">시간</th>
            <th scope="col">온도</th>
            <th scope="col">습도</th>
          </tr>
        </thead>
        <tbody id="target">
          <!-- <tr>
            <td colspan="4">조회중입니다.</td>
          </tr> -->
        </tbody>
      </table>
      <div class="alert alert-primary" role="alert">A simple primary alert—check it out!</div>
    </div>
    <script>
      const dateForm = document.querySelector("#dateForm");
      const datePicker = document.querySelector("#datepicker");
      const target = document.querySelector("#target");
      let datepicker = new Datepicker("#datepicker", {
        // 1 days in the past
        min: (() => {
          let date = new Date();
          date.setDate(date.getDate() - 2);
          return date;
        })(),

        // today
        max: (() => {
          let date = new Date();
          date.setDate(date.getDate());
          return date;
        })(),
      });

      dateForm.addEventListener("submit", e => {
        e.preventDefault();
        console.log(datePicker.value); //2026. 5. 22. -->20260522
        let formatDate = datePicker.value
          .replace(/\./g, "") // .만 제거
          .trim() //앞뒤 공백 제거
          .split(/\s+/) //공백기준 배열 변환
          .map((v, i) => (i === 0 ? v : String(v).padStart(2, "0"))) //[2026,05,22]
          .join(""); // 20260522

        target.innerHTML = `<tr>
            <td colspan="4">조회중입니다.</td>
          </tr>`;

        console.log(formatDate); // 20260522
        inqueryShortTermWeather(formatDate);
      });

      function inqueryShortTermWeather(date) {
        fetch(
          `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst?serviceKey=jNu%2FUDr0Q2KYQ9rDGnLJqo4ahkjIQrHpn9wOnGbNXkmLqSFCj5rE6fYoLKFF1ELf5Yr4JDkQeCisuwGmsVfbOw%3D%3D&pageNo=1&numOfRows=1000&dataType=JSON&base_date=${date}&base_time=0500&nx=55&ny=127`,
        )
          .then(res => {
            console.log(res);
            if (!res.ok) {
              throw new Error("서버에 문제가 있습니다. 잠시후 다시 시도해주세요");
            }
            return res.json(); //json -> js object 변환, 다음 then으로 전달
          })
          .then(result => {
            console.log(result);
            let data = result.response?.body?.items?.item;
            console.log(data);
            if (!data || data.length === 0) {
              throw new Error("조회 결과가 없습니다.");
            }

            let t1hArr = data.filter(d => d.category === "TMP"); //온도
            let rehArr = data.filter(d => d.category === "REH"); //습도

            console.log(t1hArr);
            console.log(rehArr);
            let tableData = "";
            t1hArr.forEach((data, i) => {
              //데이터가 없으면 -
              let rehData = rehArr[i]?.fcstValue || "-";
              tableData += `<tr>
               <th scope="row">${data.baseDate}</th>
               <td>${data.fcstTime}</td>
               <td>${data.fcstValue}</td>      
               <td>${rehData}</td>      
             </tr>`;
            });
            target.innerHTML = tableData;
          })
          .catch(error => {
            console.log(error);
            showMessage(error);
          });
      }

      //인포창 띄우기 함수
      const alertBox = document.querySelector(".alert");

      function showMessage(msg) {
        alertBox.textContent = msg;
        alertBox.classList.add("active");
      }
    </script>
  </body>
</html>