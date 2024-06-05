document
  .getElementById("tickerInput")
  .addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {
      event.preventDefault();
      document.getElementById("myBTN").click();
    }
  });

var tForm = document.getElementById("tickerForm");
var ticker = tForm.elements[0].value.toUpperCase();
var underlyingPrice = 0;

async function getDates() {
  const api_url =
    "https://api.tdameritrade.com/v1/marketdata/chains?apikey=4WGUBOZHWUSYEMPL9NPVT9QM7GJO1TDQ&symbol=" +
    ticker +
    "&strikeCount=1&fromDate=2024-05-31&toDate=2024-10-31";
  const response = await fetch(api_url);
  const data = await response.json();
  underlyingPrice = data["underlyingPrice"];
  var addDatesCode = "";
  for (var key in data["callExpDateMap"]) {
    var tempDate = key.substring(0, key.indexOf(":"));
    addDatesCode +=
      '<input type="radio" name="dateRB" value="' +
      key +
      '">' +
      tempDate +
      "<br>";
  }
  document.getElementById("dates").innerHTML += addDatesCode;
  document.getElementById("underlying").innerHTML +=
    "Underlying Price: " + underlyingPrice.toFixed(2);
  document.getElementById("underlying").style.display = "block";
}

async function getContracts(cp, date) {
  const api_url =
    "https://api.tdameritrade.com/v1/marketdata/chains?apikey=4WGUBOZHWUSYEMPL9NPVT9QM7GJO1TDQ&symbol=" +
    ticker +
    "&strikeCount=120&fromDate= " +
    date.substring(0, date.indexOf(":")) +
    "&toDate=" +
    date.substring(0, date.indexOf(":")) +
    "&contractType=" +
    cp;
  const response = await fetch(api_url);
  const contractsData = await response.json();

  if (cp == "CALL") {
    addContracts(contractsData["callExpDateMap"][date], cp);
  } else {
    addContracts(contractsData["putExpDateMap"][date], cp);
  }
}

var changed = false;
var phase = 0;
var checkedCP = "";
function submit() {
  var x = document.getElementById("dates");
  if (x.style.display == "none") {
    x.style.display = "block";
  }

  if (ticker != tForm.elements[0].value.toUpperCase()) {
    changed = true;
    ticker = tForm.elements[0].value.toUpperCase();
  } else {
    changed = false;
  }

  if (changed == true) {
    phase = 0;
    document.getElementById("dates").innerHTML =
      '<label for="dates">Dates:</label><br>';
    document.getElementById("contracts").innerHTML =
      '<label for="contracts">CONTRACTS</label><br>';
    document.getElementById("underlying").innerHTML = "";
    getDates();
  }

  var CPradios = document.getElementsByName("CP");
  var datesRadios = document.getElementsByName("dateRB");

  for (var i = 0, length = CPradios.length; i < length; i++) {
    if (CPradios[i].checked) {
      checkedCP = CPradios[i].value;
      break;
    }
  }

  for (var i = 0, length = datesRadios.length; i < length; i++) {
    if (datesRadios[i].checked) {
      if (checkedCP == "call") {
        getContracts("CALL", datesRadios[i].value);
      } else {
        getContracts("PUT", datesRadios[i].value);
      }
      break;
    }
  }
}

function percIncrease(a, b) {
  let percent;
  if (b !== 0) {
    if (a !== 0) {
      percent = ((b - a) / a) * 100;
    } else {
      percent = b * 100;
    }
  } else {
    percent = -a * 100;
  }
  return Math.floor(percent);
}

function addContracts(data, cp) {
  document.getElementById("contracts").style.display = "block";
  var targ = tForm.elements[3].value;
  var addContractsCode = "";
  for (var item in data) {
    for (var item1 in data[item][0]) {
      if (item1 == "bid") {
        var bid = data[item][0][item1];
      }
      if (item1 == "ask") {
        var ask = data[item][0][item1];
      }
      if (item1 == "strikePrice") {
        var strike = data[item][0][item1];
      }
    }
    var mid = (bid + ask) / 2;
    if (targ > strike) {
      var percentGain = percIncrease(mid, targ - strike);
      if (percentGain<100){
        continue;
      }
      if (cp == "CALL") {
        addContractsCode +=
          "<label>" +
          strike +
          "c </label>   " +
          bid +
          "   " +
          ask +
          "   Return: " +
          percentGain +
          "% <br>";
      } else {
        addContractsCode +=
          "<label>Strike: " +
          strike +
          "p </label>" +
          "<br>" +
          "Bid: " +
          bid +
          "<br>" +
          "Ask: " +
          ask +
          "<br>Return: " +
          percentGain +
          "% <br>";
      }
    } else {
      //percentGain = percIncrease(mid, strike-targ);
    }
  }
  document.getElementById("contracts").innerHTML += addContractsCode;
  phase = 1;
}

function datesPhase() {}
