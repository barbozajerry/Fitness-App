'use strict';  // always start with this 
const barchart = {
    init(elementId, width, height) {
        this.elementId = elementId;
        this.height = height;
        this.width = width;
        this.margin =  {
            left: 65,
            top: 20,
            right: 20,
            bottom: 65,
        }
        this.x = d3.scaleBand();
        this.y = d3.scaleLinear();
        this.svg = d3.select(`#${this.elementId}`)
                    .append('svg')
                    .attr('class', 'barchart')
                    .attr('viewBox', `0 0 
                            ${this.width + this.margin.left + this.margin.right} 
                            ${this.height + this.margin.top + this.margin.bottom}`);
    },

    render(dataset, xLabel, yLabel) {
        this.dataset = dataset;
        this.clear();
        this.adjustScales();
        this.renderLabels(xLabel, yLabel);
        this.renderBars();
        this.renderXAxis();
        this.renderYAxis();
    },

    clear() {
        this.svg.selectAll('*').remove();
        this.svgContent = this.svg
                            .append('g')
                            .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);
    },

    adjustScales() {
        this.x
            .domain(d3.map(this.dataset, (d) => d['date']))
            .range([0, this.width])
            .padding(0.2);
        this.y
            .domain([0, d3.max(this.dataset, (d) => d['value'])])
            .nice()
            .range([this.height, 0]);
    },

    renderLabels(xLabel, yLabel) {
        // Factors 2.75 and -15 are chosen empirically
        // We can also calculate the length and height of the strings when rendered
        // but it's much more cumbersome

        this.svg.append('g')
                .attr('transform', `translate(10 ${this.margin.top + (this.height)/2.75}) rotate(90)`)
                .append('text')
                .attr('class', 'barchart-x-axis-label')
                .text(xLabel)

        this.svg.append('g')
                .attr('transform', `translate(${this.margin.left + (this.width)/2.75} ${this.margin.top + this.height + this.margin.bottom - 15})`)
                .append('text')
                .attr('class', 'barchart-y-axis-label')
                .text(yLabel)
    },

    renderBars() {
        this.svgContent
        .append('g')
        .attr('class', 'barchart-content')
        .selectAll(".barchart-bar")
        .data(this.dataset)
        .join("rect")
        .transition()
        .duration(200)
        .attr('class', 'barchart-bar')
        .attr('x', (d) => this.x(d['date']))
        .attr('y', (d) => this.y(d['value']))
        .attr('width', this.x.bandwidth())
        .attr('height', (d) => this.y(0) - this.y(d['value']));
    },
    renderXAxis() {
        let xAxis = d3.axisBottom(this.x).tickFormat(d3.timeFormat('%a'))

        this.svgContent
            .append('g')
            .attr('class', 'barchart-x-axis')
            .attr('transform', `translate(0 ${this.height})`)
            .call(xAxis);  
    },
    renderYAxis() {
        let yAxis = d3.axisLeft(this.y)
        .ticks(5);
        
        this.svgContent
            .append('g')
            .attr('class', 'barchart-y-axis')
            .call(yAxis);  
    }
}

const data = [
    {
        'date': 1617624000000,
        'value': 3.2,
    },
    {
        'date': 1617710400000,
        'value': 4.5,
    },
    {
        'date': 1617796800000,
        'value': 0,
    },
    {
        'date': 1617883200000,
        'value': 1.2,
    },
    {
        'date': 1617969600000,
        'value': 3.4,
    },
    {
        'date': 1618056000000,
        'value': 5.4,
    },
    {
        'date': 1618142400000,
        'value': 3,
    },
]


// this is my code that i addded
// <------------------>

const closeButton = document.getElementById('close')
const viewProgressButton = document.getElementById('viewProgress')
const modal = document.getElementById('modal')
const dropdown = document.getElementById('dropdown')
const goButton = document.getElementById('go')
const dateTxt = document.getElementById('dateTxt')
const dateForPast = document.getElementById('fAct-date')
barchart.init('chart-anchor', 500, 300);

// tutor has to fix this 
dateForPast.addEventListener('change', function() {
  e.preventDefault()
  const newValue = e.target.value
  console.log(newValue, 'newval')
  dateForPast.value = newValue
})

// to open up the modal
viewProgressButton.addEventListener('click', function(){
    barchart.render(data, 'Kilometers Run', 'Day of the Week');
    modal.classList.remove('hide')
})

//close the modal
closeButton.addEventListener('click', function(){
    modal.classList.add('hide')
})

// change the dropdown option for type , example is run, swim etc
dropdown.addEventListener('change', function(e){
  e.preventDefault()
  const newValue = e.target.value
  dropdown.value = newValue
})

//change date in modal
dateTxt.addEventListener('change', function(e){
  e.preventDefault()
  const newValue = e.target.value
  console.log(newValue, 'newval')
  dateTxt.value = newValue
})


// fetch data from backend and put it inside of chart when click go
goButton.addEventListener('click', async function(){

  const getDate = dateTxt.value

  const type = dropdown.value
  console.log(type, 'type')

  const reqType = {type, getDate}


  const information = await fetch(`/data`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(reqType), 
  })
  .then(response => response.json())
  .then(data => {
    console.log('this is my data:', data);
    return data
  })
  .catch((error) => {
    console.error('Get data Error:', error);
  });

  const newData = information.data.map(ele => {
    return {date: ele.date, value: ele.amount}
  })

  console.log(newData, 'new')

  let unit

  if(type === 'Yoga' || type === 'Soccer' || type === 'Basketball'){
    unit = 'minutes'
  } else if (type === 'Run' ||  type === 'Bike' ||  type === 'Walk'){
    unit = 'Kilometers'
  }  else if(type === 'Swim') {
    unit = "laps"
  } 
  
  else {
    unit = 'units'
  }



  barchart.render(newData, unit, 'Day of the Week');

})




// <------------------>


/* Set default date in forms to current date */
document.getElementById('pAct-date').valueAsDate = newUTCDate()
document.getElementById('fAct-date').valueAsDate = newUTCDate()


/* Past Activity 'Add New Activity' Button - Show Form */
let add_past_activity_button = document.getElementById("addPastActivityButton")
add_past_activity_button.addEventListener("click", add_past_activity_onclick);

//REMINDER BOX 
document.getElementById("body").onload = async function() {remFun()};
// let rb =document.getElementById("rb")
// rb.addEventListener("load", remFun);
let yes= document.getElementById("Yes")
yes.addEventListener("click", yesFun);
let no= document.getElementById("No")
no.addEventListener("click", noFun);

/* Future Activity 'Add New Activity' Button - Show Form */
let add_future_activity_button = document.getElementById("addFutureActivityButton")
add_future_activity_button.addEventListener("click", add_future_activity_onclick);


/* Past Activity Form Dropdown */
let past_activity_dropdown = document.getElementById("pAct-activity")
past_activity_dropdown.addEventListener("change", past_activity_dropdown_onchange);


/* Past Activity 'Submit' Button - Submit Form */
let submit_past_activity_button = document.getElementById("submitPastActivityButton")
submit_past_activity_button.addEventListener("click", submit_past_activity_onclick);


/* Future Activity 'Submit' Button - Submit Form */
let submit_future_activity_button = document.getElementById("submitFutureActivityButton")
submit_future_activity_button.addEventListener("click", submit_future_activity_onclick)


/**
 * ONCLICK - Hide 'Add New Activity' Button under the Past Section and Show
 * Form to Add a Past Activity
 */
function add_past_activity_onclick() {
  /* Connect to Past Activity Sections */
  let pActAdd = document.getElementById("pAct-Add");
  let pActForm = document.getElementById("pAct-Form");

  /* Show Form, Hide 'Add New Activity' Button */
  pActAdd.classList.add("hide");
  pActForm.classList.remove("hide");
}


/**
 * ONCLICK - Hide 'Add New Activity' Button under the Future Section and Show
 * Form to Add a Future Activity
 */
function add_future_activity_onclick() {
  /* Connect to Past Activity Sections */
  let fActAdd = document.getElementById("fAct-Add");
  let fActForm = document.getElementById("fAct-Form");

  /* Show Form, Hide 'Add New Activity' Button */
  fActAdd.classList.add("hide");
  fActForm.classList.remove("hide");
}


/**
 * ONCHANGE - Automatically Change Units in Past Activty Form to accomodate the
 * selected Activity from the dropdown menu
 */
function past_activity_dropdown_onchange() {
  /* Connect to Past Activity Unit Input */
  let pActUnit = document.getElementById("pAct-unit");

  /* Show Form, Hide 'Add New Activity' Button */
  switch (past_activity_dropdown.value) {
    case 'Walk': case 'Run': case 'Bike':
      pActUnit.value = 'km';
      break;
    case 'Swim':
      pActUnit.value = 'laps';
      break;
    case 'Yoga': case 'Soccer': case 'Basketball':
      pActUnit.value = 'minutes';
      break;
    default:
      pActUnit.value = 'units';
  }
}


/**
 * ONCLICK - Validate Past Activity Form Contents, Send Data to Server, Remove
 * Form, and Display 'Add ...' Button with confirmation text above
 */
function submit_past_activity_onclick() {
  /* Connect to Past Activity Sections */
  let pActAdd = document.getElementById("pAct-Add");
  let pActForm = document.getElementById("pAct-Form");
  
  /* Activity Data to Send to Server */
  let data = {
    date: document.getElementById('pAct-date').value,
    activity: document.getElementById('pAct-activity').value,
    scalar: document.getElementById('pAct-scalar').value,
    units: document.getElementById('pAct-unit').value
  }

  if (!past_activity_form_is_valid(data)) {  
    alert("Invalid Past Activity. Please fill in the entire form.");
    return
  }

  /* Hide Form, Show 'Add New Activity' Button */
  pActAdd.classList.remove("hide");
  pActForm.classList.add("hide");
  
  /* Add 'p' tag above 'Add New Activity' Button */
  let newActivity = create_submission_success_element(   
    "Got it! ",
    `${data.activity} for ${data.scalar} ${data.units}. `,
    "Keep it up!"
  )
  insert_latest_response(pActAdd, newActivity)

  console.log('Past Activity Sending:', data);

  /* Post Activity Data to Server */
  // changing from /pastActivity to /store
  fetch(`/store`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data), // post body
  })
  .then(response => response.json())
  .then(data => {
    console.log('Past Activity Success:', data);
  })
  .catch((error) => {
    console.error('Past Activity Error:', error);
  });

 
  /* Reset Form */
  document.getElementById('pAct-date').valueAsDate = newUTCDate()
  document.getElementById('pAct-activity').value = "Walk"
  document.getElementById('pAct-scalar').value = ""
  document.getElementById('pAct-unit').value = "km"
}


/**
 * ONCLICK - Validate Future Activity Form Contents, Send Data to Server, Remove
 * Form, and Display 'Add ...' Button with confirmation text above
 */
function submit_future_activity_onclick() {
  /* Connect to Future Activity Sections */
  let fActAdd = document.getElementById("fAct-Add");
  let fActForm = document.getElementById("fAct-Form");
  
  /* Activity Data to Send to Server */
  let data = {
    date: document.getElementById('fAct-date').value,
    activity: document.getElementById('fAct-activity').value
  }
  
  /* Form Validation */
  if (!future_activity_form_is_valid(data)) {  
    alert("Invalid Future Plan. Please fill in the entire form.");
    return
  }

  /* Hide Form, Show 'Add New Activity' Button */
  fActAdd.classList.remove("hide");
  fActForm.classList.add("hide");

  /* Add 'p' tag above 'Add New Activity' Button  */
  let newActivity = create_submission_success_element(
    "Sounds good! Don't forget to come back to update your session for ",
    `${data.activity} on ${reformat_date(data.date)}`,
    "!"
  )
  insert_latest_response(fActAdd, newActivity)

  console.log('Future Plans Sending:', data);

  /* Post Activity Data to Server */
   // changing from /futureActivity to /store
  fetch(`/store`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data), // post body
  })
  .then(response => response.json())
  .then(data => {
    console.log('Future Plans Success:', data);
  })
  .catch((error) => {
    console.error('Future Plans Error:', error);
  });

  /* Reset Form */
  document.getElementById('fAct-date').valueAsDate = newUTCDate()
  document.getElementById('fAct-activity').value = "Walk"
}


/**
 * Create DOM element for acknowledgment message to send to user for submitting a form
 * @param {string} beg - regular starting section
 * @param {string} mid - bolded middle section
 * @param {string} end - regular trailing text
 * @returns {HTMLElement} DOM element combining beg, mid, end
 */
function create_submission_success_element(beg, mid, end) {
  /* Create all HTML elements to add */
  let newMessage = document.createElement('p')
  let baseText = document.createElement('span')
  let dynamicText = document.createElement('strong')
  let exclamationText = document.createElement('span')
  
  /* Update textContent of all generated DOM elements */
  baseText.textContent = beg
  dynamicText.textContent = mid
  exclamationText.textContent = end
  
  /* Append all text contents back to back in wrapper 'p' tag */
  newMessage.appendChild(baseText)
  newMessage.appendChild(dynamicText)
  newMessage.appendChild(exclamationText)

  return newMessage  
}


/**
 * Checks if past activity data is valid
 * @param {Object} data
 * @param {string} data.date - format 'mm-dd-yyyy'
 * @param {string} data.activity
 * @param {string} data.scalar - time or distance integer or float
 * @param {string} data.units - units for scalar value
 * @returns {boolean} Boolean represents if data is valid
 */
function past_activity_form_is_valid(data) {
  let date = new Date(data.date.replace('-','/'))
  if ( date != "Invalid Date" && date > newUTCDate()) {
    return false
  }

  return !(data.date == "" || data.activity == "" || data.scalar == "" || data.units == "" )
}


/**
 * Checks if future activity data is valid
 * @param {Object} data
 * @param {string} data.date
 * @param {string} data.activity
 * @returns {boolean} Boolean represents if data is valid
 */
function future_activity_form_is_valid(data) {
  let date = new Date(data.date.replace('-','/'))
  if ( date != "Invalid Date" && date < newUTCDate()) {
    return false
  }

  return !(data.date == "" || data.activity == "")
}


/**
 * Insert Prompt at the top of parent and remove old prompts
 * @param {HTMLElement} parent - DOM element 
 * @param {HTMLElement} child - DOM element
 */
function insert_latest_response(parent, child) {
  if(parent.children.length > 1) {
    parent.removeChild(parent.children[0])
  }
  parent.insertBefore(child, parent.childNodes[0])
}


/**
 * Convert 'yyyy-mm-dd' to 'mm/dd/yy'
 * @param {string} date 
 * @returns {string} same date, but reformated
 */
function reformat_date(date) {
  let [yyyy, mm, dd] = date.split("-");
  return `${mm}/${dd}/${yyyy.substring(2,4)}`
}


/**
 * Convert GMT date to UTC
 * @returns {Date} current date, but converts GMT date to UTC date
 */
function newUTCDate() {
  let gmtDate = new Date()
  return new Date(gmtDate.toLocaleDateString())
}

let activity="";
let date="";

//reminder function, called onload and deleted if ignored
async function remFun(){
  //new gets the message for reminder
  let newMessage = document.createElement('h12');
  let beg = document.createElement('span');
  let middle = document.createElement('span');
  let end = document.createElement('span');
  
//sees if there is a reminder
  fetch(`/reminder`).then(response => response.json())
  .then(data=>{
    //our error check is if activity=5, then no reminder, so we close reminder
  if(data.activity!=5){
    //if there is a reminder we add message and show it
    beg.textContent = "Did you ";
    end.textContent = " ?";
    middle.textContent =data.activity + " "
    +dayChecker(data.date) ;
   newMessage.appendChild(beg);
    newMessage.appendChild(middle);
   newMessage.appendChild(end);
    document.getElementById("remContent").appendChild(newMessage);
    document.getElementById("rb").style.display="flex";
    let gmtDate = new Date(data.date+86400000);
    date= new Date(gmtDate.toLocaleDateString());
    activity = activity+  data.activity;
  }else{
    remCloser();
  }
  })
  .catch((error) => {
    console.error('Future Plans Error:', error);
  });




}

//gets the day of week for reminder
function getDays(number){
 let daynum = new Date(number).getDay();
 let daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday","Sunday"];
 return daysOfWeek[daynum+1];
}

//gets the day of the week or yesterday for reminder
function dayChecker(number){
  let year=new Date().getFullYear();
  let month=new Date().getMonth();
  let day=new Date().getDate();
  var newDate= Math.floor(new Date(year, month, day).getTime());
  if((newDate-number)==86400000){
    return "yesterday";
  }else{
    return getDays(number);
  }
}

//when yes is clicked
function yesFun(){
remCloser();
add_past_activity_onclick();
document.getElementById('pAct-date').valueAsDate = date;
document.getElementById('pAct-activity').value =activity;
document.getElementById('pAct-unit').value =  getUnits(activity);

}

//when no is clicked
function noFun(){
remCloser();
}

//closes the reminder box
 function remCloser(){
  document.getElementById("rb").style.display="none";
 }

 function getUnits(activity){
   if(activity=="Walk"){
     return "km"
   }
   if(activity=="Run"){
     return "km"
   }
   if(activity=="Bike"){
     return "km"
   }
   if(activity=="Swim"){
     return "laps"
   }
   if(activity=="Yoga"){
     return "minutes"
   }
    if(activity=="Soccer"){
     return "minutes"
   }
    if(activity=="Basketball"){
     return "minutes"
   }
  

 }


