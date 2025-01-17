if(!localStorage.getItem('token')){
  window.location = '/login.html'
} else {
  var locationUser = {}
  var token = localStorage.getItem('token')
  var host = "http://localhost:3000/"
  var doneTask = []
  var warningTask = []
  var saveTask = []
  var dangerTask = []
  var allTask = []
  var groups = []
  var invitations = []
  var currentGroup = false
  var currentInv = ''
  $("#chooseGroup").hide()
  $("#btnplaceholder").hide()
  $("#success").empty()
  $("#error").empty()
  if (navigator.geolocation) {
    console.log('Geolocation is supported!');
  }
  else {
    console.log('Geolocation is not supported for this Browser/OS.');
  }
}

function getLocation() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(function(position) {
        locationUser.lat = position.coords.latitude;
        locationUser.long = position.coords.longitude;
        const coordinate = locationUser.lat+ ',' + locationUser.long
        if(locationUser.lat && locationUser.long) {
          resolve(coordinate)
        } else {
          reject('cannot get location')
        }
    });
  })
}

function searchNearby(query) {
  getLocation()
    .then(location => {
      $.ajax({
        method : "GET",
        url : `${host}places/${query}/${location}`
      })
      .done(response => {
        let places = response.data.results
        places.splice(0,10)
        console.log(places)
        $("#placeList").empty()
        $.each(places, function(index, value) {
          $("#placeList")
          .append(`<div class="card content bg-primary mb-2 text-white mt-2">
              <div class="card-header"><h5 class="card-title">${value.name}</h5></div>
              <div class="card-body">

                <h5 style="display:none">${value.name}</h5>
                <p class="card-subtitle mb-2">Address : ${value.formatted_address}</h6>
                <p class="desc card-text">Rating : ${value.rating}</p>
                <button type="button" class="addPlaces btn btn-light" mr-3 btn btn-light" data-toggle="modal" data-target="#addPlaceModal">
                  Add To Task
                </button>
              </div>
            </div>`)
        })
      })
      .fail(err => {
        console.log(err)
      })
    })
    .catch(err => {
      console.log('failed to get places', err)
    })
}

function onLoad() {
  gapi.load('auth2', function () {
    gapi.auth2.init();
  })
}

$(function(){
    var dtToday = new Date();

    var month = dtToday.getMonth() + 1;
    var day = dtToday.getDate();
    var year = dtToday.getFullYear();
    if(month < 10)
        month = '0' + month.toString();
    if(day < 10)
        day = '0' + day.toString();

    var maxDate = year + '-' + month + '-' + day;
    $('#date').attr('min', maxDate);
    $('#updateDate').attr('min', maxDate);
    $('#dateTaskGroup').attr('min', maxDate);
})

function createTask(task) {
    $.ajax({
      method: 'POST',
      url: host + 'tasks',
      data: {
        name : task.name,
        description : task.description,
        deadline : task.deadline,
        status : task.status
      },
      headers: {
        token : token
      }
    })
    .done(response => {
      console.log(response)
      showMyTask()
      resetAllForm()
      $("#success").append(`<div class="alert alert-success alert-dismissible fade show" role="alert">
        <strong>Success creating task</strong>.
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>`)
    })
    .fail(err => {
      console.log(err)
      resetAllForm()
      $("#error").append(`<div class="alert alert-warning alert-dismissible fade show" role="alert">
        <strong>Creating task failed</strong>.
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>`)
    })
}

function createTaskToGroup(task) {
    $.ajax({
      method: 'POST',
      url: host + 'groups/' + currentGroup,
      data: {
        name : task.name,
        description : task.description,
        deadline : task.deadline,
        status : task.status
      },
      headers: {
        token : token
      }
    })
    .done(response => {
      console.log(response)
      showMyGroupTask(currentGroup)
      resetAllForm()
      $("#success").append(`<div class="alert alert-success alert-dismissible fade show" role="alert">
        <strong>Success creating task</strong>.
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>`)
    })
    .fail(err => {
      console.log(err)
      resetAllForm()
      $("#error").append(`<div class="alert alert-warning alert-dismissible fade show" role="alert">
        <strong>Creating task failed</strong>.
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>`)
    })
}

function createGroup(name) {
    $.ajax({
      method: 'POST',
      url: host + 'groups',
      data: {
        name : name
      },
      headers: {
        token : token
      }
    })
    .done(response => {
      console.log(response)
      showMyTask()
      resetAllForm()
      getMyGroupList()
      resetAllForm()
      console.log(response)
      $("#success").append(`<div class="alert alert-success alert-dismissible fade show" role="alert">
        <strong>Success creating Group</strong>.
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>`)
    })
    .fail(err => {
      console.log(err)
      resetAllForm()
      $("#error").append(`<div class="alert alert-warning alert-dismissible fade show" role="alert">
        <strong>Create Group Failed</strong>
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>`)
    })
}

function resetAllForm() {
  $("#name").val('')
  $("#desc").val('')
  $("#status").val('')
  $("#date").val('')
  $("#nameUpdate").val('')
  $("#descUpdate").val('')
  $("#statusUpdate").val('')
  $("#dateUpdate").val('')
  $("#groupName").val('')
  $('#inviteEmail').val('')
}

function getTask (url) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url : url,
      method : "GET",
      headers : {
        token : localStorage.getItem("token")
      }
    })
    .done((response) => {
      resolve(response)
    })
    .fail((err) => {
      reject(err)
    })
  })
}

function dayCounter(deadline, status) {
  let deadlineDay = deadline.slice(8,10)
  let deadlineMonth = deadline.slice(5,7)
  let deadlineYear = deadline.slice(0,4)
  let today = new Date().getDate()
  let currentMonth =  new Date().getMonth() + 1
  let currentYear = new Date().getFullYear()

  if(deadlineDay[0] == 0) {
    deadlineDay = deadlineDay[1]
  }
  if(deadlineMonth[0] == 0) {
    deadlineMonth = deadlineMonth[1]
  }
  if(status == 'working') {
    if(Number(deadlineYear) > currentYear) {
      return 'info'
    } else if (Number(deadlineMonth) > currentMonth) {
      return 'info'
    } else if (Number(deadlineDay) - today <= 2) {
      return 'danger'
    } else if (Number(deadlineDay) - today <= 6) {
      return 'warning'
    } else {
      return 'info'
    }
  } else {
    return 'success'
  }

}

function showMyTask() {
  $("#addTaskGroup").hide()
  getTask(`${host}tasks`)
  .then(data => {
    data.reverse()
    allTask = data
    saveTask = []
    warningTask = []
    dangerTask = []
    doneTask = []
    $("#taskContainer").text(`Task List`)
    $("#toDoList").empty()
    $.each(data, (index, value) => {
      let condition = (dayCounter(value.deadline, value.status))
      if(condition == 'info') {
        saveTask.push(value)
      } else if (condition == 'warning') {
        warningTask.push(value)
      } else if (condition == 'danger') {
        dangerTask.push(value)
      } else if (condition == 'success') {
        doneTask.push(value)
      }
      $("#toDoList")
      .append(`<div class="card content bg-${condition} mb-2 text-white">
              <div class="card-header"><h5 class="card-title">${value.name}</h5></div>
              <div class="card-body">
                <p class="card-subtitle mb-2">Deadline: ${value.deadline.slice(0,10)}</h6>
                <p class="desc card-text">Description : ${value.description}</p>
                <button type="button" id="${value._id}" class="updateTask mr-3 btn btn-light" data-toggle="modal" data-target="#exampleModalCenter">
                  Update
                </button>
                <a href="#" onclick="return confirm('Are you sure you want to delete this item?');" class="card-link delete btn btn-light" id="${value._id}">Delete</a>
              </div>
            </div>`)
    })
  })
  .catch(err => {
    console.log(err)
  })
}

function deleteTask(id) {
  $.ajax({
    url : `${host}tasks/${id}`,
    method : "DELETE",
    headers : {
      'token' : token
    }
  })
  .done((response) => {
    console.log(response);
    showMyTask()
    $("#success").append(`<div class="alert alert-success alert-dismissible fade show" role="alert">
      <strong>Success delete task</strong>.
      <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>`)
  })
  .fail(err => {
    console.log(err);
    $("#error").append(`<div class="alert alert-warning alert-dismissible fade show" role="alert">
      <strong>Delete task failed</strong>.
      <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>`)
  })
}

function updateTask(task) {
  $.ajax({
    url : `${host}tasks/` + $("#taskId").val(),
    method : "PUT",
    headers : {
      token : localStorage.getItem("token")
    },
    data : {
      name : $("#nameUpdate").val(),
      description : $("#descUpdate").val(),
      status : $("#statusUpdate").val(),
      deadline : $("#dateUpdate").val()
    }
  })
  .done((response) => {
    console.log(response);
    //location.reload(true);
    showMyTask()
    $("#success").append(`<div class="alert alert-success alert-dismissible fade show" role="alert">
      <strong>Success Updating Task</strong>.
      <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>`)
  })
  .fail(err => {
    console.log(err);
    $("#error").append(`<div class="alert alert-warning alert-dismissible fade show" role="alert">
      <strong>Update task failed</strong>.
      <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>`)
  })
}

function updateTaskGroup() {
  $.ajax({
    url : `${host}groups/${currentGroup}/` + $("#taskIdGroup").val(),
    method : "PUT",
    headers : {
      token : localStorage.getItem("token")
    },
    data : {
      name : $("#nameUpdateGroup").val(),
      description : $("#descUpdateGroup").val(),
      status : $("#statusUpdateGroup").val(),
      deadline : $("#dateUpdateGroup").val()
    }
  })
  .done((response) => {
    console.log(response);
    showMyGroupTask(currentGroup)
    $("#success").append(`<div class="alert alert-success alert-dismissible fade show" role="alert">
      <strong>Success Updating Task</strong>.
      <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>`)
  })
  .fail(err => {
    showMyGroupTask(currentGroup)
    console.log(err);
    $("#error").append(`<div class="alert alert-warning alert-dismissible fade show" role="alert">
      <strong>Update task failed</strong>.
      <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>`)
  })
}

function getMyGroupList() {
  return new Promise((resolve, reject) => {
    $.ajax({
      method: 'GET',
      url: `${host}users/groups`,
      headers: {
        token : token
      }
    })
    .done(groupList => {
      groups = groupList
      if(groups.length > 0){
        $("#chooseGroup").show()
      }
      $("#groupPick").empty()
      $.each(groups, function(index, value) {
        $("#groupPick").append(`<option value="${value._id}">${value.name}</option>`)
      })
      console.log(groups)
      resolve()
    })
    .fail(err => {
      console.log(err)
      reject(err)
    })
  })
}

function getMyInvList() {
  return new Promise((resolve, reject) => {
    $.ajax({
      method: 'GET',
      url: `${host}users/invitation`,
      headers: {
        token : token
      }
    })
    .done(data => {
      invitations = data
      console.log(invitations)
      $("#invitationList").empty()
      $.each(data, function(index, value) {
        $("#invitationList").append(`<option value="${value._id}">${value.group.name} - ${value.sender.email}</option>`)
      })
      console.log(data)
      resolve()
    })
    .fail(err => {
      console.log(err)
      reject(err)
    })
  })
}

function changeInvitationStatus(id, stat) {
  $.ajax({
    method: 'PATCH',
    url: `${host}users/invitation/${id}`,
    data: {
      status: stat
    },
    headers: {
      token
    }
  })
  .done(response => {
    console.log(response)
    if (response.msg == 'join group success') {
      $("#success").append(`<div class="alert alert-success alert-dismissible fade show" role="alert">
        <strong>You successfully joined this group</strong>.
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>`)
    } else if (response.msg == 'decline group invitation success') {
      $("#success").append(`<div class="alert alert-success alert-dismissible fade show" role="alert">
        <strong>Reject invitation success</strong>.
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>`)
    } else {
      alert('Oops SOmething went wrong...')
    }
    getMyInvList()
    getMyGroupList()
  })
  .fail(err => {
    console.log(err)
    $("#error").append(`<div class="alert alert-warning alert-dismissible fade show" role="alert">
      <strong>Failed to join group</strong>.
      <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>`)
  })
}

function showMyGroupTask(id) {
  getTask(`${host}groups/${id}`)
    .then(tasks => {
      console.log(tasks)
      tasks.reverse()
      allTask = tasks
      saveTask = []
      warningTask = []
      dangerTask = []
      doneTask = []
      $("#toDoList").empty()
      $.each(tasks, function(index, value) {
        let condition = (dayCounter(value.deadline, value.status))
        if(condition == 'info') {
          saveTask.push(value)
        } else if (condition == 'warning') {
          warningTask.push(value)
        } else if (condition == 'danger') {
          dangerTask.push(value)
        } else if (condition == 'success') {
          doneTask.push(value)
        }
        $("#toDoList")
          .append(`<div class="card content bg-${condition} mb-2 text-white">
                  <div class="card-header"><h5 class="card-title">${value.name}</h5></div>
                  <div class="card-body">
                    <p class="card-subtitle mb-2">Deadline: ${value.deadline.slice(0,10)}</h6>
                    <p class="desc card-text">Description : ${value.description}</p>
                    <button type="button" id="${value._id}" class="updateTaskGroup mr-3 btn btn-light" data-toggle="modal" data-target="#editTaskGroupModal">
                      Update
                    </button>
                  </div>
                </div>`)
      })
    })
    .catch(err => {
      console.log(err)
    })
}

function inviteUserToGroup(email) {
  $.ajax({
    method : 'POST',
    url : `${host}groups/${currentGroup}/invite`,
    headers : {
      token : token
    },
    data : {
      email : email
    }
  })
  .then(response => {
    resetAllForm()
    console.log(response)
    $("#success").append(`<div class="alert alert-success alert-dismissible fade show" role="alert">
      <strong>${response.msg}</strong>.
      <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>`)
  })
  .catch(err => {
    resetAllForm()
    console.log('err', typeof err.responseText)
    $("#error").append(`<div class="alert alert-warning alert-dismissible fade show" role="alert">
      <strong>${err.responseText}</strong> You should check in your invitation email input.
      <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>`)
  })
}

$(document).ready(function() {
  function initUserPage() {
      $("#displaySuccess").hide();
      $("#displayError").hide();
      $(".signOut").show();
      $("#userContent").show();
      showMyTask()
      getMyGroupList()
      getMyInvList()
      $("#btnplaceholder").hide()
      searchNearby('mall')
  }
  onLoad()
  initUserPage()
  $(".signOut").click((e) => {
    var auth2 = gapi.auth2.getAuthInstance();
      auth2.signOut().then(function () {
        console.log('User signed out.');
      });
    localStorage.removeItem('token')
    window.location = '/index.html'
  })

  $("#searchNearbyPlace").click((e) => {
    let place = $("#typeList").val()
    searchNearby(place)
  })

  $("#addTask").click((e) => {
    e.preventDefault()
    const task = {
      name : $("#name").val(),
      description : $("#desc").val(),
      status : $("#status").val(),
      deadline : $("#date").val()
    }
    createTask(task)
  })

  $("#filterButton").click((e) => {
    const statusFilter = $("#statusFilter").val()
    if(statusFilter == 'all') {
      if(!currentGroup) {
        showMyTask()
      } else {
        showMyGroupTask(currentGroup)
      }
    } else {
      $("#toDoList").empty()
      let data = []
      let condition = ''
      if(statusFilter == 'done') {
        data = doneTask
        condition = 'success'
      } else if (statusFilter == 'save') {
        data = saveTask
        condition = 'info'
      } else if (statusFilter == 'danger') {
        data = dangerTask
        condition = 'danger'
      } else if (statusFilter == 'warning') {
        data = warningTask
        condition = 'warning'
      }
      $.each(data, (index, value) => {
        $("#toDoList")
        .append(`<div class="card content bg-${condition} mb-2 text-white">
                <div class="card-header"><h5 class="card-title">${value.name}</h5></div>
                <div class="card-body">
                  <p class="card-subtitle mb-2">Deadline: ${value.deadline.slice(0,10)}</h6>
                  <p class="desc card-text">Description : ${value.description}</p>
                  <button type="button" id="${value.id}" class="updateTask mr-3 btn btn-light" data-toggle="modal" data-target="#exampleModalCenter">
                    Update
                  </button>
                  <a href="#" onclick="return confirm('Are you sure you want to delete this item?');" class="card-link delete btn btn-light" id="${value.id}">Delete</a>
                </div>
              </div>`)
      })
    }
  })

  $("#toDoList")
    .on('click', '.delete', event => {
      const id = $(event.currentTarget).attr('id');
      deleteTask(id)
    })

  $("#toDoList")
    .on('click', '.updateTask', event => {
      const id = $(event.currentTarget).attr('id');
      let currentTask = allTask.filter(data => data._id === id)
      currentTask = currentTask[0]
      currentTask.deadline = currentTask.deadline.slice(0,10)
      $("#taskId").val(id)
      $("#nameUpdate").val(currentTask.name)
      $("#descUpdate").val(currentTask.description)
      $("#statusUpdate").val(currentTask.status)
      $("#dateUpdate").val(currentTask.deadline)
    })

  $("#toDoList")
    .on('click', '.updateTaskGroup', event => {
      const id = $(event.currentTarget).attr('id')
      let currentTask = allTask.filter(data => data._id === id)
      currentTask = currentTask[0]
      currentTask.deadline = currentTask.deadline.slice(0,10)
      $("#taskIdGroup").val(id)
      $("#nameUpdateGroup").val(currentTask.name)
      $("#descUpdateGroup").val(currentTask.description)
      $("#statusUpdateGroup").val(currentTask.status)
      $("#dateUpdateGroup").val(currentTask.deadline)
    })

  $("#placeList")
    .on('click', '.addPlaces', event => {
      const address = $(event.currentTarget).prevAll('.card-subtitle').text()
      const title = 'Goes to ' + $(event.currentTarget).prevAll('h5').text()
      let name = $("#placeName").val(title)
      let description = $("#placeDesc").val(address)

    })

//here
  $("#clickAddPlace").click((e) => {
      console.log('asd')
      let task = {
        name : $("#placeName").val(),
        description : $("#placeDesc").val(),
        deadline : $("#placeDate").val(),
        status : $("#placeStatus").val()
      }
      if(!currentGroup) {
        createTask(task)
      } else {
        createTaskToGroup(task)
      }
  })

  $("#clickUpdate").click((e) => {
      e.preventDefault();
      updateTask()
    })

  $("#clickUpdateGroup").click((e) => {
      e.preventDefault();
      updateTaskGroup()
    })

  $("#createGroupButton").click((e) => {
    let name = $("#groupName").val()
    createGroup(name)
  })

  $("#ownButton").click((e) => {
    currentGroup = false
    showMyTask()
    $("#btnplaceholder").hide()
  })

  $("#chooseGroup").click((e) => {
    e.preventDefault()
    const groupId = ($("#groupPick").val())
    currentGroup = groupId
    const groupName = groups.filter(data => data._id == currentGroup)
    $("#taskContainer").text(`${groupName[0].name} Task List`)
    $("#btnplaceholder").show()
    showMyGroupTask(groupId)
  })

  $("#createTaskToGroup").click((e) => {
    // e.preventDefault()
    let task = {
      name : $("#nameTaskGroup").val(),
      description : $("#descTaskGroup").val(),
      status : $("#statusTaskGroup").val(),
      deadline : $("#dateTaskGroup").val()
    }
    createTaskToGroup(task)
  })

  $('#inviteGroupButton').click((e) => {
    let email = $("#inviteEmail").val()
    inviteUserToGroup(email)
    //console.log(email)
  })

  $("#acceptInv").click((e) => {
    changeInvitationStatus($("#invitationList").val(), 'accepted')
  })

  $("#search").keyup((e) => {
    let searchTask = $("#search").val()
    $("#toDoList").empty()
    let filtered = allTask.filter(data => data.name.includes(searchTask))
    if (!currentGroup) {
      $("#btnplaceholder").hide()
      $.each(filtered, (index, value) => {
        let condition = (dayCounter(value.deadline, value.status))
        $("#toDoList")
          .append(`<div class="card content bg-${condition} mb-2 text-white">
                  <div class="card-header"><h5 class="card-title">${value.name}</h5></div>
                  <div class="card-body">
                    <p class="card-subtitle mb-2">Deadline: ${value.deadline.slice(0,10)}</h6>
                    <p class="desc card-text">Description : ${value.description}</p>
                    <button type="button" id="${value._id}" class="updateTask mr-3 btn btn-light" data-toggle="modal" data-target="#exampleModalCenter">
                      Update
                    </button>
                    <a href="#" onclick="return confirm('Are you sure you want to delete this item?');" class="card-link delete btn btn-light" id="${value._id}">Delete</a>
                  </div>
                </div>`)
      })
    } else {
      $("#btnplaceholder").show()
      $.each(filtered, function(index, value) {
        let condition = (dayCounter(value.deadline, value.status))
        $("#toDoList")
          .append(`<div class="card content bg-${condition} mb-2 text-white">
                  <div class="card-header"><h5 class="card-title">${value.name}</h5></div>
                  <div class="card-body">
                    <p class="card-subtitle mb-2">Deadline: ${value.deadline.slice(0,10)}</h6>
                    <p class="desc card-text">Description : ${value.description}</p>
                    <button type="button" id="${value._id}" class="updateTaskGroup mr-3 btn btn-light" data-toggle="modal" data-target="#editTaskGroupModal">
                      Update
                    </button>
                  </div>
                </div>`)
      })
    }


  })

  $("#declineInv").click((e) => {
    changeInvitationStatus($("#invitationList").val(), 'rejected')
  })

  $("#showMembers").click((e) => {
    let thisGroup = groups.filter(data => data._id == currentGroup)
    let currentGroupMembers = thisGroup[0].members
    $("#tabelBody").empty()
    $.each(currentGroupMembers, function(index, value) {
      $("#tabelBody").append(`<tr>
        <th scope="row">${index+1}</th>
        <td>${value.username}</td>
        <td>${value.email}</td>
      </tr>`)
    })
  })

})
