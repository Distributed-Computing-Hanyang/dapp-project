let web3;
let user;

const mEthPrice = 1600;
const currentYear = 2022;

const contract_address = ""; // 따옴표 안에 주소값 복사 붙여넣기

const logIn = async () => {
  const ID = prompt("choose your ID");

  // 개발 시 (ganache)
  web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

  // 과제 제출 시 (metamask)
  // web3 = await metamaskRequest();

  user = await getAccountInfos(Number(ID));

  await _updateUserAddress(user);
  await _updateUserBalance(user);

  _updateRooms();
  _updateRents();
}

const json2abi = async (path) => {
  const response = await fetch(path);
  const abi = await response.json();
  return abi;
}

const metamaskRequest = async () => {
  // metamask request 
  if (window.ethereum != null) {
    web3 = new Web3(window.ethereum)
    try {
      // Request account access if needed
      await web3.eth.requestAccounts()
      // Acccounts now exposed
      if(await web3.eth.net.getId() !== 11155111) alert("change to Sepolia test network")
    } catch (error) {
      // User denied account access...
      alert("Access Denied")
    }
  }
  return web3;
}

const getAccountInfos = async (id) => {
  const account = await web3.eth.getAccounts().catch(e=> {
    console.log('getAccountError: ', e);
  });
  console.log(account);
  return account[id];
}

const getBalance = async (address) => {
  const balance = await web3.eth.getBalance(address).catch(e=> {
    console.log('getBalanceError: ', e);
  });
  console.log(balance);
  return web3.utils.fromWei(balance, 'ether');
}

const _updateUserAddress = async (address) => {
  document.getElementById("address").text = address;
}

const _updateUserBalance = async (address) => {
  document.getElementById("balanceAmount").text = await getBalance(address);
}

const _updateRooms = () => {
  displayAllRooms();
  listAllRooms();
}

const _updateRents = () => {
  displayMyRents();
  displayRoomHistory();
}

const getRoomShareContract = async () => {
  const abi = await json2abi("./abi.json");
  const RoomShare = new web3.eth.Contract(abi,contract_address)
  return RoomShare
}

let checkInDatedom;
let checkOutDatedom;
let roomsSelect;

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById('logIn').addEventListener("click", logIn);
  document.getElementById('rentRoom').addEventListener("click", rentRoom);
  document.getElementById('shareRoom').addEventListener("click", shareRoom);

  checkInDatedom = document.getElementById('checkInDate');
  checkOutDatedom = document.getElementById('checkOutDate');
  mEth2krwdom = document.getElementById('mEth2krw');
  pricedom = document.getElementById('price');

  checkInDatedom.addEventListener("input",()=>{
    const datevalformatted = checkInDatedom.value.replace(/(\d{4})(\d{2})(\d{2})|(\d{4})-(\d{2})(\d{2})/, "$1$4-$2$5-$3$6");
    checkInDatedom.value = datevalformatted;
  });

  checkOutDatedom.addEventListener("input",()=>{
    const datevalformatted = checkOutDatedom.value.replace(/(\d{4})(\d{2})(\d{2})|(\d{4})-(\d{2})(\d{2})/, "$1$4-$2$5-$3$6");
    checkOutDatedom.value = datevalformatted;

    const checkInDate = getDayOfYear(checkInDatedom.value);
    const checkOutDate = getDayOfYear(datevalformatted); 

    updateTotalPrice(checkInDate,checkOutDate);
  });

  pricedom.addEventListener("input",()=>{
    const methval = pricedom.value;
    mEth2krwdom.innerText = `${methval * mEthPrice} KRW`;
  });

  roomsSelect = document.getElementById("rooms-select");
  roomsSelect.addEventListener('change', displayRoomHistory);
	
//   선택적 구현
//   document.getElementById("InActive").addEventListener("click", () => {
//     const rId = document.getElementById("roomId").value;
//     markRoomAsInactive(rId)
//   });

//   document.getElementById("ClearAll").addEventListener("click", () => {
//     const rId = document.getElementById("roomId").value;
//     initializeRoomShare(rId)
//   });

});

const getDayOfYear = (date) => {
  const now = new Date(date);
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = (now - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
  const oneDay = 1000 * 60 * 60 * 24;
  const day = Math.floor(diff / oneDay);
  return day
}

function dateFromDay(year, day){
  var date = new Date(String(year), 0); // initialize a date in `year-01-01`
  return new Date(date.setDate(day)); // add the number of days
}

const shareRoom = async () => {
  const shareRoomForm = document.forms.shareRoom;
  const name = shareRoomForm.elements.name.value;
  const location = shareRoomForm.elements.location.value;
  const price = shareRoomForm.elements.price.value;

  await _shareRoom(name, location, price);

  await _updateUserBalance(user);
  _updateRooms();
}


const _shareRoom = async (name, location, price) => {
  // RoomShareContract의 shareRoom 함수를 호출한다.
  // 방 이름, 위치, 하루당 대여 요금을 입력하고 컨트랙트에 등록한다.
  // 에러 발생시 call 또는 send 함수의 파라미터에 from, gas 필드 값을 제대로 넣었는지 확인한다. (e.g. {from: ..., gas: 3000000, ...})
  // 트랜잭션이 올바르게 발생하면 알림 팝업을 띄운다. (e.g. alert("등록"))
  // 화면을 업데이트 한다.
}


const _getMyRents = async () => {
  // 내가 대여한 방 리스트를 불러온다.
  return myRents;
}


const displayMyRents = async () => {
  const myRents = await _getMyRents();
  let html = "";
  for(let i = 0; i < myRents.length; ++i) {
		html += "<tr>";
			html += "<td>" + myRents[i].id + "</td>"
			html += "<td>" + myRents[i].rId + "</td>"
			html += "<td>" + dateFromDay(myRents[i].yearOfRent,myRents[i].checkInDate).toDateString() + "</td>"
			html += "<td>" + dateFromDay(myRents[i].yearOfRent,myRents[i].checkOutDate).toDateString() + "</td>"
		html += "</tr>";
	}
	document.getElementById('myRents').innerHTML = html;
}

const _getAllRooms = async () => {
  // Room ID 를 기준으로 컨트랙트에 등록된 모든 방 객체의 데이터를 불러온다.
  return rooms;
}

const displayAllRooms = async () => {
  const allRooms = await _getAllRooms();
	let html = "";
	for(let i = 0; i < allRooms.length; ++i) {
		html += "<tr>";
      html += "<td>" + allRooms[i].id + "</td>"
      html += "<td>" + allRooms[i].name + "</td>"
      html += "<td>" + allRooms[i].location + "</td>"
      html += "<td>" + allRooms[i].isActive + "</td>"
      html += "<td>" + allRooms[i].price + "</td>"
      html += "<td>" + allRooms[i].owner.slice(0,7)+"..." + "</td>"
		html += "</tr>";
	}
	document.getElementById('allRooms').innerHTML = html;
}

const listAllRooms = async () => {
	const allRooms = await _getAllRooms();
	let html = "<option value=''>- Rooms Available -</option>";
	for(let i = 0; i < allRooms.length; ++i) {
    if(allRooms[i].isActive == false)
			continue;
    const jsonstr = JSON.stringify(allRooms[i]).replaceAll(" ","+");
		html += `<option value=${jsonstr}>`;
			html += allRooms[i].id + " | "
			html += allRooms[i].name + " | "
			html += allRooms[i].location.replaceAll("+"," ") + " | "
			html += allRooms[i].isActive + " | "
			html += allRooms[i].price + " | "
			html += allRooms[i].owner.slice(0,17)+"..."
		html += "</option>";
	}
  roomsSelect.innerHTML = html;
}

const returnOptionsJSON = () => {
  const obj = roomsSelect.options[roomsSelect.selectedIndex].value;
  if(obj) {
    const jsonobj = JSON.parse(obj);
    return jsonobj;
  }
}

const calculatePrice = (checkInDate,checkOutDate) => {
  const jsonobj = returnOptionsJSON();
  const price = Number(jsonobj.price);
  const _price = (checkOutDate-checkInDate)*price;
  return _price;
}

const updateTotalPrice = (checkInDate,checkOutDate) => {
  const _price = calculatePrice(checkInDate,checkOutDate);
  const totalfeedom = document.getElementById('totalfee');
  totalfeedom.innerText = `${_price * mEthPrice} KRW`;
}


const rentRoom = async () => {
  const checkInDate = getDayOfYear(checkInDatedom.value);
  const checkOutDate = getDayOfYear(checkOutDatedom.value); 

  const _price = calculatePrice(checkInDate,checkOutDate);
  const jsonobj = returnOptionsJSON();
  const roomId = jsonobj.id;

  await _rentRoom(roomId, currentYear, checkInDate, checkOutDate, _price);

  await _updateUserBalance(user);
  _updateRents();

}

const _rentRoom = async (roomId, currentYear, checkInDate, checkOutDate, price) => {
  // 체크인 날짜와 체크아웃 날짜의 차이, 하루당 대여 요금을 곱하여 컨트랙트로 송금한다. 
  // 대여가 성공하고 트랜잭션이 올바르면 알림 팝업을 띄운다.
  // 이더의 양이 맞지 않아서 트랜잭션이 종료되었을 경우에는 다른 팝업을 띄운다. (Solidity의 require과 관련됨)
  // 단위는 finney = milli Eth (10^15)
  // Room ID에 해당하는 방이 체크인하려는 날짜에 대여되어서 대여되지 않는다면 _recommendDate 함수를 호출한다.
  // 화면을 업데이트 한다.
}

const _recommendDate = async (roomId, checkInDate, checkOutDate) => {
  // Room ID에 해당하는 방이 체크인하려는 날짜에 대여되었다면,
  // 기존에 대여된 날짜가 언제부터 언제까지인지 알림 팝업으로 표시한다.
  // checkInDate <= 대여된 체크인 날짜 , 대여된 체크아웃 날짜 < checkOutDate
  // 체크아웃 날짜에는 퇴실하여야하며, 해당일까지 숙박을 이용하려면 체크아웃날짜는 그 다음날로 변경하여야한다.
  // 주어진 헬퍼 함수 dateFromDay 를 이용한다.
}


const getRoomRentHistory = async () => {
  // 선택된 방에 대해 그동안 대여했던 사람들의 목록(히스토리)을 불러온다.
  // 빈 배열을 만들고 주어진 헬퍼 함수 returnOptionsJSON 를 사용하여 선택된 방의 ID 값을 이용해 컨트랙트를 호출한다.
  // 헬퍼 함수 dateFromDay 를 이용한다.
  
  return history
}


const displayRoomHistory = async () => {
	const history = await getRoomRentHistory();
	let html = "";
	for(let i = 0; i < history.length; ++i) {
		html += "<tr>";
    html += "<td>" + history[i].id + "</td>"
    html += "<td>" + history[i].checkInDate + "</td>"
    html += "<td>" + history[i].checkOutDate + "</td>"
    html += "<td>" + history[i].renter.slice(0,12)+"..." + "</td>"
		html += "</tr>";
	}
	document.getElementById('roomHistory').innerHTML = html;
}

const markRoomAsInactive = async (_roomId) => {
  // optional 1: 예약 비활성화
  // 소유한 방 중에서 선택한 방의 대여 가능 여부를 비활성화 한다.
}

const intializeRoomShare = async (_roomId) => {
  // optional 2: 대여 초기화
  // 소유한 방 중에서 선택한 방의 대여된 일정을 모두 초기화 한다.
}
